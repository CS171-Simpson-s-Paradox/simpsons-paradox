
class MyHist {

    constructor(parentElement, dataArr, ageLabels) {
        this.parentElement = parentElement;
        this.dataArr = dataArr
        this.ageLabels = ageLabels;

        this.initVis();
    }

    /*
     * Initialize visualization
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;


        vis.startAngle = Math.PI/6;
        vis.origin = [400, 0.9*vis.height];
        vis.scale = 20;
        vis.alpha = 0;
        vis.beta = 0;
        vis.color  = d3.scaleOrdinal(d3.schemeCategory20);

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd))
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.cubesGroup = vis.svg.append('g').attr('class', 'cubes');

        vis.cubes3D = d3._3d()
            .shape('CUBE')
            .x(function(d){ return d.x; })
            .y(function(d){ return d.y; })
            .z(function(d){ return d.z; })
            .rotateY( vis.startAngle)
            .rotateX(-vis.startAngle)
            .origin(vis.origin)
            .scale(vis.scale)
        ;

        vis.processData = function(data, tt, cubeGroup, cubes3D, origin, scale, color){
            //let vis = this;
            /* --------- CUBES ---------*/

            var cubes = cubeGroup.selectAll('g.cube').data(data, function(d){ return d.id });

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
                return [{height: d.height, centroid: _t[0].centroid}];
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
                    var i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
                    return function(t){
                        that.text(i(t).toFixed(1));
                    };
                });

            texts.exit().remove();

            /* --------- SORT TEXT & FACES ---------*/
            ce.selectAll('._3d').sort(d3._3d().sort);
        }

        function dragStart(){

            vis.mx = d3.event.x;
            vis.my = d3.event.y;
        }

        function dragged(){
            vis.mouseX = vis.mouseX || 0;
            vis.mouseY = vis.mouseY || 0;
            vis.beta   = (d3.event.x - vis.mx + vis.mouseX) * Math.PI / 230 ;
            vis.alpha  = (d3.event.y - vis.my + vis.mouseY) * Math.PI / 230  * (-1);
            // vis.updateVis(0);
            vis.processData(vis.cubes3D.rotateY(vis.beta + vis.startAngle).rotateX(vis.alpha - vis.startAngle)(vis.cubesData), 0, vis.cubesGroup, vis.cubes3D, vis.origin, vis.scale, vis.color);
        }

        function dragEnd(){
            let vis = this;
            vis.mouseX = d3.event.x - vis.mx + vis.mouseX;
            vis.mouseY = d3.event.y - vis.my + vis.mouseY;
        }

        vis.wrangleData(1000);
    }

    wrangleData(transitionTime){
        let vis = this;

        vis.displayData = vis.dataArr;


        vis.j=10;
        vis.numrows = vis.displayData.length;
        vis.numcols = vis.displayData[0].length;

        vis.ixscale = d3.scaleLinear()
            .domain([0, vis.numrows -1])
            .range([-vis.j,vis.j])
        ;

        vis.jzscale = d3.scaleLinear()
            .domain([0, vis.numcols -1])
            .range([-vis.j/2, vis.j/2])
        ;

        vis.heightscale = d3.scaleLinear()
            .domain([0,1000])
            .range([0, 3*Math.log(1+vis.height)])
        ;

        let cubesData = [];
        let cnt=0;
        for (let i = 0; i < vis.numrows; i++) {
            for (let j = 0; j < vis.numcols; j++){

                var val = vis.displayData[i][j];
                var h = vis.heightscale(val);
                var _cube = vis.makeCube(h, vis.ixscale(i), vis.jzscale(j));
                _cube.id = 'cube_' + cnt++;
                _cube.height = h;
                _cube.val = val;
                _cube.age = vis.ageLabels[i];
                cubesData.push(_cube);
            }
        }
        vis.processData(vis.cubes3D(cubesData), 1000, vis.cubesGroup, vis.cubes3D, vis.origin, vis.scale, vis.color);
        // process
        // vis.updateVis(transitionTime);
    }

    // updateVis(transitionTime){
    //     let vis = this;
    //
    //     vis.cubes3D
    //         .rotateY( vis.startAngle + vis.beta)
    //         .rotateX(-vis.startAngle + vis.alpha)
    //         ;
    //
    //     let cubes = vis.cubesGroup.selectAll('g.cube').data(vis.cubes3D(vis.cubesData), function(d){ return d.id });
    //
    //     var ce = cubes
    //         .enter()
    //         .append('g')
    //         .attr('class', 'cube')
    //         .attr('fill', function(d){ return vis.color(d.id); })
    //         .attr('stroke', function(d){ return d3.color(vis.color(d.id)).darker(2); })
    //         .merge(cubes)
    //         .sort(vis.cubes3D.sort);
    //
    //     cubes.exit().remove();
    //
    //
    //     /* --------- FACES ---------*/
    //
    //     var faces = cubes.merge(ce).selectAll('path.face').data(function(d){ return d.faces; }, function(d){ return d.face; });
    //
    //     faces.enter()
    //         .append('path')
    //         .attr('class', 'face')
    //         .attr('fill-opacity', 0.95)
    //         .classed('_3d', true)
    //         .merge(faces)
    //         .transition().duration(transitionTime)
    //         .attr('d', vis.cubes3D.draw);
    //
    //     faces.exit().remove();
    //
    //     /* --------- TEXT ---------*/
    //
    //     var bartexts = cubes.merge(ce)//.append('g')
    //         // .attr('id', 'bartexts')
    //         .selectAll('text.text').data(function(d){
    //             var _t = d.faces.filter(function(d){
    //                 return d.face === 'top';
    //             });
    //             return [{height: d.val, centroid: _t[0].centroid}];
    //         });
    //
    //     bartexts
    //         .enter()
    //         .append('text')
    //         .attr('class', 'text')
    //         .attr('dy', '-.7em')
    //         .attr('text-anchor', 'middle')
    //         .attr('font-family', 'sans-serif')
    //         .attr('font-weight', 'bolder')
    //         .attr('x', function(d){
    //             // console.log(d);
    //             // console.log(vis.origin[0]);
    //             // console.log(vis.scale);
    //             // console.log(d.centroid.x);
    //             // console.log(vis.origin[0] + vis.scale * d.centroid.x);
    //             return vis.origin[0] + vis.scale * d.centroid.x; })
    //         .attr('y', function(d){ return vis.origin[1] + vis.scale * d.centroid.y })
    //         .classed('_3d', true)
    //         .merge(bartexts)
    //         .transition().duration(transitionTime)
    //         .attr('fill', 'black')
    //         .attr('stroke', 'none')
    //         .attr('x', function(d){ return vis.origin[0] + vis.scale * d.centroid.x })
    //         .attr('y', function(d){ return vis.origin[1] + vis.scale * d.centroid.y })
    //         .tween('text', function(d){
    //             var that = d3.select(this);
    //             var i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
    //             return function(t){
    //                 that.text(i(t).toFixed(1));
    //             };
    //         });
    //
    //     bartexts.exit().remove();

        //
        //
        //
        // var agetexts = cubes.merge(ce).append('g')
        //     .attr('id', 'agetexts')
        //     .selectAll('text.text').data(function(d){
        //     var _t = d.faces.filter(function(d){
        //         return d.face === 'top';
        //     });
        //     return [{age: d.age, centroid: _t[0].centroid}];
        // });
        //
        // agetexts
        //     .enter()
        //     .append('text')
        //     .attr('class', 'text')
        //     .attr('dy', '-.7em')
        //     .attr('text-anchor', 'middle')
        //     .attr('font-family', 'sans-serif')
        //     .attr('font-weight', 'bolder')
        //     .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
        //     .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
        //     // .attr('y', function(d){ return origin[1] + scale})
        //     .classed('_3d', true)
        //     .merge(agetexts)
        //     .transition().duration(tt)
        //     .attr('fill', 'black')
        //     .attr('stroke', 'none')
        //     .attr('x', function(d){ return origin[0] + scale * d.centroid.x })
        //     .attr('y', function(d){ return origin[1] + scale * d.centroid.y })
        //     // .attr('y', function(d){ return origin[1] + scale})
        //     // .text(d=>d.age)
        //     // ;
        //     .tween('text', function(d){
        //         var that = d3.select(this)
        //         // console.log('^^^');
        //         // console.log(d.age);
        //         var i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
        //         return function(t){
        //             that.text(i(t).toFixed(1));
        //         };
        //     });
        //
        // agetexts.exit().remove();
        //


        /* --------- SORT TEXT & FACES ---------*/
        // ce.selectAll('._3d').sort(d3._3d().sort);
    // }

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

}