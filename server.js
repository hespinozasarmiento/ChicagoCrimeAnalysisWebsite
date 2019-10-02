//jshint esversion:6

//adding all required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');

//specifies that this app will be using express.
const app = express();

//middleware for processing POST requests a bit easier.
app.use(bodyParser.urlencoded({extended: false}));

//Allow the use of static files in project directory
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

//static AWS EC2 instance server port. Edit with caution.
const serverPort = 5000;

//AWS EC2 instance Base URL for remote access.
const awsEc2InstanceBaseUrl
  = "http://ec2-34-219-122-169.us-west-2.compute.amazonaws.com" + ":" + serverPort;

//Handle all root requests.
app.get("/", function(req, res) {
  res.sendFile(path.resolve("index.html"));
});

app.get("/index.html", function(req, res) {
  res.sendFile(path.resolve("index.html"));
});

app.get("/charts.html", function(req, res) {
  res.sendFile(path.resolve("html/charts.html"));
});

app.get("/crimeNews.html", function(req, res) {
  res.sendFile(path.resolve("html/crimeNews.html"));
});


app.post('/create_subscriber', (req, res) => {
  console.log("Trying to create a new user.");
  console.log("First Name: " + req.body.firstName);
  console.log("Last Name: " + req.body.lastName);
  console.log("Ward Number: " + req.body.wardNumber);
  console.log("Phone Number: " + req.body.phoneNumber);
  res.end();
});


app.get("/smsNotifications.html", function(req, res) {
  //if a phone number was provided in the query, process it.
  if(req.query.phoneNumber) {
    // Find your account sid and auth token in your Twilio account Console.
    var client = new twilio('AC2c3ea4c8bab866082211221e9d34ff35', 'fd3c5e3ba5a4e42cfa6b42496727ea66');
    var phoneNumber = req.query.phoneNumber;

    // Send the text message.
    client.messages.create({
     to: phoneNumber,
     from: '18722527725',
     body: 'Hello from Twilio! This is an initial text message.'
    });

    console.log("Text sent");
    res.send('All done');
  } else {
    //No query arguments were passed in; meaning this was not a submit form event.
    res.sendFile(path.resolve("html/smsNotifications.html"));
  }

});

//Start-up behaviour.
app.listen(serverPort, function() {
  console.log("Server started on AWS EC2 instance: " + awsEc2InstanceBaseUrl);
  console.log("You may access the server locally via: http://localhost:" + serverPort);
});
