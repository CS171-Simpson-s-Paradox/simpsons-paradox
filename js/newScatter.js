class NewScatter {

    constructor(parentElement, caseVals1, ageLabels1, popVals1, caseVals2, ageLabels2, popVals2, caseVals3, ageLabels3, popVals3, colNames) {
        this.parentElement = parentElement;
        this.dataArr1 = caseVals1;
        this.ageLabels1 = ageLabels1;
        this.dataArr2 = caseVals2;
        this.ageLabels2 = ageLabels2;
        this.dataArr3 = caseVals3;
        this.ageLabels3 = ageLabels3;
        this.columnLabels = colNames;
        this.popVals1 = popVals1;
        this.popVals2 = popVals2;
        this.popVals3 = popVals3;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            // .call(d3.drag().on('drag', draggedScatter).on('start', dragStartScatter).on('end', dragEndScatter))
            .call(d3.drag().on('drag', function() {vis.draggedScatter();}).on('start', function() {vis.dragStartScatter();}).on('end', function() {vis.dragEndScatter();}))
            .on("click", function() {vis.controlledRotate();})
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.origin = [200, 300];
        vis.j = 10;
        vis.scale = 20;
        vis.scatter = [];
        vis.scattercolor = [];
        vis.rotateYAngles = [0, Math.PI/2, Math.PI/4];
        vis.rotateXAngles = [Math.PI/6, Math.PI/6, Math.PI/6];
        vis.rotateAngleSetting = 0;
        vis.yLine = [];
        vis.xGrid = [];
        vis.beta = 0;
        vis.alpha = 0;
        vis.key = function (d) {
            return d.id;
        };
        vis.startAngle = Math.PI / 4;
        vis.mx = 0;
        vis.my = 0;
        vis.mouseX = 0;
        vis.mouseY = 0;

        vis.grid3d = d3._3d()
            .shape('GRID', 20)
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.point3d = d3._3d()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .z(function (d) {
                return d.z;
            })
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.yScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.initScatter();
    }
     processDataScatter(tt){
        let vis = this;
        let data = vis.data;

        var points = vis.svg.selectAll('circle').data(data, vis.key);

        points
            .enter()
            .append('circle')
            .attr('class', '_3d')
            .attr('opacity', 0)
            .attr('cx', vis.posPointX)
            .attr('cy', vis.posPointY)
            .merge(points)
            .transition().duration(tt)
            .attr('r', 4)
            .attr('stroke', 'black' )
            .attr('fill', d => d.color)
            .attr('opacity', function (d){
                return (d.color=="red") ? 0.4 : 0.06;
            })
            .attr('cx', vis.posPointX)
            .attr('cy', vis.posPointY);

        points.exit().remove();

        vis.svg.selectAll('._3d').sort(d3._3d().sort);
        }

    posPointX(d){
        return d.projected.x;
    }

    posPointY(d){
        return d.projected.y;
    }
    initScatter(){
        let vis = this;
        var cnt = 0;
        vis.xGrid = [], vis.scatter = [], vis.yLine = [], vis.scattercolor = [];

        var zvals = [-4, -3.5, -3, 3, 3.5, 4];
        var xvals = [];
        for(var x = -5; x < 5; x++){
            xvals.push(3*x - 0.5);
            xvals.push(3*x);
            xvals.push(3*x+0.5);
        }
        let maxval = 0;
        let nReds = [];
        for (let i = 0; i <10; i++) {
            for (let k = 0; k < 2; k++) {
                if (vis.dataArr3[i][k] > maxval){
                    maxval = vis.dataArr3[i][k];
                }
            }
        }

        let zindex = 0;
        zvals.forEach(function(z){
            let xindex = 0;
            xvals.forEach(function(x){

                for (var j = 0; j < 5; j++){
                    let areaval = vis.dataArr3[Math.floor(xindex/3)][Math.floor(zindex/3)];
                    let prob = areaval/maxval;
                    let u = Math.random();
                    let mycolor = "grey";
                    if (u < prob){
                        mycolor = "red";
                    }
                    vis.scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++, color : mycolor});
                }
                xindex++;
            })
            zindex++;
        });

        vis.data = vis.point3d(vis.scatter);
        vis.processDataScatter(1000);
    }

    dragStartScatter(){
        let vis = this;
        vis.mx = d3.event.x;
        vis.my = d3.event.y;
    }

    draggedScatter(){
        let vis = this;
        vis.mouseX = vis.mouseX || 0;
        vis.mouseY = vis.mouseY || 0;
        vis.beta   = (d3.event.x - vis.mx + vis.mouseX) * Math.PI / 230 ;
        vis.alpha  = (d3.event.y - vis.my + vis.mouseY) * Math.PI / 230  * (-1);
        vis.data = vis.point3d.rotateY(vis.beta + vis.startAngle).rotateX(vis.alpha - vis.startAngle)(vis.scatter);
        vis.processDataScatter(0);
    }

    dragEndScatter(){
        let vis = this;
        vis.mouseX = d3.event.x - vis.mx + vis.mouseX;
        vis.mouseY = d3.event.y - vis.my + vis.mouseY;
    }

    controlledRotate(){
        let vis = this;

        vis.rotateYAngle = vis.rotateYAngles[vis.rotateAngleSetting];
        vis.rotateXAngle = vis.rotateXAngles[vis.rotateAngleSetting];

        vis.data = vis.point3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)(vis.scatter);

        vis.rotateAngleSetting = (vis.rotateAngleSetting+1)%3;
        vis.processDataScatter(1000);
    }

}