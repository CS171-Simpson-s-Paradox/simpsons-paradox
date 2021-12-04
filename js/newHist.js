
class NewHist {

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
        let ageRange = d3.select("#HistAge").property("value");
        let barScale = d3.select("#HistScale").property("value");

        let tempDisplayData = [];
        let popScale = [];

        if (ageRange=="all-together"){
            console.log("ding");
            // tempDisplayData = vis.dataArr1;
            // tempDisplayData = [...vis.dataArr1];
            for (let i = 0; i < vis.dataArr1.length; i++) {
                tempDisplayData.push(vis.dataArr1[i]);
            }
            vis.ageLabels = vis.ageLabels1;
            popScale = vis.popVals1;
        }
        else if (ageRange=="young-and-old"){
            console.log("dong");
            // tempDisplayData = vis.dataArr2;
            // tempDisplayData = [...vis.dataArr2];
            for (let i = 0; i < vis.dataArr2.length; i++) {
                tempDisplayData.push(vis.dataArr2[i]);
            }
            vis.ageLabels = vis.ageLabels2;
            popScale = vis.popVals2;
        }
        else if (ageRange=="all-separate"){
            console.log("deng");
            // tempDisplayData = vis.dataArr3;
            // tempDisplayData = [...vis.dataArr3];
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
        vis.initializeAxes();
        vis.processData(vis.cubes3D(vis.cubesData), 1000);

    }
    processData(data, tt){
        let vis = this;
        /* --------- CUBES ---------*/

        var cubes = vis.cubesGroup.selectAll('g.cube').data(data, function(d){ return d.id });

        var ce = cubes
            .enter()
            .append('g')
            .attr('class', 'cube')
            .attr('fill', function(d){ return vis.color(d.id); })
            .attr('stroke', function(d){ return d3.color(vis.color(d.id)).darker(2); })
            .merge(cubes)
            .sort(vis.cubes3D.sort);

        cubes.exit().remove();

        /* --------- FACES ---------*/

        var faces = cubes.merge(ce).selectAll('path.face').data(function(d){ return d.faces; }, function(d){ return d.face; });

        faces.enter()
            .append('path')
            .attr('class', 'face')
            .attr('fill-opacity', 0.95)
            .classed('_3d', true)
            .merge(faces)
            .transition().duration(tt)
            .attr('d', vis.cubes3D.draw);

        faces.exit().remove();

        /* --------- TEXT ---------*/

        var texts = cubes.merge(ce).selectAll('text.text').data(function(d){
            var _t = d.faces.filter(function(d){
                return d.face === 'top';
            });
            return [{val: d.val, centroid: _t[0].centroid}];
        });

        texts
            .enter()
            .append('text')
            .attr('class', 'text')
            .attr('dy', '-.7em')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-weight', 'bolder')
            .attr('x', function(d){ return vis.origin[0] + vis.scale * d.centroid.x })
            .attr('y', function(d){ return vis.origin[1] + vis.scale * d.centroid.y })
            .classed('_3d', true)
            .merge(texts)
            .transition().duration(tt)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', function(d){ return vis.origin[0] + vis.scale * d.centroid.x })
            .attr('y', function(d){ return vis.origin[1] + vis.scale * d.centroid.y })
            .tween('text', function(d){
                var that = d3.select(this);
                var i = d3.interpolateNumber(+that.text(), Math.abs(d.val));
                return function(t){
                    that.text(i(t).toFixed(1));
                };
            });

        texts.exit().remove();

        /* --------- SORT TEXT & FACES ---------*/

        ce.selectAll('._3d').sort(d3._3d().sort);
    }


    // Initialize the axes lines and labels.
    initializeAxes() {
        let vis = this;
        vis.axisRange = [0,10];
        vis.scales = [];
        vis.initializeAxis(0);
        vis.initializeAxis(1);
        vis.initializeAxis(2);
    }

