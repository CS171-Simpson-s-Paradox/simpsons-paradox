
let colNames = ['# Serious Cases per 100k Unvaxed', '# Serious Cases per 100k Double Dose']
let moreColNames = ['# Serious Cases per 100k Unvaxed', '# Serious Cases per 100k Double Dose','# Serious Cases per 100k Boosted'];
let rowNames1 = ['All ages'];
let rowNames2 = ['<50', '>= 50'];
let rowNames3 = ['12-15', '16-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90+'];
let NCIRCLES = 300

let myScatter = null;


//DEMOS
// loadPrevalenceReduction("myPrevReducDemo","IL_Aug15.csv","All ages", colNames, false);
// loadHistogram("myHistDemo", "IL_Aug15.csv", "IL_Aug15_ByAge.csv", rowNames1, rowNames2, rowNames3, colNames);
loadScatter("myScatterDemo", ["IL_Aug15_ByAge.csv", "IL_Sep2_ByAge.csv", "IL_Sep20_ByAge.csv", "IL_Nov9_ByAge.csv"], rowNames3, colNames, moreColNames);
// let scatterDemo = new NewScatter("myScatterDemo");


// page 1
let prevReducViz1 = new PrevalenceReduction("prevReduc1", 792, .36, .1396, 300, 1200);

// page 2
let prevReducViz2 = new PrevalenceReduction("prevReduc2", NCIRCLES+4, .36, .1396, 300, 600);
loadPrevalenceReduction("prevReduc3","IL_Aug15.csv","All ages", colNames, NCIRCLES+4, 300, 600,false);

// page 3
loadPrevalenceReduction("prevReduc4","IL_Aug15.csv","All ages", colNames, 792, 300, 1200, false);

// page 4
loadPrevalenceReduction("prevReduc5","IL_Aug15.csv","<50", colNames, NCIRCLES+4, 300, 600, false);
loadPrevalenceReduction("prevReduc6","IL_Aug15.csv",">= 50", colNames, NCIRCLES+4, 300, 600, false);

// page 5
loadPrevalenceReduction("prevReduc4Age","IL_Aug15.csv","All ages", colNames, NCIRCLES, 300, 600, false);
loadPrevalenceReduction("prevReduc5Age","IL_Aug15.csv","<50", colNames, NCIRCLES, 300, 600, false);
loadPrevalenceReduction("prevReduc6Age","IL_Aug15.csv",">= 50", colNames, NCIRCLES, 300, 600,false);

// page 6
let barChart = new BarChart('barChart');
let prevReducViz7 = new PrevalenceReduction("prevReduc7", NCIRCLES-44, .36, .1396, 200, 600);
loadPrevalenceReduction("prevReduc8","IL_Aug15.csv","All ages", colNames, NCIRCLES-44, 200, 600);


//
// Pie charts
let pieChart1 = new PieChart('vaxPie', true)
let pieChart2 = new PieChart('agePie', false)

// Update pie charts
d3.select('#Vacc')
    .on('change', () => {
        pieChart1.wrangleData();
    })
d3.select('#Age-group')
    .on('change', () => {
        pieChart2.wrangleData();
    })


function loadScatter(htmlElt, fileNames, rowNames, colNames, moreColNames) {

    d3.csv("data/"+fileNames[0], function(error, data) {
        if (error) throw error;
        let casevals1 = [];
        let agelabels = [];
        let popVals = [];
        for (let i = 0; i < data.length; i++) {
            let ages = data[i]['Name'];
            let pop = data[i]['% Pop'];
            if (rowNames.includes(ages)) {
                let vals = [];
                for (let j = 0; j < colNames.length; j++) {
                    vals.push(+data[i][colNames[j]]);
                }
                casevals1.push(vals);
                agelabels.push(ages);
                popVals.push(pop);
            }
        }
        d3.csv("data/"+fileNames[1], function(error, data) {
            if (error) throw error;
            let casevals2 = [];
            for (let i = 0; i < data.length; i++) {
                let ages = data[i]['Name'];
                // let pop = data[i]['% Pop'];
                if (rowNames.includes(ages)) {
                    let vals = [];
                    for (let j = 0; j < colNames.length; j++) {
                        vals.push(+data[i][colNames[j]]);
                    }
                    casevals2.push(vals);
                }
            }
            d3.csv("data/"+fileNames[2], function(error, data) {
                if (error) throw error;
                let casevals3 = [];
                for (let i = 0; i < data.length; i++) {
                    let ages = data[i]['Name'];
                    if (rowNames.includes(ages)) {
                        let vals = [];
                        for (let j = 0; j < moreColNames.length; j++) {
                            vals.push(+data[i][moreColNames[j]]);
                        }
                        casevals3.push(vals);
                    }
                }
                d3.csv("data/"+fileNames[3], function(error, data) {
                    if (error) throw error;
                    let casevals4 = [];
                    for (let i = 0; i < data.length; i++) {
                        let ages = data[i]['Name'];
                        if (rowNames.includes(ages)) {
                            let vals = [];
                            for (let j = 0; j < moreColNames.length; j++) {
                                vals.push(+data[i][moreColNames[j]]);
                            }
                            casevals4.push(vals);
                        }
                    }

                    myScatter = new NewScatter(htmlElt, [casevals1, casevals2, casevals3, casevals4], agelabels, popVals, colNames, moreColNames);

                    d3.select('#time-group')
                        .on('change', () => {
                            myScatter.changeDate();
                        })

                    d3.select('#perspective-group')
                        .on('change', () => {
                            changePerspective();
                        })
                });
            });
        });
    });
}

function loadPrevalenceReduction(htmlElt, fileName, rowName, colNames, nCircles, height, width, popScaled) {


    // get the data
    d3.csv("data/"+fileName, function(error, data) {
        if (error) throw error;

        let vals = [];
        let popPct = 0;
        let unvaxPct = 0;
        let doubleDosePct = 0;

        for (let i = 0; i < data.length; i++) {
            let ages = data[i]['Name'];
            if (rowName==ages){
                popPct = data[i]['% Pop'];
                unvaxPct = data[i]['% Unvaxed'];
                doubleDosePct = data[i]['% Double Dose'];
                for (let j = 0; j < colNames.length; j++){
                    vals.push(+data[i][colNames[j]]);
                }
            }
        }
        if (popScaled){
            let myPrevReduc = new PrevalenceReduction(htmlElt, NCIRCLES*popPct-1, unvaxPct*vals[0]/1000,doubleDosePct*vals[1]/1000, height, width);
        }
        else{
            let myPrevReduc = new PrevalenceReduction(htmlElt, nCircles, vals[0]/1000,vals[1]/1000, height, width);
        }
    });
}

// Data privacy visualization
d3.csv('data/adult.csv', function(data) {
    console.log(data)
    let privViz = new PrivacyCircle('priv-viz', data)
    d3.select('#Age')
        .on('change', () => {
            privViz.wrangleData();
        })
    d3.select('#Race')
        .on('change', () => {
            privViz.wrangleData();
        })
    d3.select('#Sex')
        .on('change', () => {
            privViz.wrangleData();
        })
})

function changePerspective(){
    myScatter.changePerspective();
}



