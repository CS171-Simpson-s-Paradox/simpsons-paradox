

class PrevalenceReduction {

    constructor(parentElement, nCircles, nCols, pct1, pct2) {
        this.parentElement = parentElement;
        this.nCircles = nCircles;
        this.nCols= nCols;
        this.nRows = Math.round(nCircles/nCols);
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

        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 150 - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        let xScale1 = d3.scaleLinear()
            .domain([0,vis.nCols-1])
            .range([0, vis.width/3])
        ;

        let xScale2 = d3.scaleLinear()
            .domain([0,vis.nCols-1])
            .range([2*vis.width/3, vis.width])
        ;

        let yScale = d3.scaleLinear()
            .domain([0,vis.nRows-1])
            .range([0, vis.height])
        ;

        let nFilledCircles1 = Math.round(vis.pct1*vis.nCircles);
        let nFilledCircles2 = Math.round(vis.pct2*vis.nCircles);


        for (let i = 0; i < vis.nCircles; i++) {
            let xPos1 = xScale1(i%vis.nCols);
            let xPos2 = xScale2(i%vis.nCols);
            let yPos = yScale(Math.floor(i/vis.nCols));

            let color1= "blue";
            if (i < nFilledCircles1){
                color1="red";
            }

            let color2= "blue";
            if (i < nFilledCircles2){
                color2="red";
            }

            vis.svg.append('circle')
                .attr('r', vis.height/(2*vis.nRows))
                .attr('cx', xPos1)
                .attr('cy', yPos)
                .attr('fill', color1)
            ;

            vis.svg.append('circle')
                .attr('r', vis.height/(2*vis.nRows))
                .attr('cx', xPos2)
                .attr('cy', yPos)
                .attr('fill', color2)
            ;

            vis.svg.append('line')
                .attr('x1',2.8*vis.width/7)
                .attr('x2',3.8*vis.width/7)
                .attr('y1',vis.height/2)
                .attr('y2',vis.height/2)
                .attr('stroke',"#000")
                .attr('stroke-width',"8")
                .attr('marker-end', "url(#arrowhead)")
        }
    }
}