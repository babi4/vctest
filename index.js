'use strict';
//thanks @voronianski and https://github.com/voronianski/simon-le-bottle


// Getting started with Facebook Messaging Platform
// https://developers.facebook.com/docs/messenger-platform/quickstart

var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');

var pageToken = 'CAAOSu26iyH0BAMW1oRnoelPH2zlNetAldDxZBIBrHaLnatOsA32WvYaeaBMZAjV7wmN9Oo8o4C1bK21JHXzDy9UKu2SL9mjZAgwNWvl5PMK3c3qzpSGj1vtOnMoyVT3N2V4LwhZCS94KGov2QYfcHNG761yZCmZAe4F6Qtq9Jz1xZBPJ6s4yRn7ZAp7pKvg1AV1nzvMbJKQOBQZDZD';
var verifyToken = 'HELLO-VC-TESTERS';

var app = express();


app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === verifyToken) {
        return res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

app.post('/webhook', function(req, res) {
    var messagingEvents = req.body.entry[0].messaging;

    messagingEvents.forEach(function(event) {
        var sender = event.sender.id;

        if (event.postback) {
            var text = JSON.stringify(event.postback).substring(0, 200);
            sendTextMessage(sender, 'Postback received: ' + text);
        } else if (event.message && event.message.text) {
            var text = event.message.text.trim().substring(0, 200);

            if (text.toLowerCase() === 'generic') {
                sendGenericMessage(sender);
            } else {
                sendTextMessage(sender, 'Text received, echo: ' + text);
            }
        }
    });

    res.sendStatus(200);
});

function sendMessage (sender, message) {
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            message: message
        })
        .end(function (err, res) {
            if (err) {
                console.log('Error sending message: ', err);
            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
        });
}

function sendTextMessage (sender, text) {
    sendMessage(sender, {
        text: text
    });
}

function sendGenericMessage (sender) {
    sendMessage(sender, {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'generic',
                elements: [{
                    title: 'First card',
                    subtitle: 'Element #1 of an hscroll',
                    image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
                    buttons: [{
                        type: 'web_url',
                        url: 'https://www.messenger.com/',
                        title: 'Web url'
                    }, {
                        type: 'postback',
                        title: 'Postback',
                        payload: 'Payload for first element in a generic bubble'
                    }]
                }, {
                    title: 'Second card',
                    subtitle: 'Element #2 of an hscroll',
                    image_url: 'http://messengerdemo.parseapp.com/img/gearvr.png',
                    buttons: [{
                        type: 'postback',
                        title: 'Postback',
                        payload: 'Payload for second element in a generic bubble'
                    }]
                }]
            }
        }
    });
}

