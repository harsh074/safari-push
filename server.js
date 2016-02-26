var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'), 
    port,
    pushLib = require('safari-push-notifications'),
    path = require('path');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

function createSignature(){

    var cert = fs.readFileSync('website_aps_production.pem'),
        key = fs.readFileSync('webpushcertificate.pem'),
        websiteJson = pushLib.websiteJSON(
            "Safari Push Test", // websiteName 
            "web.com.iomedia.safaripushtest", // websitePushID 
            ["https://safari-push-test.herokuapp.com/"], // allowedDomains 
            "https://safari-push-test.herokuapp.com/%@/", // urlFormatString 
            0123456789012345, // authenticationToken (zeroFilled to fit 16 chars) 
            "https://safari-push-test.herokuapp.com/" // webServiceURL (Must be https!) 
        );
    var zipBuffer = pushLib.generatePackage(
            websiteJson, // The object from before / your own website.json object 
            path.join("assets", "safari_assets"), // Folder containing the iconset 
            cert, // Certificate 
            key // Private Key 
        );
 
    fs.writeFileSync("pushPackage.zip", zipBuffer);
    console.log("success");
} 

// createSignature();
/**
Safari will connect to this endpoint to look for your push package
*/
app.post('/v1/pushPackages/:websitePushID', function (req, res) {
    console.log('website push id', req.params.websitePushID);
    var file = fs.readFileSync('pushPackage.zip');
    res.set({
        'Content-type': 'application/zip'
    });
    res.send( file );
});

/**
Safari will connect to this endpoint to once the user allows push notifications.
This is where you should probably do something with the token
*/
app.post('/v1/devices/:deviceToken/registrations/:websitePushID', function (req, res) {
    console.log('tokens', req.params.deviceToken);
    res.send(200);
});


/**
Safari will connect to this endpoint to if the user wants to remove push notifications.
This is where you should probably remove the token from a database or something
*/
app.delete('/v1/devices/:deviceToken/registrations/:websitePushID', function (req, res) {
    console.log('tokens', req.params.deviceToken);
    res.send(200);
});

/**
Safari will connect to this endpoint when errors occur.
*/
app.post('/v1/log', function (req, res) {
    // Do Logging Stuff
    console.log(req.body.logs);
    res.status(200).end();
});


// port = process.env.PORT || 5000;
// app.listen(port, function () {
//     console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), port);
// });
