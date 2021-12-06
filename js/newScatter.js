class NewScatter {

    constructor(parentElement, caseVals1, ageLabels1, popVals1, caseVals2, ageLabels2, popVals2, caseVals3, ageLabels3, popVals3, colNames) {
        this.parentElement = parentElement;
        this.dataArr1 = caseVals1;
        this.ageLabels1 = ageLabels1;
        this.dataArr2 = caseVals2;
        this.ageLabels2 = ageLabels2;
        this.dataArr3 = caseVals3;
        this.ageLabels3 = ageLabels3;
        this.vaxLabels = ['Unvaccinated', 'Double Dose'];
        this.columnLabels = colNames;
        this.popVals1 = popVals1;
        this.popVals2 = popVals2;
        this.popVals3 = popVals3;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 1000 - vis.margin.left - vis.margin.right;
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            // .call(d3.drag().on('drag', draggedScatter).on('start', dragStartScatter).on('end', dragEndScatter))
            .call(d3.drag().on('drag', function() {vis.draggedScatter();}).on('start', function() {vis.dragStartScatter();}).on('end', function() {vis.dragEndScatter();}))
            .on("click", function() {vis.controlledRotate();})
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.origin = [500, 300];
        vis.j = 10;
        vis.scale = 20;
        vis.scatter = [];
        vis.scattercolor = [];
        vis.rotateYAngles = [-Math.PI/2, 0, Math.PI/4];
        vis.rotateXAngles = [ Math.PI/12, Math.PI/6, Math.PI/6];
        vis.rotatePerspectives = ['Relative Risk of Severe Case by Vax Status', 'Relative Risk of Severe Case by Age', 'Relative Risk of Severe Case by Age and Vax Status'];
        vis.rotateAngleSetting = 0;
        vis.yLine = [];
        vis.ageLine = [];
        vis.vaxLine = [];
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
        //
        // vis.yScale3d = d3._3d()
        //     .shape('LINE_STRIP')
        //     .origin(vis.origin)
        //     .rotateY(vis.startAngle)
        //     .rotateX(-vis.startAngle)
        //     .scale(vis.scale);

        vis.ageScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            // .opacity(0.1)
            .scale(vis.scale);

        vis.vaxScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);
        //
        // d3.range(-1, 11, 1).forEach(function(d){
        //     vis.yLine.push([-vis.j, -d, -vis.j]); });
        //

        d3.range(-25, 25, 5).forEach(function(d){
            vis.ageLine.push([d, 0, -vis.j]); });


        // d3.range(-7, 8, 14).forEach(function(d){
        //     vis.vaxLine.push([-10, -10, d]); });
        //
        vis.vaxLine = [
            [-10,0,-10],
            [-10,0,6]
        ]

        // console.log("#$^%#$");
        // console.log(vis.yLine);

        vis.initScatter();
    }
     processDataScatter(tt){
        let vis = this;
        let data = vis.data;

        var points = vis.svg.selectAll('circle').data(data[0], vis.key);

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
         //
         // /* ----------- y-Scale ----------- */
         //
         // var yScale = vis.svg.selectAll('path.yScale').data(data[1]);
         //
         // yScale
         //     .enter()
         //     .append('path')
         //     .attr('class', '_3d yScale')
         //     .merge(yScale)
         //     .attr('stroke', 'black')
         //     .attr('stroke-width', .5)
         //     .attr('d', vis.yScale3d.draw);
         //
         // yScale.exit().remove();

         /* ----------- age-Scale ----------- */

         var ageScale = vis.svg.selectAll('path.ageScale').data(data[1]);

         ageScale
             .enter()
             .append('path')
             .attr('class', '_3d ageScale')
             .merge(ageScale)
             .attr('stroke', 'black')
             .attr('stroke-width', .5)
             .attr('opacity',function(d){
                 if (vis.rotateAngleSetting==1 || vis.rotateAngleSetting==2){
                     return 1;
                 }
                 else{
                     return 0;
                 }
             })
             .attr('d', vis.ageScale3d.draw);

         ageScale.exit().remove();

         /* ----------- vax-Scale ----------- */

         var vaxScale = vis.svg.selectAll('path.vaxScale').data(data[2]);

         vaxScale
             .enter()
             .append('path')
             .attr('class', '_3d vaxScale')
             .merge(vaxScale)
             .attr('stroke', 'black')
             .attr('stroke-width', .5)
             .attr('opacity',function(d){
                 if (vis.rotateAngleSetting==0 || vis.rotateAngleSetting==2 ){
                     return 1;
                 }
                 else{
                     return 0;
                 }
             })
             .attr('d', vis.vaxScale3d.draw);

         vaxScale.exit().remove();
         //
         // /* ----------- y-Scale Text ----------- */
         //
         // var yText = vis.svg.selectAll('text.yText').data(data[1][0]);
         //
         // yText
         //     .enter()
         //     .append('text')
         //     .attr('class', '_3d yText')
         //     .attr('dx', '.3em')
         //     .merge(yText)
         //     .each(function(d){
         //         d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
         //     })
         //     .attr('x', function(d){ return d.projected.x; })
         //     .attr('y', function(d){ return d.projected.y; })
         //     .text(function(d){ return d[1] <= 0 ? d[1] : ''; });
         //
         // yText.exit().remove();

         /* ----------- age-Scale Text ----------- */

         var ageText = vis.svg.selectAll('text.ageText').data(data[1][0]);

         ageText
             .enter()
             .append('text')
             .attr('class', '_3d ageText')
             .attr('dx', '.3em')
             .attr('fontsize', 40)
             .merge(ageText)
             .each(function(d){
                 d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
             })
             .attr('x', function(d){ return d.projected.x; })
             .attr('y', function(d){ return d.projected.y; })
             .text(function(d, index){
                 if (vis.rotateAngleSetting==1 || vis.rotateAngleSetting==2){
                     return vis.ageLabels3[index];
                 }
                 else{
                     return "";
                 }
             });

         ageText.exit().remove();

         /* ----------- vax-Scale Text ----------- */

         var vaxText = vis.svg.selectAll('text.vaxText').data(data[2][0]);

         vaxText
             .enter()
             .append('text')
             .attr('class', '_3d vaxText')
             .attr('dx', '.3em')
             .merge(vaxText)
             .each(function(d){
                 d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
             })
             .attr('x', function(d){ return d.projected.x; })
             .attr('y', function(d){ return d.projected.y; })
             // .text(function(d, index){ return vis.vaxLabels[index];; });
             .text(function(d, index){
                 if (vis.rotateAngleSetting==0 || vis.rotateAngleSetting==2){
                     return vis.vaxLabels[index];
                 }
                 else{
                     return "";
                 }
            });

         vaxText.exit().remove();

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
        vis.scatter = [];

        var zmin = -8;
        var zmax = 8;
        var zvals = [zmin, zmin+0.5, zmin+1, zmin+1.5, zmin+2, zmax-2, zmax-1.5, zmax-1, zmax-0.5, zmax];
        var xvals = [];
        var localBarDim = 5;
        var barColNumPoints = 4;
        var xbargap = 5;
        for(var x = -5; x < 5; x++){
            xvals.push(xbargap*x - 1);
            xvals.push(xbargap*x - 0.5);
            xvals.push(xbargap*x);
            xvals.push(xbargap*x+0.5);
            xvals.push(xbargap*x+1);
        }
        let maxval = 0;
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

                for (var j = 0; j < barColNumPoints; j++){
                    let areaval = vis.dataArr3[Math.floor(xindex/localBarDim)][Math.floor(zindex/localBarDim)];
                    let prob = 2*areaval/maxval;
                    // let prob = 0.1;  //.01 + 0.5*areaval/maxval;
                    let u = Math.random();
                    let mycolor = "grey";
                    if (u < prob){
                        mycolor = "red";
                        // let mylabel = "hello";
                        vis.scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++, color : mycolor});
                    }
                    // vis.scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++, color : mycolor});
                }
                xindex++;
            })
            zindex++;
        });
        vis.data = [
            vis.point3d(vis.scatter),
            vis.ageScale3d([vis.ageLine]),
            vis.vaxScale3d([vis.vaxLine])
            ];
        vis.controlledRotate();
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

        vis.data = [
            vis.point3d.rotateY(vis.beta + vis.startAngle).rotateX(vis.alpha - vis.startAngle)(vis.scatter),
            vis.ageScale3d.rotateY(vis.beta + vis.startAngle).rotateX(vis.alpha - vis.startAngle)([vis.ageLine]),
            vis.vaxScale3d.rotateY(vis.beta + vis.startAngle).rotateX(vis.alpha - vis.startAngle)([vis.vaxLine])
        ];
        d3.selectAll('h3')
            .text(vis.rotatePerspectives[2])
        ;
        vis.rotateAngleSetting = 2;
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

        vis.data = [
            vis.point3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)(vis.scatter),
            vis.ageScale3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)([vis.ageLine]),
            vis.vaxScale3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)([vis.vaxLine]),
        ];
        let displaytext = vis.rotatePerspectives[vis.rotateAngleSetting];

        d3.selectAll(".scatterTitle")
            .text(displaytext)
        ;
        vis.processDataScatter(1000);

        vis.rotateAngleSetting = (vis.rotateAngleSetting+1)%3;


    }

}