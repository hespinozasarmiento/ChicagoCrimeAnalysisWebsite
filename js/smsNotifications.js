var sendSmsButton = document.querySelector("#sendSmsButton");

sendSmsButton.addEventListener("click", sendSmsMessage);

function sendSmsMessage() {
  console.log("Making the call!");
  var response = makeApiCall("http://localhost:5000/sendSms");
  console.log("returned from making the call!");
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
