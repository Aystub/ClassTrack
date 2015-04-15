//var app = require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);
//var path = require('path');

var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var directory = require('serve-index');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
var port = 9000;
// Twilio Variables
// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
//var accountSid = 'ACcb6772c21e4a877a59724e4ae0fe3313';
//var authToken = '947e6e10dedfbc614af87e6bc24131d0';
//var client = require('twilio')(accountSid, authToken);



// Server variables
var roomsContainer = {};



  app.get('/home', function(request, response){
    templateVariables = {}
    response.render('home', templateVariables);
  });


app.get('/', function(request, response){
  //console.log(request.query['roomkey']);
  var _userID = request.query['user_id'];
  var _roomkey = request.query['roomkey'];
  var _name = request.query['first_name'] + " " + request.query['last_name'];

  var _initiator = 0;
  //if(connectedUsers.length != 0)
  if(roomsContainer[_roomkey])
  {
    _initiator = 1;
  }

  var constraint = { 'optional':[] };
  
  var arc = request.headers['arc'];
  if(arc == null)
  {
    arc = 'opus/48000';
  }
  var asc = request.headers['asc'];
  if(asc == null)
  {
    user_agent = request.headers['user-agent'];
    asc = '';
    if(user_agent.indexOf('Android') != -1 && user_agent.indexOf('Chrome') != -1){
      asc = 'ISAC/16000';
    }
  }

  var roomObj = [];
  if(!roomsContainer.hasOwnProperty(_roomkey))
  {
    //roomObj['users'] = [_name];
    roomObj['users'] = [];
    roomsContainer[_roomkey] = roomObj;
  }
  //else
  //{
  //  roomsContainer[_roomkey]['users'].push(_name);
  //}
  var _roomMembers = roomsContainer[_roomkey]['users'];
  _roomMembers = {members: _roomMembers};
  
  var templateVariables = 
  {
    user_id: _userID,
    name: _name,
    roomkey: _roomkey,
    user_agent: request.headers['user-agent'],
    audio_send_codec:  asc,
    audio_receive_codec: arc,
    constraints: constraint,
    initiator: _initiator,
    roomMembers: _roomMembers
  }
  response.render('conference', templateVariables);
});

io.on('connection', function(socket){
  
  socket.on('user_id set', function(user_id){
    socket.user_id = user_id;
  });

  socket.on('name set', function(name){
    socket.name = name;
    console.log('Name set: ' + name);
  });

  socket.on('join room', function(room){
    socket.room = room;
    console.log("User ID " + socket.user_id + " (" + socket.name + ") joined room " + room);
    socket.join(room);
    io.to(socket.room).emit('joined', {type: 'joined', name: socket.name})
    roomsContainer[socket.room]['users'].push(socket.name);
    io.to(socket.room).emit('member list', roomsContainer[socket.room]['users']);
    console.log(roomsContainer);
  });

  socket.on('send chat message', function(message){
    io.to(socket.room).emit('receive chat message', {msg: message, name: socket.name});
  });

  socket.on('disconnect', function(){
    console.log("User ID " + socket.user_id + " (" + socket.name + ") disconnected");
    io.to(socket.room).emit('disconnect', {type: 'disconnect', name: socket.name});
    if(roomsContainer[socket.room] && roomsContainer[socket.room]['users'])
    {
      var index = roomsContainer[socket.room]['users'].indexOf(socket.name);
      roomsContainer[socket.room]['users'].splice(index,1);
      if(roomsContainer[socket.room]['users'].length == 0)
      {
        delete roomsContainer[socket.room];
      }
    }
    console.log(roomsContainer);
  });

  socket.on('WebRTC message', function(data){
    socket.broadcast.to(socket.room).emit('WebRTC message', data);
  });
});



http.listen(port, function(){
  console.log('Listening on port ' + port);
});


/**
 * Helper Functions
**/
function findListOfClients(roomId)
{
  var clients_in_the_room = io.sockets.adapter.rooms[roomId]; 
  var listOfClients = [];
  for (var clientId in clients_in_the_room ) {
    console.log('client: %s', clientId); //Seeing is believing 
    var client_socket = io.sockets.connected[clientId];//Do whatever you want with this
    listOfClients.push(client_socket.name);
  }
  return listOfClients;
}
