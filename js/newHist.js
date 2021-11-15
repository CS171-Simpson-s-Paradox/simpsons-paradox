
class NewHist {

    constructor(parentElement, dataArr, ageLabels, columnLabels) {
        this.parentElement = parentElement;
        this.dataArr = dataArr;
        this.ageLabels = ageLabels;
        this.columnLabels = columnLabels;
        this.initVis();
    }
    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        var origin = [vis.width/2-50, vis.height - 50], scale = 20, j = 10, cubesData = [], alpha = 0, beta = 0, startAngle = Math.PI;

        var rotateOffset = -Math.PI/9;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd))
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        var color  = d3.scaleOrdinal(d3.schemeCategory20);
        var cubesGroup = vis.svg.append('g').attr('class', 'cubes');
        var mx, my, mouseX, mouseY;

        var cubes3D = d3._3d()
            .shape('CUBE')
            .x(function(d){ return d.x; })
            .y(function(d){ return d.y; })
            .z(function(d){ return d.z; })
            .rotateY( startAngle)
            .rotateX(-startAngle+rotateOffset)
            .origin(origin)
            .scale(scale);

        function processData(data, tt){

            /* --------- CUBES ---------*/

            var cubes = cubesGroup.selectAll('g.cube').data(data, function(d){ return d.id });

            var ce = cubes
                .enter()
                .append('g')
                .attr('class', 'cube')
                .attr('fill', function(d){ return color(d.id); })
                .attr('stroke', function(d){ return d3.color(color(d.id)).darker(2); })
                .merge(cubes)
                .sort(cubes3D.sort);

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
                .attr('d', cubes3D.draw);

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
                .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
                .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
                .classed('_3d', true)
                .merge(texts)
                .transition().duration(tt)
                .attr('fill', 'black')
                .attr('stroke', 'none')
                .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
                .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
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

        function dragStart(){
            mx = d3.event.x;
            my = d3.event.y;
        }

        function dragged(){
            mouseX = mouseX || 0;
            mouseY = mouseY || 0;
            beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
            alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
            processData(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle+rotateOffset)(cubesData), 0, vis.ixscale, vis.jzscale);
        }

        function dragEnd(){
            mouseX = d3.event.x - mx + mouseX;
            mouseY = d3.event.y - my + mouseY;
        }

        function makeCube(h, x, z){
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

        vis.displayData = vis.dataArr;

        vis.numrows = vis.displayData.length;
        vis.numcols = vis.displayData[0].length;
        // when j= 10,
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
        for (let i = 0; i < vis.numrows; i++) {
            for (let j = 0; j < vis.numcols; j++){

                var val = vis.displayData[i][j];
                var h = vis.heightscale(val);
                var _cube = makeCube(h, vis.ixscale(i), vis.jzscale(j));
                _cube.id = 'cube_' + cnt++;
                _cube.height = h;
                _cube.val = val;
                _cube.age = vis.ageLabels[i];
                cubesData.push(_cube);
            }
        }
        processData(cubes3D(cubesData), 1000);
    }
}