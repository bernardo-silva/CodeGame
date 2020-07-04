var express = require('express');
var app = express();
var server = require('http').Server(app);
var GameStatus = require('./gameStatus')



app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));


let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}

server.listen(port);
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
        console.log("Is admin? " + isAdmin);
        let status = GS.newPlayer(socket.id,data.name,socket, isAdmin); 
        if(status.success){
            socket.emit('loginResponse',{success: true, players:GS.playerNames, isAdmin: isAdmin});
            if(isAdmin)
                socket.emit('newAdmin',{})
        }
        else
            socket.emit('loginResponse',{success: false, msg: status.msg})  
        // GS.printNames();
    })

    socket.on("disconnect", function(){
        console.log('Disconnected ' + socket.id);
        delete socket_list[socket.id];
        if (GS.checkPlayer(socket.id)){
            let name = GS.players[socket.id].name;
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
    });

    socket.on('start-game', function(){
        console.log('Game Started!')
        if(GS.players[socket.id].isAdmin){
            for(let i in socket_list){
                socket_list[i].emit('start-game',{});
            }
                // initialDraw();
            socket_list[GS.firstPlayer()].emit('initialDraw',{available: GS.getAvailable()});
        }
    });
    
    var drawCount = 0;
    socket.on('initialDrawOver', function(data){
        drawCount ++;
        console.log(drawCount, GS.numberPlayers, GS.availableBPieces, GS.availableWPieces);
        GS.printPlayerPieces();
        if(drawCount == GS.numberPlayers){
            console.log('First player turn');
            socket_list[GS.nextPlayer()].emit("yourTurn",{available: GS.getAvailable()});
            return;
        }
        socket_list[GS.nextPlayer()].emit('initialDraw',{available: GS.getAvailable()});
    });
    


    socket.on('piecePicked', function(data){
        GS.dealPiece(socket.id,data.color);
        socket.emit()
    });
    socket.on('played', function(data){
        // VERIFICAR O QUE FOI A JOGADA
        socket_list[GS.nextPlayer()].emit("yourTurn",{available: GS.getAvailable()});
    });

    socket.on('addToChat',function(data){
        let name = GS.players[socket.id].name;
        console.log("(" + name + "): " + data.msg);
        for(let i in socket_list){
            socket_list[i].emit('addToChat',{msg:"(" + name + "): " + data.msg});
        }
    })

})

