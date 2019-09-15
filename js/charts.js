//jshint esversion:6

var paragraph = document.querySelector("#paragraph");

//set click event listener
paragraph.addEventListener("click", changeMessage);

function changeMessage() {
  paragraph.textContent = "clicked!";

  const testApiEndpoint
    = "https://data.cityofchicago.org/resource/ijzp-q8t2.csv?$query=SELECT primary_type, year WHERE year = 2019";

  //API call:
  console.log("Making request now!");
  var csvData = makeApiCall(testApiEndpoint);

  //Log the returned data
  //console.log(csvData);
  const rows = parseCsvRows(csvData);
  const columns = parseCsvColumns(csvData);

  //In the columns array, the primary_type = index 0. The year = index 1
  console.log(rows[0]);


  //Figuring out how to map multiple values to a single key in js:
  var primaryTypesArray = [];
  var primaryTypesFrequencyCountsArray = [];

  //TODO A HashMap should be written from scratch to handle these kinds of
  //associations if the processing speed for these methods becomes unacceptable.
  //Each row's contents are successfully extracted.  We need to parse the row's
  //key, value pairs and store them into the appropriate array (keeping counts).

  /* Iterate through each row (starting at row 1. Row 0 is not desired,
   * as it only contains column label names)
   */
  for(var i = 1; i < rows.length; i++) {

    var currentRow = rows[i];

    //extract the primary_type value:
    var primary_type = currentRow.split(',');
    console.log("row primary_type: " + primary_type);
  }

} //This function needs heavy refactoring.

function makeApiCall(query) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", query, false); // false for synchronous request
  xmlHttp.send(null);

  var responseBody = xmlHttp.responseText.toString();
  return responseBody;
}


function parseCsvColumns(csvDataToParse) {
  return csvDataToParse.split(',');
}

function parseCsvRows(csvDataToParse) {
  return csvDataToParse.split('\n');
}


var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
      responsive: false,
      maintainAspectRation: false,
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
canvas.style.length = "250px";
canvas.style.width = "350px";
