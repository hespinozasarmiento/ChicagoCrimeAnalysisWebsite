//jshint esversion:6

//TODO:

/*
- implement HasmMap for enhanced processing speed(?)
- update the query, apparently, the year does not need to be specified as
  a query parameter, just in the WHERE clause.  This will return a list of
  primaryTypes and will dramatically simplify the parsing code.
- modularize methods that handle the processing of the API data.
- Modifying the chart's dimentions should be controlled via CSS.
- the crimesByYearAndWard canvas shows wards on x-axis, but out of order.
*/

const chicagoCrimePortalApiBaseUrl = "https://data.cityofchicago.org/resource/ijzp-q8t2.csv";

var crimesByYearButton = document.querySelector("#crimesByYearButton");
var crimesByYearAndWardButton = document.querySelector("#crimesByYearAndWardButton");
var crimeTrendsByYearButton = document.querySelector("#crimeTrendsByYearButton");

//Initiating objects to hold charts data (these will be instantiated later)
var crimeFrequencyByYearChart = null;
var crimeFrequencyByYearAndWardChart = null;
var crimeTrendsByYearChart = null;


//set click event listeners
crimesByYearButton.addEventListener("click", renderCrimesByYearChart);
crimesByYearAndWardButton.addEventListener("click", renderCrimesByYearAndWardChart);
crimeTrendsByYearButton.addEventListener("click", renderCrimeTrendsByYearChart);

function renderCrimesByYearChart() {

  //Isolate the drop-down HTML item.
  var crimesByYearDropDown = document.getElementById("crimes-by-year-drop-down");

  //Extract the user-selected year from the drop-down.
  var selectedYear = crimesByYearDropDown.options[crimesByYearDropDown.selectedIndex].value;

  const testApiEndpoint = chicagoCrimePortalApiBaseUrl +
    "?$query=SELECT primary_type WHERE year = " +
    selectedYear +
    " LIMIT 50000000000";

  //Make the API call:
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
  for (var i = 1; i < rows.length; i++) {

    //extract the primary_type value:
    var currentPrimaryType = rows[i];

    //populate arrays
    //first, check the presence of the primaryType in the primaryTypes array
    if (primaryTypesArray.includes(currentPrimaryType)) {
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
    primaryTypesFrequencyCountsArray, selectedYear + " Crime Frequency");

} //This function needs heavy refactoring.


function renderCrimesByYearAndWardChart() {
  var crimesByYearAndWardDropdown = document.querySelector("#crimesByYearAndWardDropDown");

  var yearSelectedByUser =
    crimesByYearAndWardDropdown.options[crimesByYearAndWardDropdown.selectedIndex].value;

  console.log("User selected year: " + yearSelectedByUser);

  var apiEndpoint = "https://data.cityofchicago.org/resource/ijzp-q8t2.csv?$query=SELECT ward WHERE year = " + yearSelectedByUser + " LIMIT 50000000";

  //Make the API call:
  var csvData = makeApiCall(apiEndpoint);

  //TODO: find counts of how many crimes occurred in each ward.
  //wards = x axis, count = y axis for the given year.

  var rows = parseCsvRows(csvData);

  var uniqueWardsAndFrequencies = countUniqueWardsAndCrimeFrequencies(rows);
  var individualWards = uniqueWardsAndFrequencies[0];
  var crimeCountsPerWard = uniqueWardsAndFrequencies[1];

  displayCrimesByYearAndWardBarChart(individualWards,
    crimeCountsPerWard,
    yearSelectedByUser + " crime counts per ward");
}


function countUniqueWardsAndCrimeFrequencies(allCrimesForyear) {
  var a = [],
    b = [],
    prev;
  allCrimesForyear.sort();

  for (var i = 0; i < allCrimesForyear.length; i++) {
    if (allCrimesForyear[i] !== prev) {
      a.push(allCrimesForyear[i]);
      b.push(1);
    } else {
      b[b.length - 1]++;
    }
    prev = allCrimesForyear[i];
  }

  return [a, b];
}

function renderCrimeTrendsByYearChart() {
  displayCrimeTrendsByYearChart();
}


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
 * @param  string year        The year that the data corresponds to.
 */
function displayBarChartGivenDataAndLabels(xAxisLabels, data, chartName) {

  //If the chart already contains data on it, destroy it.
  if (crimeFrequencyByYearChart != null) {
    crimeFrequencyByYearChart.destroy();
  }

  //construct a new Chart object on the canvas.
  var ctx = document.getElementById('crimes-by-year-canvas').getContext('2d');
  crimeFrequencyByYearChart = new Chart(ctx, {
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

}


function displayCrimesByYearAndWardBarChart(xAxisLabels, data, chartName) {

  //If the chart already contains data on it, destroy it.
  if (crimeFrequencyByYearAndWardChart != null) {
    crimeFrequencyByYearAndWardChart.destroy();
  }

  //construct a new Chart object on the canvas.
  var ctx = document.getElementById('crimesByYearAndWardCanvas').getContext('2d');
  crimeFrequencyByYearAndWardChart = new Chart(ctx, {
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

}

function randomColorGenerator() {
  var color1 = Math.floor(Math.random() * 255) + 1;
  var color2 = Math.floor(Math.random() * 255) + 1;
  var color3 = Math.floor(Math.random() * 255) + 1;
  return "rgb(" + color1 + "," + color2 + "," + color3 + ")";
}

function fetchAnnualCrimeCounts() {

  //TODO There has to be a better way of populating this array.
  var years = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2016, 2017, 2018, 2019];

  for(var i = 0; i < years.length; i++) {
    var annualCrimeFrequenciesQuery = "https://data.cityofchicago.org/resource/6zsd-86xi.json?$select=primary_type,COUNT(primary_type)&$group=primary_type&year=" + years[i];
    var jsonResponse = makeApiCall(annualCrimeFrequenciesQuery);
    console.log(JSON.parse(jsonResponse));
  }

}

function displayCrimeTrendsByYearChart() {

  var allDatasets = []; //will hold all datasets
  var allLabels = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009]; //will hold all of the labels on the x axis (years)

  var crimeFrequencies0 = [0, 20, 30, 40, 50, 60, null, 80, 90, 30];
  var crimeLabel0 = "someCrime0";

  var crimeFrequencies1 = [0, 40, 60, 70, 80, null, 100, 110, 120, 20];
  var crimeLabel1 = "someCrime1";

  var dataset0 = {
    data: crimeFrequencies0,
    label: crimeLabel0,
    borderColor: randomColorGenerator(),
    fill: false
  };

  var dataset1 = {
    data: crimeFrequencies1,
    label: crimeLabel1,
    borderColor: randomColorGenerator(),
    fill: false
  };

  //store all of te datasets
  allDatasets.push(dataset0);

  allDatasets.push(dataset1);

  console.log("all datasets: " + allDatasets.toString());
  console.log("all labels: " + allLabels.toString());

  var ctx = document.getElementById("crimeTrendsByYearCanvas");
  crimeTrendsByYearChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: allDatasets
    },
    options: {
      title: {
        display: true,
        text: 'Chicago Crime Trends per Crime'
      }
    }

  });

  fetchAnnualCrimeCounts();

}
