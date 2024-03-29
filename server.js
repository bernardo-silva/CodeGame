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
var io = require('socket.io')(server,{});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var socket_list = {};
var GS = new GameStatus();
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
            if (GS.players[socket.id].isHost && GS.players.length > 0){
                socket_list[Object.keys(socket_list)[0]].emit("newAdmin");
                console.log('New host ' + Object.keys(socket_list)[0]);
                GS.players[Object.keys(socket_list)[0]].isHost = true;
            }
            GS.removePlayer(socket.id)
            emitAll('deletePlayer',{id: socket.id});
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
            GS.gameStarted = true;
            emitAll('start-game',{});
            socket_list[GS.firstPlayer()].emit('initialDraw',{available: GS.getAvailable()});
            console.log('Game Started!');
        }
    });
    
    socket.on('initialDrawOver', function(data){
        drawCount ++;
        var nextPlayer = GS.nextPlayer();
        if(drawCount == GS.numberPlayers){
    
            console.log('First player turn');
            socket_list[nextPlayer].emit("yourTurn",{});
            emitAll('currentPlayerTurn',{id:nextPlayer}, nextPlayer);

            return;
        }
        socket_list[nextPlayer].emit('initialDraw',{available: GS.getAvailable()});
    });
    


    socket.on('piecePicked', function(data){
        GS.dealPiece(socket.id,data.color);
        let pos = GS.players[socket.id].lastPicked;
        socket.emit('addSelfPiece',{pieces:GS.players[socket.id].pieces, id: socket.id, revealed:GS.players[socket.id].revealedPieces, pos: pos});
        
        emitAll('addPlayerPiece',{pieces:GS.getShownPieces(socket.id),id:socket.id,revealed:GS.players[socket.id].revealedPieces, pos: pos},socket.id);
    });


    socket.on('played', async function(data){
        console.log('Player ' + socket.id + ' guessed ' + data.guess +' with target ' + data.target +' at position ' + data.position);
        var success = GS.checkGuess(data.target, data.position, data.guess);
        if(success){
            console.log('Guess was right!');
            // socket_list[data.target].emit('pieceRevealed',{revealed: GS.players[data.target].revealedPieces});
            
            socket.emit('ownGuess',{success:success});
            emitAll('guessResult',{player: socket.id, target:data.target, piece: data.guess,success:success, position:data.position}, socket.id); 
            emitAll('pieceRevealed',{pieces:GS.getShownPieces(data.target),id:data.target, revealed: GS.players[data.target].revealedPieces});
            
            await sleep(5000);

            socket.emit('guessAgain',{available: GS.getAvailable()})
            if(GS.checkWin()){
                emitAll('gameOver',{});
                GS.endGame();
                drawCount = 0;
            }
        }
        else{
            GS.players[socket.id].revealedPieces[GS.players[socket.id].lastPicked] = true;
            // socket_list[socket.id].emit('pieceRevealed',{id: socket.id, revealed: GS.players[socket.id].revealedPieces});
            
            emitAll('pieceRevealed',{pieces:GS.getShownPieces(socket.id),id:socket.id, revealed: GS.players[socket.id].revealedPieces});
            
            socket.emit('ownGuess',{success:success});
            emitAll('guessResult',{player: socket.id, target:data.target, piece: data.guess,success:success, position:data.position}, socket.id);
            
            await sleep(3000);

            let nextPlayer = GS.nextPlayer();
            emitAll('currentPlayerTurn',{id:nextPlayer}, nextPlayer);
            socket_list[nextPlayer].emit("yourTurn",{available: GS.getAvailable()});
        }
    });

    socket.on('endTurn',function(){
        let nextPlayer = GS.nextPlayer();
        emitAll('currentPlayerTurn',{id:nextPlayer}, nextPlayer);
        socket_list[nextPlayer].emit("yourTurn",{available: GS.getAvailable()});
    });

    socket.on('addToChat',function(data){
        let name = GS.players[socket.id].name;
        console.log("(" + name + "): " + data.msg);

        emitAll('addToChat',{msg:"(" + name + "): " + data.msg});
    });

});

function emitAll(msg,data,skip = null){
    for(let i in socket_list){
        if(i != skip){
            socket_list[i].emit(msg,data);
        }
    }
}