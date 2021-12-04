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

        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        vis.origin = [vis.width / 2 - 50, vis.height - 50];
        vis.scale = 20;
        vis.j = 10;
        vis.alpha = 0;
        vis.beta = 0;
        vis.startAngle = Math.PI;
        vis.cubesData = [];
        vis.rotateOffset = -Math.PI / 9;


        // var mx, my, mouseX, mouseY;
        vis.mx = 0;
        vis.my = 0;
        vis.mouseX = 0;
        vis.mouseY = 0;

        vis.cubes3D = d3._3d()
            .shape('CUBE')
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .z(function (d) {
                return d.z;
            })
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle + vis.rotateOffset)
            .origin(vis.origin)
            .scale(vis.scale);

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(d3.drag().on('drag', function() {vis.dragged();}).on('start', function() {vis.dragStart();}).on('end', function() {vis.dragEnd();}))
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.color = d3.scaleOrdinal(d3.schemeCategory20);
        vis.cubesGroup = vis.svg.append('g').attr('class', 'cubes');

        vis.wrangleData();
    }

    dragStart(){
        let vis = this;
        vis.mx = d3.event.x;
        vis.my = d3.event.y;
    }

    dragged(){
        let vis = this;

        vis.mouseX = vis.mouseX || 0;
        vis.mouseY = vis.mouseY || 0;
        vis.beta   = (d3.event.x - vis.mx + vis.mouseX) * Math.PI / 230 ;
        vis.alpha  = (d3.event.y - vis.my + vis.mouseY) * Math.PI / 230  * (-1);

        vis.processData(vis.cubes3D.rotateY(vis.beta + Math.PI).rotateX(vis.alpha - Math.PI+vis.rotateOffset)(vis.cubesData), 0, vis.ixscale, vis.jzscale);
    }

    dragEnd(){
        let vis = this;
        vis.mouseX = d3.event.x - vis.mx + vis.mouseX;
        vis.mouseY = d3.event.y - vis.my + vis.mouseY;
    }

    makeCube(h, x, z){
        return [
            {x: x - 1, y: h, z: z + 1}, // FRONT TOP LEFT
            {x: x - 1, y: 0, z: z + 1}, // FRONT BOTTOM LEFT
            {x: x + 1, y: 0, z: z + 1}, // FRONT BOTTOM RIGHT
            {x: x + 1, y: h, z: z + 1}, // FRONT TOP RIGHT
            {x: x - 1, y: h, z: z - 1}, // BACK  TOP LEFT
            {x: x - 1, y: 0, z: z - 1}, // BACK  BOTTOM LEFT
            {x: x + 1, y: 0, z: z - 1}, // BACK  BOTTOM RIGHT
            {x: x + 1, y: h, z: z - 1}, // BACK  TOP RIGHT
        ];
    }

    wrangleData(){
        let vis = this;
        console.log('current vis');
        console.log(vis);
        let ageRange = d3.select("#ScatterAge").property("value");
        let barScale = d3.select("#ScatterScale").property("value");

        let tempDisplayData = [];
        let popScale = [];

        if (ageRange=="all-together"){
            console.log("data array 1");
            console.log(vis.dataArr1);
            for (let i = 0; i < vis.dataArr1.length; i++) {
                tempDisplayData.push(vis.dataArr1[i]);
            }
            vis.ageLabels = vis.ageLabels1;
            popScale = vis.popVals1;
        }
        else if (ageRange=="young-and-old"){
            for (let i = 0; i < vis.dataArr2.length; i++) {
                tempDisplayData.push(vis.dataArr2[i]);
            }
            vis.ageLabels = vis.ageLabels2;
            popScale = vis.popVals2;
        }
        else if (ageRange=="all-separate"){
            for (let i = 0; i < vis.dataArr3.length; i++) {
                tempDisplayData.push(vis.dataArr3[i]);
            }
            vis.ageLabels = vis.ageLabels3;
            popScale = vis.popVals3;
        }

        if (barScale=="per-capita"){
            vis.displayData = tempDisplayData;
        }
        else if (barScale=="raw") {
            let scaledDisplayData = [];
            for (let i = 0; i < tempDisplayData.length; i++) {
                scaledDisplayData.push(tempDisplayData[i].map(x => x*popScale[i]));
            }
            vis.displayData = scaledDisplayData;
        }
        vis.updateVis();
    }

    updateVis(){
        let vis = this;
        vis.numrows = vis.displayData.length;
        vis.numcols = vis.displayData[0].length;

        vis.j=vis.numrows;
        vis.ixscale = d3.scaleLinear()
            .domain([0, vis.numrows])
            .range([-vis.j,vis.j])
        ;

        vis.jzscale = d3.scaleLinear()
            .domain([0, vis.numcols])
            .range([-5, 5])
        ;

        vis.heightscale = d3.scaleLinear()
            .domain([0,Math.max(vis.displayData[vis.displayData.length-1][1])])
            .range([0,.3])
        ;

        var cnt = 0;
        vis.cubesData = [];
        for (let i = 0; i < vis.numrows; i++) {
            for (let j = 0; j < vis.numcols; j++){

                var val = vis.displayData[i][j];
                var h = vis.heightscale(val);
                var _cube = vis.makeCube(h, vis.ixscale(i), vis.jzscale(j));
                _cube.id = 'cube_' + cnt++;
                _cube.height = h;
                _cube.val = val;
                _cube.age = vis.ageLabels[i];
                vis.cubesData.push(_cube);
            }
        }

        vis.grid3d = d3._3d()
            .shape('GRID', 20)
            .origin(origin)
            .rotateY( vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.point3d = d3._3d()
            .x(function(d){ return d.x; })
            .y(function(d){ return d.y; })
            .z(function(d){ return d.z; })
            .origin(origin)
            .rotateY( vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.yScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(origin)
            .rotateY( vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        // vis.initializeAxes();
        vis.processData(vis.cubes3D(vis.cubesData), 1000);

    }
    processData(data, tt){
        let vis = this;

        /* ----------- GRID ----------- */
        var key = ['x','y','z'][axisIndex];

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

        var points = svg.selectAll('circle').data(data[1], key);

        points
            .enter()
            .append('circle')
            .attr('class', '_3d')
            .attr('opacity', 0)
            .attr('cx', posPointX)
            .attr('cy', posPointY)
            .merge(points)
            .transition().duration(tt)
            .attr('r', 3)
            .attr('stroke', function(d){ return d3.color(color(d.id)).darker(3); })
            .attr('fill', function(d){ return color(d.id); })
            .attr('opacity', 1)
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
            .attr('d', vis.yScale3d.draw);

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







    //
    //
    // initVis(){
    //     let vis = this;
    //
    //     vis.margin = {top: 20, right: 10, bottom: 20, left: 40};
    //
    //     vis.width = 900 - vis.margin.left - vis.margin.right;
    //     vis.height = 500 - vis.margin.top - vis.margin.bottom;
    //
    //     // var origin = [vis.width/2-50, vis.height - 50], scale = 20, j = 10, cubesData = [], alpha = 0, beta = 0, startAngle = Math.PI;
    //     //
    //     // var rotateOffset = -Math.PI/9;
    //
    //     // SVG drawing area
    //     let svg = d3.select("#" + vis.parentElement).append("svg")
    //         .attr("width", vis.width + vis.margin.left + vis.margin.right)
    //         .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    //         .call(d3.drag().on('drag', draggedScatter).on('start', dragStartScatter).on('end', dragEndScatter))
    //         .append("g")
    //         .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    //
    //     var origin = [200, 300], j = 10, scale = 20, scatter = [], yLine = [], xGrid = [], beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
    //     var color  = d3.scaleOrdinal(d3.schemeCategory20);
    //     var mx, my, mouseX, mouseY;
    //
    //     var grid3d = d3._3d()
    //         .shape('GRID', 20)
    //         .origin(origin)
    //         .rotateY( startAngle)
    //         .rotateX(-startAngle)
    //         .scale(scale);
    //
    //     var point3d = d3._3d()
    //         .x(function(d){ return d.x; })
    //         .y(function(d){ return d.y; })
    //         .z(function(d){ return d.z; })
    //         .origin(origin)
    //         .rotateY( startAngle)
    //         .rotateX(-startAngle)
    //         .scale(scale);
    //
    //     var yScale3d = d3._3d()
    //         .shape('LINE_STRIP')
    //         .origin(origin)
    //         .rotateY( startAngle)
    //         .rotateX(-startAngle)
    //         .scale(scale);
    //
    //     function processDataScatter(data, tt){
    //
    //         /* ----------- GRID ----------- */
    //
    //         var xGrid = svg.selectAll('path.grid').data(data[0], key);
    //
    //         xGrid
    //             .enter()
    //             .append('path')
    //             .attr('class', '_3d grid')
    //             .merge(xGrid)
    //             .attr('stroke', 'black')
    //             .attr('stroke-width', 0.3)
    //             .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
    //             .attr('fill-opacity', 0.9)
    //             .attr('d', grid3d.draw);
    //
    //         xGrid.exit().remove();
    //
    //         /* ----------- POINTS ----------- */
    //
    //         var points = svg.selectAll('circle').data(data[1], key);
    //
    //         points
    //             .enter()
    //             .append('circle')
    //             .attr('class', '_3d')
    //             .attr('opacity', 0)
    //             .attr('cx', posPointX)
    //             .attr('cy', posPointY)
    //             .merge(points)
    //             .transition().duration(tt)
    //             .attr('r', 3)
    //             .attr('stroke', function(d){ return d3.color(color(d.id)).darker(3); })
    //             .attr('fill', function(d){ return color(d.id); })
    //             .attr('opacity', 1)
    //             .attr('cx', posPointX)
    //             .attr('cy', posPointY);
    //
    //         points.exit().remove();
    //
    //         /* ----------- y-Scale ----------- */
    //
    //         var yScale = svg.selectAll('path.yScale').data(data[2]);
    //
    //         yScale
    //             .enter()
    //             .append('path')
    //             .attr('class', '_3d yScale')
    //             .merge(yScale)
    //             .attr('stroke', 'black')
    //             .attr('stroke-width', .5)
    //             .attr('d', yScale3d.draw);
    //
    //         yScale.exit().remove();
    //
    //         /* ----------- y-Scale Text ----------- */
    //
    //         var yText = svg.selectAll('text.yText').data(data[2][0]);
    //
    //         yText
    //             .enter()
    //             .append('text')
    //             .attr('class', '_3d yText')
    //             .attr('dx', '.3em')
    //             .merge(yText)
    //             .each(function(d){
    //                 d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
    //             })
    //             .attr('x', function(d){ return d.projected.x; })
    //             .attr('y', function(d){ return d.projected.y; })
    //             .text(function(d){ return d[1] <= 0 ? d[1] : ''; });
    //
    //         yText.exit().remove();
    //
    //         svg.selectAll('._3d').sort(d3._3d().sort);
    //     }
    //
    //     function posPointX(d){
    //         return d.projected.x;
    //     }
    //
    //     function posPointY(d){
    //         return d.projected.y;
    //     }
    //
    //     function initScatter(){
    //         var cnt = 0;
    //         xGrid = [], scatter = [], yLine = [];
    //         for(var z = -j; z < j; z++){
    //             for(var x = -j; x < j; x++){
    //                 xGrid.push([x, 1, z]);
    //                 scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++});
    //             }
    //         }
    //
    //         d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });
    //
    //         var data = [
    //             grid3d(xGrid),
    //             point3d(scatter),
    //             yScale3d([yLine])
    //         ];
    //         processDataScatter(data, 1000);
    //     }
    //
    //     function dragStartScatter(){
    //         mx = d3.event.x;
    //         my = d3.event.y;
    //     }
    //
    //     function draggedScatter(){
    //         mouseX = mouseX || 0;
    //         mouseY = mouseY || 0;
    //         beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    //         alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
    //         var data = [
    //             grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
    //             point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter),
    //             yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
    //         ];
    //         processDataScatter(data, 0);
    //     }
    //
    //     function dragEndScatter(){
    //         mouseX = d3.event.x - mx + mouseX;
    //         mouseY = d3.event.y - my + mouseY;
    //     }
    //
    //     initScatter();
    // }

}