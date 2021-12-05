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










    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 250 - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(d3.drag().on('drag', draggedScatter).on('start', dragStartScatter).on('end', dragEndScatter))
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        var origin = [200, 300], j = 10, scale = 20, scatter = [], yLine = [], xGrid = [], beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
        var color  = d3.scaleOrdinal(d3.schemeCategory20);
        var mx, my, mouseX, mouseY;

        var grid3d = d3._3d()
            .shape('GRID', 20)
            .origin(origin)
            .rotateY( startAngle)
            .rotateX(-startAngle)
            .scale(scale);

        var point3d = d3._3d()
            .x(function(d){ return d.x; })
            .y(function(d){ return d.y; })
            .z(function(d){ return d.z; })
            .origin(origin)
            .rotateY( startAngle)
            .rotateX(-startAngle)
            .scale(scale);

        var yScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(origin)
            .rotateY( startAngle)
            .rotateX(-startAngle)
            .scale(scale);

        function processDataScatter(data, tt){

            /* ----------- GRID ----------- */

            var xGrid = vis.svg.selectAll('path.grid').data(data[0], key);

            xGrid
                .enter()
                .append('path')
                .attr('class', '_3d grid')
                .merge(xGrid)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.3)
                .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
                .attr('fill-opacity', 0.9)
                .attr('d', grid3d.draw);

            xGrid.exit().remove();

            /* ----------- POINTS ----------- */

            var points = vis.svg.selectAll('circle').data(data[1], key);

            points
                .enter()
                .append('circle')
                .attr('class', '_3d')
                .attr('opacity', 0)
                .attr('cx', posPointX)
                .attr('cy', posPointY)
                .merge(points)
                .transition().duration(tt)
                .attr('r', 5)
                .attr('stroke', function(d){ return d3.color(color(d.id)).darker(3); })
                .attr('fill', function(d){
                    let randomNumber = Math.random();
                    let prob = .1;
                    if (randomNumber < prob){
                        return "red";
                    }
                    else {return "grey";}
                    // return color(d.id);
                })
                .attr('opacity', function(d){
                    let randomNumber = Math.random();
                    let prob = .1;
                    if (randomNumber < prob){
                        return "red";
                    }
                    else {return "grey";}
                    // return color(d.id);
                })
                .attr('opacity', .6)
                .attr('cx', posPointX)
                .attr('cy', posPointY);

            points.exit().remove();

            /* ----------- y-Scale ----------- */

            var yScale = vis.svg.selectAll('path.yScale').data(data[2]);

            yScale
                .enter()
                .append('path')
                .attr('class', '_3d yScale')
                .merge(yScale)
                .attr('stroke', 'black')
                .attr('stroke-width', .5)
                .attr('d', yScale3d.draw);

            yScale.exit().remove();

            /* ----------- y-Scale Text ----------- */

            var yText = vis.svg.selectAll('text.yText').data(data[2][0]);

            yText
                .enter()
                .append('text')
                .attr('class', '_3d yText')
                .attr('dx', '.3em')
                .merge(yText)
                .each(function(d){
                    d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
                })
                .attr('x', function(d){ return d.projected.x; })
                .attr('y', function(d){ return d.projected.y; })
                .text(function(d){ return d[1] <= 0 ? d[1] : ''; });

            yText.exit().remove();

            vis.svg.selectAll('._3d').sort(d3._3d().sort);
        }

        function posPointX(d){
            return d.projected.x;
        }

        function posPointY(d){
            return d.projected.y;
        }

        function initScatter(){
            var cnt = 0;
            let numPointsAcross = 2*j;
            xGrid = [], scatter = [], yLine = [];
            for(var z = -numPointsAcross/2; z < numPointsAcross/2; z++){
                for(var x = -numPointsAcross/2; x < numPointsAcross/2; x++){
                    xGrid.push([x, 1, z]);
                    scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++});
                }
            }

            d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

            var data = [
                grid3d(xGrid),
                point3d(scatter),
                yScale3d([yLine])
            ];
            processDataScatter(data, 1000);
        }

        function dragStartScatter(){
            mx = d3.event.x;
            my = d3.event.y;
        }

        function draggedScatter(){
            mouseX = mouseX || 0;
            mouseY = mouseY || 0;
            beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
            alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
            var data = [
                grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
                point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter),
                yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
            ];
            processDataScatter(data, 0);
        }

        function dragEndScatter(){
            mouseX = d3.event.x - mx + mouseX;
            mouseY = d3.event.y - my + mouseY;
        }

        initScatter();
    }

}