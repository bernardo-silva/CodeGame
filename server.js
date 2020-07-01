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
        console.log("check" + isAdmin);
        let status = GS.newPlayer(socket.id,data.name,socket, isAdmin); 
        if(status.success)
            socket.emit('loginResponse',{success: true, players:GS.playerNames, isAdmin: isAdmin});
        else
            socket.emit('loginResponse',{success: false, msg: status.msg})  
        // GS.printNames();
    })

    socket.on("disconnect", function(){
        console.log('Disconnected ' + socket.id);
        let name = GS.players[socket.id].name;
        delete socket_list[socket.id];
        if (GS.checkPlayer(socket.id)){
            if (GS.players[socket.id].isAdmin){
                socket_list[Object.keys(socket_list)[0]].emit("newAdmin");
                console.log('New admin ' + Object.keys(socket_list)[0]);
                GS.players[Object.keys(socket_list)[0]].isAdmin = true;
            }
            GS.removePlayer(socket.id)
            for(let i in socket_list){
                socket_list[i].emit('deletePlayer',{player: name});
            }
        }
    })

    socket.on('newPlayer', function(data){
        for(let i in socket_list){
            if( socket_list[i].id != data)
                socket_list[i].emit('newPlayer',{player: GS.players[data].name});
        }
    })



    socket.on('nameRegistered', function(data){
        console.log(data);

    })

})

