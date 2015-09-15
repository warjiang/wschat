# wschat
chat based on websocket, use sockjs instead of sockets.io


# demo 
```
//follow by  https://github.com/jinzhangg
var express = require('express');
var sockjs  = require('sockjs');
var http    = require('http');
var redis   = require('redis');


// Redis publisher
var publisher = redis.createClient(6379, '192.168.234.128',{});

// Sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_chat = sockjs.createServer(sockjs_opts);
sockjs_chat.on('connection', function(conn) {
    var browser = redis.createClient(6379, '192.168.234.128',{});
    browser.subscribe('chat_channel');

    // When we see a message on chat_channel, send it to the browser
    browser.on("message", function(channel, message){
        conn.write(message);
    });

    // When we receive a message from browser, send it to be published
    conn.on('data', function(message) {
        publisher.publish('chat_channel', message);
    });
});

// Express server
var app = express();
var server = http.createServer(app);

sockjs_chat.installHandlers(server, {prefix:'/chat'});

console.log('Listening on 0.0.0.0:3001' );server.listen(9001, '0.0.0.0');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
```

# sockjs-client/index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <title>Sock chat</title>
</head>
<body>
<textarea id="chat-content" style="width:500px;height:300px"></textarea><br/>
<input type="text" id="username" placeholder="Choose username"/>
<input type="text" id="message" placeholder="Enter chat message"/>
<input type="button" value="Send" onclick="sendMessage()"/>

<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
<script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
<script src="index.js" ></script>
</body>
</html>
```
# sockjs-client/index.js
```
// Create a connection to http://localhost:9999/echo
var sock = new SockJS('http://localhost:9999/echo');

// Open the connection
sock.onopen = function() {
    console.log('open');
};

// On connection close
sock.onclose = function() {
    console.log('close');
};

// On receive message from server
sock.onmessage = function(e) {
    // Get the content
    var content = JSON.parse(e.data);

    // Append the text to text area (using jQuery)
    $('#chat-content').val(function(i, text){
        return text + 'User ' + content.username + ': ' + content.message + '\n';
    });

};

// Function for sending the message to server
function sendMessage(){
    // Get the content from the textbox
    var message = $('#message').val();
    var username = $('#username').val();

    // The object to send
    var send = {
        message: message,
        username: username
    };

    // Send it now
    sock.send(JSON.stringify(send));
}

```
# ui-router DI demo
```

//DI $stateProvider, $urlRouterProvider
/*$stateProvider
//根ui-view
    .state('home',{
        url:'/home',
        templateUrl:'templates/home.html'
    })
//嵌入ui-view
    .state('home.state1', {
        url: '/state1',
        controller: 'state1Controller',
        templateUrl: 'templates/state1.html',
        resolve: {
        loadstate1Controller: function ($ocLazyLoad) {
            return $ocLazyLoad.load({
                name: 'chatApp',
                files: [
                    'js/controllers/state1Controller.js'
                ]
            })
        }
    }
});

$urlRouterProvider.otherwise("/home/state1");*/
```