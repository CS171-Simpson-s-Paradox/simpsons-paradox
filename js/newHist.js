
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

        vis.width = 1200 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        vis.origin = [vis.width / 2 + 50, vis.height - 50];
        vis.scale = 30;
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
        vis.tt = 0;
        vis.updateVis();
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

        vis.ageRange = ageRange;

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
        vis.tt = 1000;
        vis.updateVis();
    }

    updateVis(){
        let vis = this;
        vis.numrows = vis.displayData.length;
        vis.numcols = vis.displayData[0].length;
        let maxval = 0;
        for (let i = 0; i <vis.numrows; i++) {
            for (let k = 0; k < vis.numcols; k++) {
                if (vis.displayData[i][k] > maxval){
                    maxval = vis.displayData[i][k];
                }
            }
        }
        vis.colorScale = d3.scaleLinear()
            .domain([0, maxval])
            .range([0.5, 1]);

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
        vis.cubeLabels = []
        for (let i = 0; i < vis.numrows; i++) {
            for (let j = 0; j < vis.numcols; j++){

                var val = vis.displayData[i][j];
                var h = vis.heightscale(val);
                var _cube = vis.makeCube(h, vis.ixscale(i), vis.jzscale(j));
                _cube.id = 'cube_' + cnt++;
                _cube.height = h;
                _cube.val = val;

                _cube.age = vis.ageLabels[i];
                _cube.vax = (j==1) ? "Double Dose" : "Unvaccinated";

                if (vis.ageRange=="all-separate"){
                    if (_cube.age=="90+" || _cube.age=="12-15"){
                        vis.cubeLabels.push(_cube.vax+"\n"+_cube.age);
                    }
                    else{
                        vis.cubeLabels.push(_cube.age);
                    }
                }
                else {
                    vis.cubeLabels.push(_cube.vax+ '  '+_cube.age);
                }

                vis.cubesData.push(_cube);
            }
        }
        vis.processData(vis.cubes3D
            .rotateY(vis.beta + Math.PI)
            .rotateX(vis.alpha - Math.PI+vis.rotateOffset)(vis.cubesData), vis.tt, vis.ixscale, vis.jzscale);

    }
    processData(data, tt) {
        let vis = this;
        /* --------- CUBES ---------*/

        var cubes = vis.cubesGroup.selectAll('g.cube').data(data, function (d) {
            return d.id
        });

        var ce = cubes
            .enter()
            .append('g')
            .attr('class', 'cube')
            .attr('fill', function (d) {
                // console.log(255*vis.colorScale(d.val));

                return "rgb("+255*vis.colorScale(d.val)+", 0, 0)";
            })
            .attr('stroke', 'black')
            .merge(cubes)
            .sort(vis.cubes3D.sort);

        cubes.exit().remove();

        /* --------- FACES ---------*/

        var faces = cubes.merge(ce).selectAll('path.face').data(function (d) {
            return d.faces;
        }, function (d) {
            return d.face;
        });

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


        var texts = cubes.merge(ce).selectAll('text.valtext').data(function (d) {
            var _t = d.faces.filter(function (d) {
                return d.face === 'top';
            });
            return [{val: d.val, centroid: _t[0].centroid}];
        });

        texts
            .enter()
            .append('text')
            .attr('class', 'valtext')
            .attr('id', 'barvaltext')
            .attr('dy', '-.7em')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-weight', 'bolder')
            .attr('x', function (d) {
                return vis.origin[0] + vis.scale * d.centroid.x
            })
            .attr('y', function (d) {
                return vis.origin[1] + vis.scale * d.centroid.y
            })
            .classed('_3d', true)
            .merge(texts)
            .transition().duration(tt)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', function (d) {
                return vis.origin[0] + vis.scale * d.centroid.x
            })
            .attr('y', function (d) {
                return vis.origin[1] + vis.scale * d.centroid.y
            })
            .tween('text', function (d) {
                var that = d3.select(this);
                var i = d3.interpolateNumber(+that.text(), Math.abs(d.val));
                return function (t) {
                    that.text('');
                };
            });

        texts.exit().remove();

        var agetexts = cubes.merge(ce).selectAll('text.agetext').data(function (d) {

            var _t = d.faces.filter(function (d) {
                return d.face === 'top';
            });
            return [{val: d.val, centroid: _t[0].centroid}];
        });
        let cubeLabelCount = 0;
        agetexts
            .enter()
            .append('text')
            .attr('class', 'agetext')
            .attr('id', 'baragetext')
            .attr('dy', '-.7em')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-weight', 'bolder')
            .attr('x', function (d) {
                return vis.origin[0] + vis.scale * (d.centroid.x)
            })
            .attr('y', function (d) {
                return vis.origin[1] + vis.scale * (d.centroid.y-1.5);
            })
            .classed('_3d', true)
            .merge(agetexts)
            .transition().duration(tt)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', function (d) {
                return vis.origin[0] + vis.scale * (d.centroid.x)
            })
            .attr('y', function (d) {
                return vis.origin[1] + vis.scale * (d.centroid.y-0.5);
            })
            .tween('text', function (d) {
                var that = d3.select(this);
                var cubelabel = vis.cubeLabels[cubeLabelCount];
                cubeLabelCount++;
                return function (t) {
                    that.text(cubelabel);
                };
            });

        agetexts.exit().remove();


        /* --------- SORT TEXT & FACES ---------*/

        ce.selectAll('._3d').sort(d3._3d().sort);
    }
}