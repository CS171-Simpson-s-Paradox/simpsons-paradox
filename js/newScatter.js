let transitionTime = 500;

class NewScatter {

    constructor(parentElement, caseVals, ageLabels, popVals) {
        this.parentElement = parentElement;
        this.caseVals = caseVals;
        this.caseValsIndex = 0;
        this.ageLabels = ageLabels;
        console.log("AGE LABELS");
        console.log(ageLabels);
        this.vaxLabels = ['Unvaccinated', 'Double Dose'];
        this.morevaxLabels = ['Unvaccinated', 'Double Dose', 'Boosted'];
        this.labels = this.vaxLabels;
        this.popVals = popVals;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = 750 - vis.margin.left - vis.margin.right;
        vis.height = 450 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .call(d3.drag().on('drag', function() {vis.draggedScatter();}).on('start', function() {vis.dragStartScatter();}).on('end', function() {vis.dragEndScatter();}))
            // .on("click", function() {vis.controlledRotate();})
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.origin = [vis.width/2, vis.height/2];
        vis.j = 10;
        vis.scale = 20;
        vis.scatter = [];
        vis.scattercolor = [];
        vis.rotateYAngles = [Math.PI/2, 0, 0];
        vis.rotateXAngles = [ Math.PI/30, Math.PI/12, Math.PI/2];
        vis.rotatePerspectives = ['Relative Risk of Severe Case by Vax Status', 'Relative Risk of Severe Case by Age', 'Relative Risk of Severe Case by Age and Vax Status'];
        vis.rotateAngleSetting = 2;
        vis.yLine = [];
        vis.ageLine = [];
        vis.vaxLine = [];
        vis.xGrid = [];
        vis.beta = 0;
        vis.alpha = 0;
        vis.key = function (d) {
            return d.id;
        };
        vis.startAngle = Math.PI / 4;
        vis.startXAngle = vis.startAngle;
        vis.startYAngle = vis.startAngle;
        vis.mx = 0;
        vis.my = 0;
        vis.mouseX = 0;
        vis.mouseY = 0;


        vis.point3d = d3._3d()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .z(function (d) {
                return d.z;
            })
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.ageScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);

        vis.vaxScale3d = d3._3d()
            .shape('LINE_STRIP')
            .origin(vis.origin)
            .rotateY(vis.startAngle)
            .rotateX(-vis.startAngle)
            .scale(vis.scale);



        vis.descriptions = [
            "Like before, we can view the reduction in relative covid risk from the unvaccinated cohort to the vaccinated\n"+
            "Simpson's paradox occurs because a hidden distribution lurks underneath \n"+
            "The reduction in covid risk is stronger than it seems from this perspective \n"+
                "",



            "The risk of developing a severe case of COVID grows significantly with age. \n" +
            "But for comparison, consider the relative impact of age on mortality risk of the general American population.\n"+
            // "Heart disease, cancer, and even death in general follow similarly proportional distributions.\n"+
            // "COVID is not an 'old-person problem'. We should acknowledge such risk disparities exist without writing off the needs of our elderly \n \n" +
            // "source: https://medium.com/incerto/no-covid-19-is-not-an-old-person-problem-6968f720d153" +
                "",

            "We can partially overcome the confusion of Simpson's Paradox by controlling for both age and vaccination at once.\n" +
            "These are otherwise known as 'marginal distributions' (https://en.wikipedia.org/wiki/Marginal_distribution)\n"+

            "This perspective allows us to better assess the vaccine effectiveness\n"+
                ""
        ]

