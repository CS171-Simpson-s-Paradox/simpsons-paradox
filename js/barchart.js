// let transitionDuration = 200;

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */


class BarChart {

	constructor(parentElement) {
		this.parentElement = parentElement;
		this.initVis();
	}

	/*
	 * Initialize visualization (static content; e.g. SVG area, axes)
	 */

	initVis() {
		let vis = this;

		//setup SVG
		vis.margin = {top: 20, right: 60, bottom: 22, left: 100};
		vis.width = 700 - vis.margin.left - vis.margin.right;
		vis.height = 400 - vis.margin.top - vis.margin.bottom;

		// Values for bar graph
		vis.groups = ['All ages', '< 50', '>= 50']
		vis.pops = [6937546, 4617952, 2319594]

		vis.svg = d3.select("#"+vis.parentElement).append("svg")
			.attr("width", vis.width)
			.attr("height", vis.height)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// Draw the y axis
		vis.svg.append("g")
			// .attr("id", "yAxisLabel")
			.attr("class", "axis y-axis")
			.append('text')
			.attr('class', 'bar-y-label')
			.text('Population')
			.attr('x', -((vis.height-vis.margin.top - 3*vis.margin.bottom)/2))
			.attr('y', -70)
			.style('fill', 'black')
			.style('text-anchor', 'center')
			.attr('transform', 'rotate(-90)')
		;

		vis.svg.append("g")
			.attr("id", "barWidthLabel")
			.attr("x",50)
			.attr("y",50)
		;

		vis.svg.append('g')
			.attr('class', 'axis x-axis')
			.attr('transform', `translate(0, ${vis.height - vis.margin.top - vis.margin.bottom})`)




		// Scales and axes
		vis.x = d3.scaleBand()
			.domain([0, 1, 2])
			.range([0, vis.width - vis.margin.right - vis.margin.left])
			.padding(.1);
		vis.y = d3.scaleLinear()
			.domain([0, 7000000])
			.range([vis.height - vis.margin.top - vis.margin.bottom, vis.margin.top])
		vis.yAxis = d3.axisLeft()
			.scale(vis.y)
			.ticks(7)
		vis.xAxis = d3.axisBottom()
			.scale(vis.x)
			.ticks(3)
			.tickFormat(d => vis.groups[d])
		console.log(vis.height - vis.margin.top - vis.margin.bottom)

		vis.svg.select('.x-axis').call(vis.xAxis)

		// (Filter, aggregate, modify data)
		vis.wrangleData();
	}



	/*
	 * Data wrangling
	 */

	wrangleData() {
		let vis = this;
		// let countByConfig = Array.from(d3.rollup(vis.filteredData,leaves=>leaves.length,d=>d[vis.config]), ([key, value]) => ({'config' : key, 'value' : value}));

		//sort in descending order by value
		// vis.displayData = countByConfig.sort((a, b) => b.value - a.value);
		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
	 */

	updateVis() {
		let vis = this;
		// console.log(vis.displayData);



		// data join for the rectangles
		vis.rectangles = vis.svg.selectAll("rect")
			.data(vis.pops)
		;
		//enter
		vis.rectangles
			.enter()
			.append("rect")
			.attr("x",(d,i) => {return vis.x(i) + 20})
			.attr('y', d => vis.y(d))
			.attr("width",70)
			.attr('height', (d) => {
				console.log(d, d3.max(vis.pops), vis.y(d))
				return vis.height - vis.margin.bottom - vis.margin.top - vis.y(d)
			})
			.attr("stroke", "black")
			.on('mouseover', function() {
				d3.select(this).style('fill', '#275E95')
			})
			.on('mouseleave', function() {
				d3.select(this).style('fill', '#123456')
			})
			.on('click', function(d) {
				console.log(clicked(d))
			});

		function clicked(pop){
			let choice = ''
			let filterTitle = ''
			// Update NEJM data
			d3.select('#prevReduc7').select('svg').remove()
			if (pop > 5000000) {
				choice = 'All ages'
				filterTitle = choice
				prevReducViz7 = new PrevalenceReduction("prevReduc7", NCIRCLES-44, .9, .1, 200, 600);
			} else if (pop > 3000000) {
				choice = '<50'
				filterTitle = 'Age < 50'
				prevReducViz7 = new PrevalenceReduction("prevReduc7", NCIRCLES-44, .5, .5, 200, 600);
			} else if (pop > 1000000) {
				choice = '>= 50'
				filterTitle = 'Age >= 50'
				prevReducViz7 = new PrevalenceReduction("prevReduc7", NCIRCLES-44, .5, .5, 200, 600);

			}

			d3.select('.age-breakdown-title')
				.transition()
				.duration(300)
				.text(filterTitle)

			// Update Israel data
			d3.select('#prevReduc8').select('svg').remove()
			loadPrevalenceReduction("prevReduc8","IL_Aug15.csv",choice, colNames, NCIRCLES-44, 200, 600);

			return choice
		}


		// Update the y-axis
		vis.svg.select(".y-axis").call(vis.yAxis);

	}

}
