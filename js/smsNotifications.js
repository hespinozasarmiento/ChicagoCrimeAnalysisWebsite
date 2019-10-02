var registrationButton = document.querySelector("#registrationButton");
var smsRegistrationForm = document.querySelector("#notificationSignUpForm");

smsRegistrationForm.addEventListener("click", sendSmsMessage);

function sendSmsMessage() {
  console.log("Making the call!");
  var phoneNumber = document.querySelector().value;
  console.log("entered phone number: " + phoneNumber);

  //var response = makeApiCall("http://localhost:5000/sendSms?phoneNumber=" + phoneNumber);
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
