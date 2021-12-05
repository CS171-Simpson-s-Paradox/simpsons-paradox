

class PrevalenceReduction {

    constructor(parentElement, nCircles, pct1, pct2, height, width) {
        this.parentElement = parentElement;
        this.nCircles = nCircles;
        this.pct1 = pct1;
        this.pct2 = pct2;
        this.baseHeight = height;
        this.baseWidth = width;

        this.initVis();
    }

    /*
     * Initialize visualization
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 100, bottom: 20, left: 20};

        vis.width = vis.baseWidth - vis.margin.left - vis.margin.right;
        vis.height = vis.baseHeight - vis.margin.top - vis.margin.bottom;

        vis.arrowStart = 2.8*vis.width/7;
        vis.arrowEnd = 4.2*vis.width/7;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.r = 5;
        vis.nCols= (vis.width/3)/(2*vis.r);
        vis.nRows = Math.round(vis.nCircles/vis.nCols);

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.xScale1 = d3.scaleLinear()
            .domain([0,vis.nCols-1])
            .range([0, vis.width/3])
        ;

        vis.xScale2 = d3.scaleLinear()
            .domain([0,vis.nCols-1])
            .range([2*vis.width/3, vis.width])
        ;

        vis.nFilledCircles1 = Math.round(vis.pct1*vis.nCircles);
        vis.nFilledCircles2 = Math.round(vis.pct2*vis.nCircles);

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        for (let i = 0; i < vis.nCircles; i++) {
            let xPos1 = vis.xScale1(i%vis.nCols);
            let xPos2 = vis.xScale2(i%vis.nCols);
            let yPos = 2*Math.floor(i/vis.nCols)*vis.r;

            let color1= "lightgrey";
            if (i < vis.nFilledCircles1){
                color1="red";
            }

            let color2= "lightgrey";
            if (i < vis.nFilledCircles2){
                color2="red";
            }

            vis.svg.append('circle')
                .attr('r', vis.r)
                .attr('cx', xPos1)
                .attr('cy', yPos)
                .attr('fill', color1)
                .on('mouseover', function() {
                    d3.select(this).attr('stroke', 'black')
                })
                .on('mouseout', function() {
                    d3.select(this).attr('stroke', color1)
                })
            ;

            vis.svg.append('circle')
                .attr('r', vis.r)
                .attr('cx', xPos2)
                .attr('cy', yPos)
                .attr('fill', color2)
                .on('mouseover', function() {
                    d3.select(this).attr('stroke', 'black')
                })
                .on('mouseout', function() {
                    d3.select(this).attr('stroke', color2)
                })
            ;

            vis.svg.append('line')
                .attr('x1',vis.arrowStart)
                .attr('x2',vis.arrowEnd)
                .attr('y1',vis.nRows*vis.r)
                .attr('y2',vis.nRows*vis.r)
                .attr('stroke',"#000")
                .attr('stroke-width',"3")
                .attr('marker-end', "url(#arrowhead)")
        }

        vis.svg.append('text')
            .attr('class', 'reducPct')
            .attr('x',vis.r*vis.nCols)
            .attr('y',vis.r*vis.nRows*2 + 20)
            .text(d=>Math.round(1000*vis.pct1)/10+'%')
        ;

        vis.svg.append('text')
            .attr('class', 'reducPct')
            .attr('x',vis.width - (vis.r*vis.nCols))
            .attr('y',vis.r*vis.nRows*2 + 20)
            .text(d=>Math.round(1000*vis.pct2)/10+'%')
        ;

        // vis.svg.append('text')
        //     .attr('x',0.5*vis.arrowStart+0.5*vis.arrowEnd)
        //     .attr('y',vis.height/2+30)
        //     .text(function(d) {
        //         let res = ""
        //         res += "VE = 1 - ";
        //         res += Math.round(1000*vis.pct1)/1000;
        //         res += '/';
        //         res += Math.round(1000*vis.pct2)/1000;
        //
        //         return res;
        //     })
        // ;
        vis.svg.append('text')
            .attr('class','reducPct')
            // .style('font-size', 14)
            .attr('x',vis.arrowStart+((vis.arrowEnd-vis.arrowStart)/2))
            .attr('y',vis.nRows*vis.r + 30)
            .text(function(d) {
                let res = `VE = ${Math.round(1000*(1 - vis.pct2/vis.pct1))/10}%`;
                return res;
            });
    }
}