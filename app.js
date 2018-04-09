var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token") {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// Facebook Webhook
// Used for verification
app.get("/userwebhook", function (req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token") {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/userwebhook", function (req, res) {
  // Make sure this is a page subscription
   {
      console.log("WebhookUser"+JSON.stringify(req.body));
      request.post(
          'http://uitenglish.azurewebsites.net/Webhook/ReceivePost',
          { json: req.body },
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                  console.log(body)
              }
          }
      );
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          //processPostback(event);
        }
      });
    });

    res.sendStatus(200);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
    // Make sure this is a page subscription
     {
        console.log("UIT"+JSON.stringify(req.body));
        request.post(
            'http://uitenglish.azurewebsites.net/YourAccount/ReceivePost',
            { json: req.body },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );
      // Iterate over each entry
      // There may be multiple entries if batched
      req.body.entry.forEach(function(entry) {
        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.postback) {
            //processPostback(event);
          }
        });
      });
  
      res.sendStatus(200);
    }
  });
  
  function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;
  
    if (payload === "Greeting") {
      // Get user's first name from the User Profile API
      // and include it in the greeting
      request({
        url: "https://graph.facebook.com/v2.6/" + senderId,
        qs: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
          fields: "first_name"
        },
        method: "GET"
      }, function(error, response, body) {
        var greeting = "";
        if (error) {
          console.log("Error getting user's name: " +  error);
        } else {
          var bodyObj = JSON.parse(body);
          name = bodyObj.first_name;
          greeting = "Hi " + name + ". ";
        }
        var message = greeting + "My name is SP Movie Bot. I can tell you various details regarding movies. What movie would you like to know about?";
        sendMessage(senderId, {text: message});
      });
    }
  }
  
  // sends message to user
  function sendMessage(recipientId, message) {
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json: {
        recipient: {id: recipientId},
        message: message,
      }
    }, function(error, response, body) {
      if (error) {
        console.log("Error sending message: " + response.error);
      }
    });
  }

  // All callbacks for Messenger will be POST-ed here
app.get("/dictionary", function (req, res) {
  // Make sure this is a page subscription
   {
    var options = {
      url: 'http://uitenglish.azurewebsites.net/Dictionary/getDictToExtension?contain='+req.query.voca,
      headers: {
        'Cache': 'no-cache',
        credentials: 'include',
        Cookie : req.headers.cookie
      }
    };
      request.post(
        options,
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                res.send(response.body);
              }
          }
      );
  }
});

app.get("/saveword", function (req, res) {
  // Make sure this is a page subscription
   {
    var options = {
      url: 'http://uitenglish.azurewebsites.net/Dictionary/saveWord?Voca='+req.query.voca,
      headers: {
        'Cache': 'no-cache',
        credentials: 'include',
        Cookie : req.headers.cookie
      }
    };
      request.post(
        options,
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                res.send(response.body);
              }
          }
      );
  }
});

  // All callbacks for Messenger will be POST-ed here
  app.get("/verifyToken",function (req, res) {
    // Make sure this is a page subscription
   // console.log(jsonParser);
    console.log(req.body);
     {
      var options = {
        url: 'http://uitenglish.azurewebsites.net/Dictionary/verifyToken',
        headers: {
          'Cache': 'no-cache',
          credentials: 'include',
          cookie : req.headers.cookie
        }
      };
        request.get(
          options,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  res.send(response.body);
                }
            }
        );
    }
  });


  // pings server every 15 minutes to prevent dynos from sleeping
setInterval(() => {
  http.get('https://uitenglishbot.herokuapp.com');
  http.get('http://uitenglish.azurewebsites.net/Dictionary/notifyMessenger');
}, 900000);

  // pings server every 15 minutes to prevent dynos from sleeping;

  // Facebook Webhook

