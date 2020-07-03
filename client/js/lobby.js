
var lobbyDiv = document.getElementById("lobbyDiv");
var playerListDiv = document.getElementById("playerListDiv");
var lobbyDivButton = document.getElementById("lobbyDivButton");

socket.on('newPlayer', function(data){
    currentPlayers.push(data.player);
    addPlayerToLobby(data.player);
});

socket.on('deletePlayer', function(data){
    currentPlayers = currentPlayers.filter(player => player != data.player);
    playerListDiv.innerHTML = '';
    for(let i in currentPlayers){
        addPlayerToLobby(currentPlayers[i]);
    }
});

socket.on('newAdmin', function(){
    console.log('Im new admin');
    lobbyDivButton.style.display = 'inline-block';
});

lobbyDivButton.onclick = function(){
    socket.emit('start-game');
};
socket.on('start-game', function(){
    console.log("Current players: " + currentPlayers);
    // lobbyDiv.parentNode.removeChild(lobbyDiv);
    lobbyDiv.style.display = 'none';
    gameDiv.style.display = 'inline-block';
    chatDiv.style.display = 'inline-block';
    orderPlayers();
    // for(let i = 1; i<=currentPlayers.length; i++){
    //     gameDiv.innerHTML += "<div id=\"player" + i +"\">" + currentPlayers[i-1] + "</div>";
    // }
});

function orderPlayers(){
    console.log("Ordering players");
    while(currentPlayers[0] != myName){
        currentPlayers.unshift(currentPlayers.pop());
    } 
    console.log("Players ordered!" + currentPlayers);
}