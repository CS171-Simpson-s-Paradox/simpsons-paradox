

class PrivacyCircle{

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales
        vis.radiusScale = d3.scaleLinear()
            .domain([0, vis.data.length])
            .range([0, vis.height/2])
        vis.textScale = d3.scaleLinear()
            .domain([0, vis.data.length])
            .range([10, 20])

        // Text and Circle objects
        vis.baseCircle = vis.svg.append('circle')
            .attr('cx', vis.width/2 - 30)
            .attr('cy', vis.height/2)
            .attr('fill', 'antiquewhite')
            // .attr('opacity', 0.7)
            .attr('r', vis.height/2)
        vis.privCircle = vis.svg.append('circle')
            .attr('cx', vis.width/2 - 30)
            .attr('cy', vis.height/2)
            .attr('fill', 'teal')
        vis.privCount = vis.svg.append('text')
            .attr('class', 'priv-count-text')
            .attr('x', -10)
            .attr('y', 10)

        // Filtering
        vis.ageBuckets = {
            '15-30': {min: 15, max: 30},
            '31-45': {min: 31, max: 45},
            '46-60': {min: 46, max:60},
            '61-75': {min: 61, max:76}
        }


        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;
        vis.filteredData = vis.data;

        // Filter data to user selection
        let ageRange = d3.select("#Age").property("value")
        let race = d3.select("#Race").property("value")
        let sex = d3.select("#Sex").property("value")
        if (ageRange != 'all-ages'){
            let minMax = vis.ageBuckets[ageRange]
            vis.filteredData = vis.filteredData.filter((d) => {return (d.age <= minMax.max) && (d.age >= minMax.min)})
        }
        if (race != 'all-races'){
            vis.filteredData = vis.filteredData.filter((d) => {return d.race == race})
        }
        if (sex != 'all-sexes'){
            vis.filteredData = vis.filteredData.filter((d) => {return d.gender == sex})
        }
        vis.updateVis();
    }

    updateVis(){
        let vis = this;
        let dataLength = vis.filteredData.length

        vis.privCircle
            .transition()
            .duration(500)
            .attr('r', vis.radiusScale(vis.filteredData.length))
        vis.privCount.style('font-size', 20)
            .text(`Total count: ${d3.format(',')(vis.filteredData.length)}`)


    }


}