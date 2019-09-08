//jshint esversion:6

//'importing' express.
const express = require('express');

//specifies that this app will be using express.
const app = express();

//static AWS EC2 instance server port. Edit with caution.
const serverPort = 5000;

//AWS EC2 instance Base URL for remote access.
const awsEc2InstanceBaseUrl
  = "http://ec2-34-219-122-169.us-west-2.compute.amazonaws.com" + ":" + serverPort;

//Handle all root requests.
app.get("/", function(request, response) {
  response.send("Hello, World!");
});

//Start-up behaviour.
app.listen(serverPort, function() {
  console.log("Server started on AWS EC2 instance: " + awsEc2InstanceBaseUrl);
  console.log("You may access the server locally via: http://localhost:" + serverPort);
});
