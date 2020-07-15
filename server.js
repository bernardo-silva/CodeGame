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

var drawCount = 0;
io.sockets.on('connection',function(socket){
    console.log('Connected ' + socket.id);

    socket_list[socket.id] = socket;

    socket.on('login',function(data){
        isHost = !GS.numberPlayers;
        let status = GS.newPlayer(socket.id,data.name,socket, isHost); 
        if(status.success){
            socket.emit('loginResponse',
            {success: true, self: {name:data.name, id:socket.id, isHost: isHost}, others: {names:GS.playerNames,ids:GS.playerID, host:GS.getAdmin()}});
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
            if (GS.players[socket.id].isHost){
                socket_list[Object.keys(socket_list)[0]].emit("newAdmin");
                console.log('New host ' + Object.keys(socket_list)[0]);
                GS.players[Object.keys(socket_list)[0]].isHost = true;
            }
            GS.removePlayer(socket.id)
            for(let i in socket_list){
                socket_list[i].emit('deletePlayer',{id: socket.id});
            }
        }
    })

    socket.on('newPlayer', function(){
        let id = socket.id;
        for(let i in socket_list){
            if(socket_list[i].id != id && GS.checkPlayer(i))
                socket_list[i].emit('newPlayer',{name:GS.players[id].name, id:id, isHost: GS.players[id].isHost});
        }
    });

    socket.on('start-game', function(){
        if(GS.players[socket.id].isHost && GS.numberPlayers > 1){
            for(let i in socket_list){
                socket_list[i].emit('start-game',{});
            }
            socket_list[GS.firstPlayer()].emit('initialDraw',{available: GS.getAvailable()});
            console.log('Game Started!');
        }
    });
    
    socket.on('initialDrawOver', function(data){
        drawCount ++;
        if(drawCount == GS.numberPlayers){
            console.log('First player turn');
            let nextPlayer = GS.nextPlayer();
            socket_list[nextPlayer].emit("yourTurn",{});
            for(let i in socket_list){
                if(socket_list[i].id != nextPlayer)
                    socket_list[i].emit('currentPlayerTurn',{id:socket.id});
            }
            return;
        }
        socket_list[GS.nextPlayer()].emit('initialDraw',{available: GS.getAvailable()});
    });
    


    socket.on('piecePicked', function(data){
        GS.dealPiece(socket.id,data.color);
        socket.emit('addSelfPiece',{pieces:GS.players[socket.id].pieces, id: socket.id});
        for(let i in socket_list){
            if( socket_list[i].id != socket.id)
                socket_list[i].emit('addPlayerPiece',{pieces:GS.getShownPieces(socket.id),id:socket.id});
        }
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