    initializeAxis( axisIndex )
    {
        let vis = this;
        var key = ['x','y','z'][axisIndex];
        vis.drawAxis( axisIndex, key, 0 );

        var scaleMin = vis.axisRange[0];
        var scaleMax = vis.axisRange[1];

        // the axis line
        var newAxisLine = vis.svg.append("transform")
            .attr("class", vis.axisName("Axis", axisIndex))
            .attr("rotation", ([[0,0,0,0],[0,0,1,Math.PI/2],[0,1,0,-Math.PI/2]][axisIndex]))
            .append("shape")
        newAxisLine
            .append("appearance")
            .append("material")
            .attr("emissiveColor", "lightgray")
        newAxisLine
            .append("polyline2d")
            // Line drawn along y axis does not render in Firefox, so draw one
            // along the x axis instead and rotate it (above).
            .attr("lineSegments", "0 0," + scaleMax + " 0")

        // axis labels
        var newAxisLabel = vis.svg.append("transform")
            .attr("class", vis.axisName("AxisLabel", axisIndex))
            .attr("translation", vis.constVecWithAxisValue( 0, scaleMin + 1.1 * (scaleMax-scaleMin), axisIndex ))

        var newAxisLabelShape = newAxisLabel
            .append("billboard")
            .attr("axisOfRotation", "0 0 0") // face viewer
            .append("shape")
            .call(vis.makeSolid)

        var labelFontSize = 0.6;

        newAxisLabelShape
            .append("text")
            .attr("class", vis.axisName("AxisLabelText", axisIndex))
            .attr("solid", "true")
            .attr("string", key)
            .append("fontstyle")
            .attr("size", labelFontSize)
            .attr("family", "SANS")
            .attr("justify", "END MIDDLE" )
    }


    // Helper functions for initializeAxis() and drawAxis()
    axisName( name, axisIndex ) {
        return ['x','y','z'][axisIndex] + name;
    }

    constVecWithAxisValue( otherValue, axisValue, axisIndex ) {
        var result = [otherValue, otherValue, otherValue];
        result[axisIndex] = axisValue;
        return result;
    }

    // Assign key to axis, creating or updating its ticks, grid lines, and labels.
    drawAxis( axisIndex, key, duration ) {

        let vis = this;

        var scale = d3.scaleLinear()
            .domain( [-5,5] ) // demo data range
            .range( vis.axisRange )

        vis.scales[axisIndex] = scale;

        // var axisName = ['x','y','z'][axisIndex];

        var numTicks = 8;
        var tickSize = 0.1;
        var tickFontSize = 0.5;

        // ticks along each axis
        var ticks = vis.svg.selectAll( "."+vis.axisName("Tick", axisIndex) )
            .data( scale.ticks( numTicks ));
        var newTicks = ticks.enter()
            .append("transform")
            .attr("class", vis.axisName("Tick", axisIndex));
        newTicks.append("shape").call(vis.makeSolid)
            .append("box")
            .attr("size", tickSize + " " + tickSize + " " + tickSize);
        // enter + update
        ticks.transition().duration(duration)
            .attr("translation", function(tick) {
                return vis.constVecWithAxisValue( 0, scale(tick), axisIndex ); })
        ticks.exit().remove();

        // tick labels
        var tickLabels = ticks.selectAll("billboard shape text")
            .data(function(d) { return [d]; });
        var newTickLabels = tickLabels.enter()
            .append("billboard")
            .attr("axisOfRotation", "0 0 0")
            .append("shape")
            .call(vis.makeSolid)
        newTickLabels.append("text")
            .attr("string", scale.tickFormat(10))
            .attr("solid", "true")
            .append("fontstyle")
            .attr("size", tickFontSize)
            .attr("family", "SANS")
            .attr("justify", "END MIDDLE" );
        tickLabels // enter + update
            .attr("string", scale.tickFormat(10))
        tickLabels.exit().remove();

        // base grid lines
        if (axisIndex==0 || axisIndex==2) {

            var gridLines = vis.svg.selectAll( "."+vis.axisName("GridLine", axisIndex))
                .data(scale.ticks( numTicks ));
            gridLines.exit().remove();

            var newGridLines = gridLines.enter()
                .append("transform")
                .attr("class", vis.axisName("GridLine", axisIndex))
                .attr("rotation", axisIndex==0 ? [0,1,0, -Math.PI/2] : [0,0,0,0])
                .append("shape")

            newGridLines.append("appearance")
                .append("material")
                .attr("emissiveColor", "gray")
            newGridLines.append("polyline2d");

            gridLines.selectAll("shape polyline2d").transition().duration(duration)
                .attr("lineSegments", "0 0, " + vis.axisRange[1] + " 0")

            gridLines.transition().duration(duration)
                .attr("translation", axisIndex==0
                    ? function(d) { return scale(d) + " 0 0"; }
                    : function(d) { return "0 0 " + scale(d); }
                )
        }
    }

    makeSolid(selection, color) {
        selection.append("appearance")
            .append("material")
            .attr("diffuseColor", color||"black")
        return selection;
    }
}