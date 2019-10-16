//jshint esversion:6


/**
 * TODO:
 * - Find a way to have the route endpoint paths not have the
 *   names of the files' extensions.  The endpoint names should
 *   be descriptive, not merely the names of the files the browser
 *   renders.
 */

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
app.use('/resources', express.static(__dirname + '/resources'));

//static AWS EC2 instance server port. Edit with caution.
const serverPort = 5000;

//AWS EC2 instance Base URL for remote access.
const awsEc2InstanceBaseUrl
  = "http://ec2-34-219-122-169.us-west-2.compute.amazonaws.com" + ":" + serverPort;


//MongoDB Atlass connection details:
const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://vismark:vismark1994@schoolprojects-kz6w4.mongodb.net/test?retryWrites=true&w=majority";


/**
 * Connects to MongoDB Atlass, and retrieves the specified collection in the
 * soecified MongoDB database.
 *
 * @param  {[type]} databaseName       [description]
 * @param  {[type]} databaseCollection [description]
 * @return {[type]}                    [description]
 */
function connectToDatabase(databaseName, databaseCollection) {

  MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
  	console.log("Attempting connection to MongoDB Atlas.");

  	//specify connection details (database name, and collection name. If they don't exist, they'll be created.)
  	const mongoDbCollection = client.db(databaseName).collection(databaseCollection);
  	console.log("Connection attempt successful.");
    console.log("mongoDbCollection connection: " + mongoDbCollection);
    return mongoDbCollection;
  });

  //print before and after it gets returned
  // console.log("before returning: " + mongoDbCollection);
  // return mongoDbCollection;
}


function insertNewSubscriberIntoSubscribersCollection(newSubscriber,
  mongoDbSubscribersCollection) {

    /*
     * wardNumber is first converted into a string, since this is the format the
     * wardNumber is stored as in the MongoDB collection.
     */
    let subscriberWardNumber = Number(newSubscriber.wardNumber);
    let documentByWardNumberQuery = {ward: subscriberWardNumber};
    let pushNewSubscriberToSubscriberListQuery = { $push: {'subscribers': newSubscriber}};

    console.log('inside method for updating: ' + mongoDbSubscribersCollection);

    mongoDbSubscribersCollection.updateOne(documentByWardNumberQuery, pushNewSubscriberToSubscriberListQuery, function(err, res) {
      if (err) throw err;
      console.log("Successfully added the following subscriber to ward " + subscriberWardNumber + ": " + JSON.stringify(newSubscriber));
    });
}

function removeSubscriberFromSubscribersCollection(subscriberDetails, mongoDbSubscribersCollection) {
  let documentByWardNumberQuery = {ward: Number(subscriberDetails.wardNumber)};
  let removeSubscriberFromSubscriberListQuery = { $pull: {'subscribers': subscriberDetails}};

  mongoDbSubscribersCollection.updateOne(documentByWardNumberQuery, removeSubscriberFromSubscriberListQuery, function(err, res) {
    if (err) //Catch error -- if any.
      throw err; // throw error.

    console.log("Deleted the following subscriber: " + JSON.stringify(subscriberDetails));
  });

}


function extractNewSubscriberDetails(newSubscriberReqDetails) {
  let newSubscriber = {
    firstName: newSubscriberReqDetails.body.firstName,
    lastName: newSubscriberReqDetails.body.lastName,
    wardNumber: newSubscriberReqDetails.body.wardNumber,
    phoneNumber: newSubscriberReqDetails.body.phoneNumber
  };
  return newSubscriber;
}

//Handle all root requests.
app.get("/", function(req, res) {
  res.sendFile(path.resolve("index.html"));
});

app.get("/index.html", function(req, res) {
  res.sendFile(path.resolve("index.html"));
});

app.get("/crimeStatistics.html", function(req, res) {
  res.sendFile(path.resolve("html/crimeStatistics.html"));
});

app.get("/crimeNews.html", function(req, res) {
  res.sendFile(path.resolve("html/crimeNews.html"));
});

app.post('/update_subscription_collection', (req, res) => {

  //Store the request form's new subscriber details into an object (`newSubscriber`).
  var subscriberDetails = extractNewSubscriberDetails(req);
  var userRequestedDeletion = req.body.unsubscribe;

  /**
   * A connection to the `subscribersCollection` collection -- which is
   * found within the `chicagoCrimeWebsiteDatabase` database.  This will
   * be used for inserting the `newSubscriber` into the collection.
   */
  //const mongoDbSubscribersCollection = connectToDatabase("chicagoCrimeWebsiteDatabase", "subscribersCollection");

  //should all be moved into function:
  MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
    console.log("Attempting connection to MongoDB Atlas.");

    //specify connection details (database name, and collection name. If they don't exist, they'll be created.)
    const mongoDbSubscribersCollection = client.db("chicagoCrimeWebsiteDatabase").collection("subscribersCollection");
    console.log("Connection attempt successful.");

    if(userRequestedDeletion) {
      //Delete the document that matches the provided user
      removeSubscriberFromSubscribersCollection(subscriberDetails, mongoDbSubscribersCollection);
      res.redirect("/userSuccessfullyRemoved");
    } else {
      //insert new subscriber into the `subscribersCollection` collection:
      insertNewSubscriberIntoSubscribersCollection(subscriberDetails, mongoDbSubscribersCollection);
      res.redirect("/userSuccessfullySubscribed");
    }

    client.close();
  });

});

app.get("/userSuccessfullySubscribed", function(req, res) {
  res.sendFile(path.resolve("html/subscriberAddedSuccessfully.html"));
});

app.get("/userSuccessfullyRemoved", function(req, res) {
  res.sendFile(path.resolve("html/subscriberRemovedSuccessfully.html"));
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
