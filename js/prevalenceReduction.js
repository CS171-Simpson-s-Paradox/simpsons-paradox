

class PrevalenceReduction {

    constructor(parentElement, nCircles, pct1, pct2) {
        this.parentElement = parentElement;
        this.nCircles = nCircles;
        this.pct1 = pct1;
        this.pct2 = pct2;

        this.initVis();
    }

    /*
     * Initialize visualization
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

        vis.arrowStart = 2.8*vis.width/7;
        vis.arrowEnd = 3.8*vis.width/7;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.r = 2;
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

            let color1= "blue";
            if (i < vis.nFilledCircles1){
                color1="red";
            }

            let color2= "blue";
            if (i < vis.nFilledCircles2){
                color2="red";
            }

            vis.svg.append('circle')
                .attr('r', vis.r)
                .attr('cx', xPos1)
                .attr('cy', yPos)
                .attr('fill', color1)
            ;

            vis.svg.append('circle')
                .attr('r', vis.r)
                .attr('cx', xPos2)
                .attr('cy', yPos)
                .attr('fill', color2)
            ;

            vis.svg.append('line')
                .attr('x1',vis.arrowStart)
                .attr('x2',vis.arrowEnd)
                .attr('y1',vis.height/2)
                .attr('y2',vis.height/2)
                .attr('stroke',"#000")
                .attr('stroke-width',"8")
                .attr('marker-end', "url(#arrowhead)")
        }

        vis.svg.append('text')
            .attr('x',vis.arrowStart)
            .attr('y',vis.height/2-30)
            .text(d=>Math.round(1000*vis.pct1)/10+'%')
        ;

        vis.svg.append('text')
            .attr('x',vis.arrowEnd+20)
            .attr('y',vis.height/2-30)
            .text(d=>Math.round(1000*vis.pct2)/10+'%')
        ;

        vis.svg.append('text')
            .attr('x',0.5*vis.arrowStart+0.5*vis.arrowEnd - 15)
            .attr('y',vis.height/2+30)
            .text(function(d) {
                let res = ""
                res += "VE = 1 - ";
                res += Math.round(1000*vis.pct1)/1000;
                res += '/';
                res += Math.round(1000*vis.pct2)/1000;
                return res;
            })
        ;
        vis.svg.append('text')
            .attr('x',0.5*vis.arrowStart+0.5*vis.arrowEnd - 15)
            .attr('y',vis.height/2+50)
            .text(function(d) {
                let res = ""
                res += Math.round(1000*(1 - vis.pct2/vis.pct1))/10+'%';
                return res;
            });
    }
}