        vis.initScatter(2000);
    }

    initScatter(time){
        let vis = this;
        var cnt = 0;
        vis.scatter = [];

        vis.dataArr = vis.caseVals[vis.caseValsIndex];

        if (vis.caseValsIndex == 0 || vis.caseValsIndex == 1) {


            var zmin = -4;
            var zmax = 4;
            var zvals = [zmin, zmin+0.5, zmin+1, zmin+1.5, zmin+2, zmax-2, zmax-1.5, zmax-1, zmax-0.5, zmax];
            var xvals = [];
            var localBarDim = 5;
            var barColNumPoints = 4;
            var xbargap = 3;
            for(var x = -5; x < 5; x++){
                xvals.push(xbargap*x - 1);
                xvals.push(xbargap*x - 0.5);
                xvals.push(xbargap*x);
                xvals.push(xbargap*x+0.5);
                xvals.push(xbargap*x+1);
            }
            vis.maxval = 1000;
            // for (let i = 0; i <10; i++) {
            //     for (let k = 0; k < 2; k++) {
            //         if (vis.dataArr[i][k] > vis.maxval){
            //             vis.maxval = vis.dataArr[i][k];
            //         }
            //     }
            // }


            d3.range(-15.5, 13.5, 3).forEach(function(d){
                vis.ageLine.push([d, 1, -5]); });

            vis.vaxLine = [
                [13.5,1,-4.5],
                [13.5,1,1.5]
            ];
        }

        else if (vis.caseValsIndex == 2 || vis.caseValsIndex == 3) {


            // 3 VAX STATUS
            var zmin = -4;
            var zmid = 0;
            var zmax = 4;
            var zvals = [zmin, zmin+0.5, zmin+1, zmin+1.5, zmin+2,
                        zmid - 1.0, zmid - 0.5, zmid, zmid+0.5, zmid+1,
                        zmax-2, zmax-1.5, zmax-1, zmax-0.5, zmax];


            // 10 age groups
            var xvals = [];
            var localBarDim = 5;
            var barColNumPoints = 2;
            var xbargap = 3;
            for(var x = -5; x < 5; x++){
                xvals.push(xbargap*x - 1);
                xvals.push(xbargap*x - 0.5);
                xvals.push(xbargap*x);
                xvals.push(xbargap*x+0.5);
                xvals.push(xbargap*x+1);
            }


            vis.maxval = 1000;
            // for (let i = 0; i <10; i++) {
            //     for (let k = 0; k < 3; k++) {
            //         if (vis.dataArr[i][k] > vis.maxval){
            //             vis.maxval = vis.dataArr[i][k];
            //         }
            //     }
            // }

            d3.range(-15.5, 13.5, 3).forEach(function(d){
                vis.ageLine.push([d, 1, -8]); });

            vis.vaxLine = [
                [13.5,1,-4.5],
                [13.5,1,-0.5],
                [13.5,1,3.5]
            ];
        }

        let zindex = 0;
        zvals.forEach(function(z){
            let xindex = 0;
            xvals.forEach(function(x){
                for (var j = 0; j < barColNumPoints; j++){
                    let areaval = vis.dataArr[Math.floor(xindex/localBarDim)][Math.floor(zindex/localBarDim)];
                    let prob = areaval/vis.maxval + .005;
                    let u = Math.random();
                    if (u < prob){
                        vis.scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++, color : "red"});
                    }
                }
                xindex++;
            })
            zindex++;
        });
        vis.data = [
            vis.point3d(vis.scatter),
            vis.ageScale3d([vis.ageLine]),
            vis.vaxScale3d([vis.vaxLine])
        ];
        vis.controlledRotate(time);
    }

    processDataScatter(tt){
        let vis = this;
        let data = vis.data;

        var points = vis.svg.selectAll('circle').data(data[0], vis.key);

        points
            .enter()
            .append('circle')
            .attr('class', '_3d')
            .attr('opacity', 0)
            .attr('cx', vis.posPointX)
            .attr('cy', vis.posPointY)
            .merge(points)
            .transition().duration(tt)
            .attr('r', 4)
            .attr('stroke', 'black' )
            .attr('fill', d => d.color)
            .attr('opacity', 0.3)
            .attr('cx', vis.posPointX)
            .attr('cy', vis.posPointY);

        points.exit().remove();

         /* ----------- age-Scale Text ----------- */

         var ageText = vis.svg.selectAll('text.ageText').data(data[1][0]);

         ageText
             .enter()
             .append('text')
             .attr('class', '_3d ageText')
             .attr('dx', '.3em')
             .attr('fontsize', 40)
             .merge(ageText)
             .transition().duration(tt)
             .each(function(d){
                 d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
             })
             .attr('x', function(d){ return d.projected.x; })
             .attr('y', function(d){ return d.projected.y; })
             .text(function(d, index){
                 if (vis.rotateAngleSetting==1 || vis.rotateAngleSetting==2){
                     return vis.ageLabels[index];
                 }
                 else{
                     return "";
                 }
             });

         ageText.exit().remove();

         /* ----------- vax-Scale Text ----------- */

         var vaxText = vis.svg.selectAll('text.vaxText').data(data[2][0]);

         vaxText
             .enter()
             .append('text')
             .attr('class', '_3d vaxText')
             .attr('dx', '.3em')
             .merge(vaxText)
             .transition().duration(tt)
             .each(function(d){
                 d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
             })
             .attr('x', function(d){ return d.projected.x; })
             .attr('y', function(d){ return d.projected.y; })
             .text(function(d, index){
                 if (vis.rotateAngleSetting==0 || vis.rotateAngleSetting==2){
                     return vis.labels[index];
                 }
                 else{
                     return "";
                 }
            });

         vaxText.exit().remove();

        vis.svg.selectAll('._3d').sort(d3._3d().sort);
        }

    posPointX(d){
        return d.projected.x;
    }

    posPointY(d){
        return d.projected.y;
    }

    dragStartScatter(){
        let vis = this;
        vis.mx = d3.event.x;
        vis.my = d3.event.y;
        vis.origStatus = vis.rotateAngleSetting;
        // vis.isDragging=true;
    }

    draggedScatter(){
        let vis = this;

        vis.mouseX = vis.mouseX || 0;
        vis.mouseY = vis.mouseY || 0;
        vis.beta   = (d3.event.x - vis.mx + vis.mouseX) * Math.PI / 230 ;
        vis.alpha  = (d3.event.y - vis.my + vis.mouseY) * Math.PI / 230  * (-1);

        vis.data = [
            vis.point3d.rotateY(vis.beta + vis.startYAngle).rotateX(vis.alpha - vis.startXAngle)(vis.scatter),
            vis.ageScale3d.rotateY(vis.beta + vis.startYAngle).rotateX(vis.alpha - vis.startXAngle)([vis.ageLine]),
            vis.vaxScale3d.rotateY(vis.beta + vis.startYAngle).rotateX(vis.alpha - vis.startXAngle)([vis.vaxLine])
        ];

        vis.rotateAngleSetting = 2;

        vis.processDataScatter(0);
    }

    dragEndScatter(){
        let vis = this;
        vis.mouseX = d3.event.x - vis.mx + vis.mouseX;
        vis.mouseY = d3.event.y - vis.my + vis.mouseY;
        vis.rotateAngleSetting = vis.origStatus;
        vis.controlledRotate(transitionTime);
    }

    controlledRotate(time){
        let vis = this;

        // vis.rotateAngleSetting = (vis.rotateAngleSetting+1)%3;

        vis.rotateYAngle = vis.rotateYAngles[vis.rotateAngleSetting];
        vis.rotateXAngle = vis.rotateXAngles[vis.rotateAngleSetting];

        vis.data = [
            vis.point3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)(vis.scatter),
            vis.ageScale3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)([vis.ageLine]),
            vis.vaxScale3d.rotateY(vis.rotateYAngle).rotateX(vis.rotateXAngle)([vis.vaxLine]),
        ];

        let displaytext = vis.rotatePerspectives[vis.rotateAngleSetting];
        let descriptiontext= vis.descriptions[vis.rotateAngleSetting];
        let descriptionDate= ['August 15', 'September 2', 'September 20', 'November 9'][vis.caseValsIndex];
        d3.selectAll(".scatterTitle")
            .text(displaytext)
        ;
        d3.selectAll(".scatterDescription")
            .text(descriptiontext)
        ;
        d3.selectAll(".scatterDate")
            .text(descriptionDate)
        ;

        vis.processDataScatter(time);

        vis.mouseX=0;
        vis.mouseY=0;
        vis.startYAngle = vis.rotateYAngle;
        vis.startXAngle= -vis.rotateXAngle;
    }

    changeDate(){
        let vis = this;
        vis.caseValsIndex = parseInt(d3.select("#time-group").property("value"));
        if (vis.caseValsIndex == 0 || vis.caseValsIndex == 1){
            vis.labels = vis.vaxLabels;
        }
        else if (vis.caseValsIndex == 2 || vis.caseValsIndex == 3){
            vis.labels = vis.morevaxLabels;
        }
        vis.initScatter(transitionTime);
    }

    changePerspective(){
        let vis = this;
        vis.rotateAngleSetting = parseInt(d3.select("#perspective-group").property("value"));
        vis.controlledRotate(transitionTime);
    }


    //
    // selectionChanged(brushRegion) {
    //     let vis = this;
    //
    //     console.log("CHANGING");
    //     console.log(brushRegion);
    //     if (brushRegion[1] < 70){
    //         vis.caseValsIndex == 0;
    //         console.log('region 1');
    //     }
    //     if (brushRegion[1] > 70){
    //         vis.caseValsIndex == 1;
    //         console.log('region 2');
    //     }
    //     if (brushRegion[1] > 140){
    //         vis.caseValsIndex == 2;
    //         console.log('region 3');
    //     }
    //     if (brushRegion[1] > 210){
    //         vis.caseValsIndex == 3;
    //         console.log('region 4');
    //     }
    //     // console.log(vis.data);
    //
    //
    //
    //     if (vis.caseValsIndex == 0 || vis.caseValsIndex == 1){
    //         vis.labels = vis.vaxLabels;
    //     }
    //     else if (vis.caseValsIndex == 2 || vis.caseValsIndex == 3){
    //         vis.labels = vis.morevaxLabels;
    //     }
    //
    //
    //     vis.initScatter(transitionTime);
    //
    //     // Filter data accordingly without changing the original data
    //
    //     // vis.filteredData = vis.data.filter(d => (d.survey > brushRegion[0]) & (d.survey < brushRegion[1]));
    //
    //     // Update the visualization
    //     // vis.wrangleData();
    // }

}