
class PieChart{

    constructor(parentElement, vacc){
        this.parentElement = parentElement
        this.vacc = vacc; // boolean to determine which of the two visualization we're doing

        this.initVis();
    }

    initVis() {
        let vis = this;

        //setup SVG
        if (vis.vacc){
            vis.margin = {top: 40, right: 100, bottom: 22, left: 10};
        }
        else{
            vis.margin = {top: 40, right: 0, bottom: 22, left: 10};
        }

        vis.width = 400 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        vis.radius = 100

        vis.svg = d3.select("#"+vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .on("click", function() {vis.scattercontrolledRotate();})
            .append("g")
            .attr("transform", "translate(" + vis.width/2 + "," + (vis.height/2) + ")");

        // set the color scale
        vis.color = d3.scaleOrdinal()
            .domain(['pos', 'neg'])
            .range(['#E04404', '#1B8B91']);

        // create data objects
        // vax vs. not vaxed
        vis.vaxData = {
            'vax': [{key: 'pos', value: 1}, {key: 'neg', value: 999}],
            'unvax': [{key: 'pos', value: 16}, {key: 'neg', value: 984}]
        }
        // age groups
        vis.ageData = {
            'twelve': [{key: 'pos', value: 2}, {key: 'neg', value:998}],
            'sixteen': [{key: 'pos', value: 4}, {key: 'neg', value: 996}],
            'twenty': [{key: 'pos', value: 3}, {key: 'neg', value: 997}],
            'thirty': [{key: 'pos', value: 12}, {key: 'neg', value: 988}],
            'forty': [{key: 'pos', value: 30}, {key: 'neg', value: 970}],
            'fifty': [{key: 'pos', value: 66}, {key: 'neg', value: 934}],
            'sixty': [{key: 'pos', value: 146}, {key: 'neg', value: 854}],
            'seventy': [{key: 'pos', value: 267}, {key: 'neg', value: 733}],
            'eighty': [{key: 'pos', value: 585}, {key: 'neg', value: 415}],
            'ninety': [{key: 'pos', value: 661}, {key: 'neg', value: 339}]
    }

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        let ageRange = d3.select("#Age-group").property("value")
        let vaxStatus = d3.select("#Vacc").property("value")

        if (vis.vacc){
            vis.data = vis.vaxData[vaxStatus]
        } else {
            vis.data = vis.ageData[ageRange]
        }

        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        vis.pie = d3.pie()
            .value(function(d) {return d.value; })
            .sort(function(a, b) { console.log(a) ; return d3.ascending(a.value, b.value);} ) // This make sure that group order remains the same in the pie chart
        vis.data_ready = vis.pie(vis.data)
        console.log(vis.data_ready)

        // map to data
        vis.u = vis.svg.selectAll("path")
            .data(vis.data_ready)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        vis.u.enter()
            .append('path')
            .merge(vis.u)
            .transition()
            .duration(1000)
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(vis.radius)
            )
            .attr('fill', function(d){ console.log(vis.color(d.data.key))
                return(vis.color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "1px")
            .style("opacity", 1)

        // remove the group that is not present anymore
        vis.u
            .exit()
            .remove()

    }

    scattercontrolledRotate(){
        let vis = this;

        if (vis.vacc){
            // changePerspective();
            d3.select('#perspective-group').property('value', '0');
            changePerspective();
        }
        else{
            // changePerspective();
            d3.select('#perspective-group').property('value', '1');
            changePerspective();
        }

    }
}