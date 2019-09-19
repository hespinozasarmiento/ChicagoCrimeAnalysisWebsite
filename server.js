//jshint esversion:6

//'importing' express.
const express = require('express');

//importing bodyParser
const bodyParser = require('body-parser');

//importing path for accessing directories in different levels.
var path = require('path');

//specifies that this app will be using express.
const app = express();

//Allow the use of javascript static files in project directory (located in /js).
app.use('/js', express.static(__dirname + '/js'));

app.use('/node_modules', express.static(__dirname + '/node_modules'));

//Configure bodyParser before using.
app.use(bodyParser.urlencoded({extended:true}));

//static AWS EC2 instance server port. Edit with caution.
const serverPort = 5000;

//AWS EC2 instance Base URL for remote access.
const awsEc2InstanceBaseUrl
  = "http://ec2-34-219-122-169.us-west-2.compute.amazonaws.com" + ":" + serverPort;

//Handle all root requests.
app.get("/", function(req, res) {
  res.sendFile(path.resolve("index.html"));
});

app.get("/charts", function(req, res) {
  res.sendFile(path.resolve("html/charts.html"));
});

app.get("/smsNotifications", function(req, res) {
  res.sendFile(path.resolve("html/smsNotifications.html"));
});

//Start-up behaviour.
app.listen(serverPort, function() {
  console.log("Server started on AWS EC2 instance: " + awsEc2InstanceBaseUrl);
  console.log("You may access the server locally via: http://localhost:" + serverPort);
});
