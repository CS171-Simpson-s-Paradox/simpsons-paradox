// let transitionDuration = 200;

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */


class BarChart {

	constructor(parentElement, data, config) {
		this.parentElement = parentElement;
		this.data = data;
		this.config = config;
		this.displayData = data;
		this.filteredData = data;
		this.initVis();
	}

	/*
	 * Initialize visualization (static content; e.g. SVG area, axes)
	 */

	initVis() {
		let vis = this;

		//setup SVG
		vis.margin = {top: 0, right: 30, bottom: 0, left: 140};
		vis.width = 600 - vis.margin.left - vis.margin.right;
		vis.height = 150 - vis.margin.top - vis.margin.bottom;


		let svg = d3.select("#"+vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
		// Draw the y axis
		svg.append("g")
			// .attr("id", "yAxisLabel")
			.attr("class", "axis y-axis")
		;

		svg.append("g")
			.attr("id", "barWidthLabel")
			.attr("x",50)
			.attr("y",50)
		;

		svg.append("g")
			.attr("id", "yAxisLabel")
		;

		vis.svg = svg;



		// Scales and axes
		vis.x = d3.scaleLinear()
			.range([0, vis.width]);
		vis.y = d3.scalePoint()
			.range([40, vis.height - 40]);
		vis.yAxis = d3.axisLeft()
			.scale(vis.y)
			.tickValues([]);

		// (Filter, aggregate, modify data)
		vis.wrangleData();
	}

	/*
	 * Data wrangling
	 */

	wrangleData() {
		let vis = this;
		let countByConfig = Array.from(d3.rollup(vis.filteredData,leaves=>leaves.length,d=>d[vis.config]), ([key, value]) => ({'config' : key, 'value' : value}));

		//sort in descending order by value
		vis.displayData = countByConfig.sort((a, b) => b.value - a.value);
		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
	 */

	updateVis() {
		console.log("reconfigure: "+ this.config);
		let vis = this;
		// console.log(vis.displayData);

		//update domains
		let domainVals = vis.displayData.map((d,index)=>index);
		//console.log(domainVals);
		vis.y.domain(domainVals);
		vis.x.domain([0,d3.max(vis.displayData.map(d=>d.value))]);
		// vis.x.domain(d3.extent(vis.displayData.map(d=>d.value)));



		// data join for the rectangles
		let rectangles = vis.svg.selectAll("rect")
			.data(vis.displayData)
		;
		//enter
		rectangles
			.enter()
			.append("rect")
			.attr("x",0)
			.attr("height",20)
			.attr("stroke", "black")
			// update
			.merge(rectangles)
			.attr("width", d => vis.x(d.value))
			.transition()
			.duration(300)
			.attr("y", (d,index)=>vis.y(index)-5)
		;
		//exit
		rectangles.exit().remove();




		//
		// data join for the y axis bar labels
		let barlabels = vis.svg.select("#yAxisLabel").selectAll("text")
			.data(vis.displayData)
		;
		//enter
		barlabels
			.enter()
			.append("text")
			.attr("text-anchor", "end")
			.attr("x",-10)
			//update
			.merge(barlabels)
			.transition()
			.duration(300)
			.attr("y",(d,index)=>vis.y(index))
			.text(d=>d.config)
		;
		//exit
		barlabels.exit().remove();

		// data join for the rectangle width labels
		let labels = vis.svg.select("#barWidthLabel").selectAll("text")
			.data(vis.displayData)
		;
		//enter
		labels
			.enter()
			.append("text")
			// .attr("font-size",20)
			// .attr("fill", "black")
			// .attr("text-anchor", "start")
			//update
			.merge(labels)
			.transition()
			.duration(300)
			.attr("x",d=> {
				console.log(vis.x(d.value));
				return vis.x(d.value);
			})
			.attr("y",(d,index)=> {
				// console.log(vis.y(index));
				return vis.y(index)+7;
			})
			.text(d=>d.value);
		;
		//exit
		labels.exit().remove();

		// Update the y-axis
		vis.svg.select(".y-axis").call(vis.yAxis);

	}

}
