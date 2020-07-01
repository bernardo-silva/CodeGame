var express = require('express');
var app = express();
var server = require('http').Server(app);
var GameStatus = require('./gameStatus')



app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

server.listen(2000);
console.log('Server started.');

var socket_list = {};
// var player_list = {};
var GS = new GameStatus();

var io = require('socket.io')(server,{});
io.sockets.on('connection',function(socket){
    console.log('Connected ' + socket.id);

    socket_list[socket.id] = socket;

    socket.on('login',function(data){
        isAdmin = !GS.numberPlayers;
        
        let status = GS.newPlayer(socket.id,data.name, isAdmin); 
        if(status.success)
            socket.emit('loginResponse',{success: true});
        else
            socket.emit('loginResponse',{success: false, msg: status.msg})  
        // GS.printNames();
    })

    socket.on("disconnect", function(){
        console.log('Disconnected ' + socket.id);
        delete socket_list[socket.id];
        if (GS.checkPlayer(socket.id))
            GS.removePlayer(socket.id)
    })





    socket.on('nameRegistered', function(data){
        console.log(data);

    })

})

