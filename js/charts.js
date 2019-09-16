//jshint esversion:6

//TODO:

/*
- implement HasmMap for enhanced processing speed(?)
- update the query, apparently, the year does not need to be specified as
  a query parameter, just in the WHERE clause.  This will return a list of
  primaryTypes and will dramatically simplify the parsing code.
- modularize methods that handle the processing of the API data.
*/

var paragraph = document.querySelector("#paragraph");

//set click event listener
paragraph.addEventListener("click", changeMessage);

function changeMessage() {
  paragraph.textContent = "clicked!";

  const testApiEndpoint
    = "https://data.cityofchicago.org/resource/ijzp-q8t2.csv?$query=SELECT primary_type WHERE year = 2019 LIMIT 50000000000";

  //API call:
  console.log("Making request now!");
  var csvData = makeApiCall(testApiEndpoint);

  //Extract the CSV rows and columns
  const rows = parseCsvRows(csvData);
  const columns = parseCsvColumns(csvData);

  //Figuring out how to map multiple values to a single key in js:
  var primaryTypesArray = [];
  var primaryTypesFrequencyCountsArray = [];

  /* Iterate through each row (starting at row 1. Row 0 is not desired,
   * as it only contains column label names)
   */
  for(var i = 1; i < rows.length; i++) {

    //extract the primary_type value:
    var currentPrimaryType = rows[i];

    //populate arrays
    //first, check the presence of the primaryType in the primaryTypes array
    if(primaryTypesArray.includes(currentPrimaryType)) {
       //find the index in which the primaryType is stored in the primaryType array.
       var indexOfExistingPrimaryType = primaryTypesArray.indexOf(currentPrimaryType);

       //update the count for this primarytype in the counts array
       primaryTypesFrequencyCountsArray[indexOfExistingPrimaryType]++;
    } else {
        //Push the new primaryType into the primarytype array
        primaryTypesArray.push(currentPrimaryType);

        //Create a new index for tracking count of this new primaryType
        //in the frequencyCounts array.  Count starts with a count of 1.
        primaryTypesFrequencyCountsArray.push(1);
    }

  }

  //Display the data in a bar graph.
  displayBarChartGivenDataAndLabels(primaryTypesArray,
    primaryTypesFrequencyCountsArray, "2019 Crime Frequency");

} //This function needs heavy refactoring.


/**
 * A method for making a GET request on a specified API endpoint.  The endpoint
 * and necessary parameters are passed in as a single string via the method
 * parameter.
 *
 * @param  string query The full API endpoint to call the GET request on.
 * @return string       The response from the API call -- JSON, CSV, etc.
 */
function makeApiCall(query) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", query, false); // false for synchronous request
  xmlHttp.send(null);

  var responseBody = xmlHttp.responseText.toString();
  return responseBody;
}


/**
 * A method for parsing (extracting) all of the columns within a CSV document.
 * The method will receive a string representation of a CSV document, and parse
 * by the comma (',') delimiter.  Finally, the method will return an array in
 * which each individual element corresponds to a single row in the CSV string.
 *
 * @param  string csvDataToParse A string containing the CSV data to parse.
 * @return array                 An array containing all columns of the CSV.
 */
function parseCsvColumns(csvDataToParse) {
  return csvDataToParse.split(',');
}


/**
 * A method for parsing (extracting) all of the rows within a CSV document.
 * The method will receive a CSV document, and parse by end-of-line character.
 * This will yield an array in which each index is a single row in the CSV
 * file.
 *
 * @param string csvDataToParse A string containing the CSV data to parse.
 * @return array                An array containing all rows of the CSV.
 */
function parseCsvRows(csvDataToParse) {
  return csvDataToParse.split('\n');
}


/**
 * A method that constructs and displays a bar chart given the x axis data
 * labels, along with pertinent data for graphing.
 *
 * @param  array xAxisLabels  The labels to be listed along the X axis.
 * @param  array data         The data to be graphed.
 * @param  string chartName   A desired name for the chart.
 */
function displayBarChartGivenDataAndLabels(xAxisLabels, data, chartName) {
  var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: xAxisLabels,
          datasets: [{
              label: chartName,
              data: data,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 0.5
          }]
      },
      options: {
        responsive: true,
        maintainAspectRation: true,
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
  });

  var canvas = document.querySelector("#myChart");
  canvas.style.length = "400px";
  canvas.style.width = "1400px";
}
