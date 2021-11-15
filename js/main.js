
let prevReducViz = new PrevalenceReduction("prevReduc", 100, 10, .62, .1396);

// Load CSV file
function loadHistogram(htmlElt, fileName, rowNames, colNames) {

    // get the data
    d3.csv("data/"+fileName, function(error, data) {
        if (error) throw error;

        let casevals = [];
        let labels = [];

        for (let i = 0; i < data.length; i++) {
            let ages = data[i]['Name'];
            if (rowNames.includes(ages)){
                let vals = [];
                for (let j = 0; j < colNames.length; j++){
                    vals.push(+data[i][colNames[j]]);
                }
                casevals.push(vals);

                console.log(ages);
                labels.push(ages);
            }
        }
        let myhist = new NewHist(htmlElt, casevals, labels, colNames);
    });
}
let colNames = ['# Serious Cases per 100k Unvaxed', '# Serious Cases per 100k Double Dose']
let moreColNames = ['# Serious Cases per 100k Unvaxed', '# Serious Cases per 100k Double Dose','# Serious Cases per 100k Boosted'];

let rowNames1 = ['All ages'];
let rowNames2 = ['< 50', '>= 50'];
let rowNames3 = ['12-15', '16-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90+'];


loadHistogram("myHistIsrAug15", "IL_Aug15.csv", rowNames1, colNames);
loadHistogram("myHistIsrAug15Age2", "IL_Aug15.csv", rowNames2, colNames);
loadHistogram("myHistIsrAug15Age10", "IL_Aug15_ByAge.csv", rowNames3, colNames);
loadHistogram("myHistIsrSep2", "IL_Sep2.csv", rowNames1, colNames);
loadHistogram("myHistIsrSep2Age2", "IL_Sep2.csv", rowNames2, colNames);
loadHistogram("myHistIsrSep2Age10", "IL_Sep2_ByAge.csv", rowNames3, colNames);
loadHistogram("myHistIsrSep20Age10", "IL_Sep20_ByAge.csv", rowNames3, moreColNames);

