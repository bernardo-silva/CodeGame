
var lobbyDiv = document.getElementById("lobbyDiv");
var playerListDiv = document.getElementById("playerListDiv");
var lobbyDivButton = document.getElementById("lobbyDivButton");
var playerPositions = {};

socket.on('newPlayer', function(data){
    board.newPlayer(data.name, data.id, data.isHost);
    board.addPlayersToLobby(playerListDiv);
});

socket.on('deletePlayer', function(data){
    board.removePlayer(data.id);
    board.addPlayersToLobby(playerListDiv);
});


lobbyDivButton.onclick = function(){
    console.log('Clicked');
    socket.emit('start-game');
};

socket.on('start-game', function(){
    lobbyDiv.style.display = 'none';
    gameDiv.style.display = 'inline-block';
    chatDiv.style.display = 'inline-block';
    board.startGame();
});

