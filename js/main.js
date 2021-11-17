
let colNames = ['# Serious Cases per 100k Unvaxed', '# Serious Cases per 100k Double Dose']
let moreColNames = ['# Serious Cases per 100k Unvaxed', '# Serious Cases per 100k Double Dose','# Serious Cases per 100k Boosted'];
let rowNames1 = ['All ages'];
let rowNames2 = ['12-49', '>= 50'];
let rowNames3 = ['12-15', '16-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90+'];

// page 1
let prevReducViz1 = new PrevalenceReduction("prevReduc1", 900, .62, .1396);

// page 2
let prevReducViz2 = new PrevalenceReduction("prevReduc2", 900, .62, .1396);
loadPrevalenceReduction("prevReduc3","IL_Aug15.csv","All ages", colNames, false);

// page 3
loadPrevalenceReduction("prevReduc4","IL_Aug15.csv","All ages", colNames, false);

// page 4
loadPrevalenceReduction("prevReduc5","IL_Aug15.csv","12-49", colNames, false);
loadPrevalenceReduction("prevReduc6","IL_Aug15.csv",">= 50", colNames, false);

// page 5
loadPrevalenceReduction("prevReduc4Age","IL_Aug15.csv","All ages", colNames, true);
loadPrevalenceReduction("prevReduc5Age","IL_Aug15.csv","12-49", colNames, true);
loadPrevalenceReduction("prevReduc6Age","IL_Aug15.csv",">= 50", colNames, true);

// page 6
let prevReducViz7 = new PrevalenceReduction("prevReduc7", 900, .9, .1);
loadPrevalenceReduction("prevReduc8","IL_Aug15.csv","All ages", colNames, false);
let prevReducViz9 = new PrevalenceReduction("prevReduc9", 900, .5, .5);
loadPrevalenceReduction("prevReduc10","IL_Aug15.csv","12-49", colNames, false);
let prevReducViz11 = new PrevalenceReduction("prevReduc11", 900, .5, .5);
loadPrevalenceReduction("prevReduc12","IL_Aug15.csv",">= 50", colNames, false);


loadHistogram("myHistIsrAug15", "IL_Aug15.csv", rowNames1, colNames);
loadHistogram("myHistIsrAug15Age2", "IL_Aug15.csv", rowNames2, colNames);
loadHistogram("myHistIsrAug15Age10", "IL_Aug15_ByAge.csv", rowNames3, colNames);
loadHistogram("myHistIsrSep2", "IL_Sep2.csv", rowNames1, colNames);
loadHistogram("myHistIsrSep2Age2", "IL_Sep2.csv", rowNames2, colNames);
loadHistogram("myHistIsrSep2Age10", "IL_Sep2_ByAge.csv", rowNames3, colNames);
loadHistogram("myHistIsrSep20Age10", "IL_Sep20_ByAge.csv", rowNames3, moreColNames);


// Load CSV file
function loadHistogram(htmlElt, fileName, rowNames, colNames) {

    // get the data
    d3.csv("data/"+fileName, function(error, data) {
        if (error) throw error;

        let casevals = [];
        let agelabels = [];

        for (let i = 0; i < data.length; i++) {
            let ages = data[i]['Name'];
            if (rowNames.includes(ages)){
                let vals = [];
                for (let j = 0; j < colNames.length; j++){
                    vals.push(+data[i][colNames[j]]);
                }
                casevals.push(vals);
                agelabels.push(ages);
            }
        }
        let myhist = new NewHist(htmlElt, casevals, agelabels, colNames);
    });
}


function loadPrevalenceReduction(htmlElt, fileName, rowName, colNames, popScaled) {

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
            let myPrevReduc = new PrevalenceReduction(htmlElt, 900*popPct, unvaxPct*vals[0]/1000,doubleDosePct*vals[1]/1000);
        }
        else{
            let myPrevReduc = new PrevalenceReduction(htmlElt, 900, vals[0]/1000,vals[1]/1000);
        }
    });
}





