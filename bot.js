//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const fetch = require("node-fetch");
const znake = require("./znake");
const znake_renderer = require("./znake_renderer");
const util = require('util')
const consts = require("./constz");

// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("This is a snake like game for messenger!");
  res.end();
});

app.get('/znake', function(req, res) {
  let game = JSON.parse(req.query.game);
  
  res.writeHead(200, {'Content-Type': 'image/png'});
  res.write(znake_renderer.createImage(game));
  res.end();
});

app.get("/tos", (req, res) => {
    res.send('Tos <br/> No data is saved on server, this is just a demo app!');
});



// Message processing
// Message handler
app.post("/webhook", (req, res) => {
  // Parse the Messenger payload
  // See the Webhook reference
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference
  const data = req.body;

  if (data.object === "page") {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
       
        const sender = event.sender.id;

        
        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
       
          // We could retrieve the user's current session, or create one if it doesn't exist
          // This is useful if we want our bot to figure out the conversation history
          // const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const { text, attachments , quick_reply} = event.message;
           console.log(">>>>>>>>>>>>>>>>event<<<<<<<<<<<<<<<<<<<")
           console.log(util.inspect(event, false, null, true))
           console.log(">>>>>>>>>>>>>>>>event<<<<<<<<<<<<<<<<<<<")
          if (attachments) {
             console.log("#########ATTACHMENT");
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(
              sender,
              "Sorry I can only process text messages for now."
            ).catch(console.error);
          } else if(quick_reply){
            var gameAction = JSON.parse(quick_reply.payload)
            console.log("#########QUICK_REPLY");
            
            if(gameAction.newGame == true){
              fbSend(znake.startGame(sender, gameAction.ui, false)).catch(console.error);
            }else{
              fbSend(znake.playGame(sender, gameAction)).catch(console.error);
            }
          
          }  else if (text) {
            console.log("#########TEXT");
            //anything the user says will start a game
            if(text == consts.CMD_UI){
              fbSend(znake.startGame(sender, true, false)).catch(console.error);    
            }else if(text == consts.CMD_UI_CHEAT){
              fbSend(znake.startGame(sender, true, true)).catch(console.error);    
            }else if(text == consts.CMD_CHEAT){
              fbSend(znake.startGame(sender, false, true)).catch(console.error);    
            }else{
              fbSend(znake.startGame(sender, false, false)).catch(console.error);        
            }
          }
        } else if (event.postback ) {
          var gameAction = JSON.parse(event.postback.payload)
          console.log("#########POSTBACK");
          //console.log("Postback gameAction:", gameAction.length);
          
           // console.log(">>>>>>>>>>>>>>>>what we got start <<<<<<<<<<<<<<<<<<<")
           // console.log(util.inspect(gameAction, false, null, true))
           // console.log(">>>>>>>>>>>>>>>>what we got end <<<<<<<<<<<<<<<<<<<")
           
          if(gameAction.newGame == true){
            fbSend(znake.startGame(sender, gameAction.ui, false)).catch(console.error);
          }else{
            fbSend(znake.playGame(sender, gameAction)).catch(console.error);
          }
          
          
          //fbMessage(sender, "TODO -  move at "+  gameAction.direction)
      
          
          
        } else {
          console.log("received event", JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});



//send a fb msg


const fbMessage = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text }
  });
  fbSend(body).catch(console.error);;
};

const fbSend = (body) => {
  const qs = "access_token=" + process.env.PAGE_ACCESS_TOKEN;
  return fetch("https://graph.facebook.com/me/messages?" + qs, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  })
    .then(rsp => rsp.json())
    .then(json => {
      if (json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
};




// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});
