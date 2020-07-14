var loginDiv       = document.getElementById("loginDiv");
var loginDivForm   = document.getElementById("loginDivForm");
var loginDivInput  = document.getElementById("loginDiv-input");
var loginDivButton = document.getElementById("loginDiv-button");


var board = null;
//Login

loginDivButton.onclick = function() {
    if (loginDivInput.value.length < 1){
        alert("Name is too short");
        return;
    }
    socket.emit('login',{name:loginDivInput.value});
}

loginDivForm.onsubmit = function(e){
    e.preventDefault();
    if (loginDivInput.value.length < 1){
        alert("Name is too short");
        return;
    }
    socket.emit('login',{name:loginDivInput.value});
}

socket.on('loginResponse',function(data){
    if(data.success){
        board = new Board(data.self.name, data.self.id, data.self.isHost);
        board.currentPlayers(data.others.names, data.others.ids,data.others.host);
        loginDiv.style.display = 'none';
        lobbyDiv.style.display = 'inline-block';

        board.addPlayersToLobby(playerListDiv);

        if(data.self.isHost){
            lobbyDivButton.style.display = 'inline-block';
        }
        socket.emit('newPlayer');
    } 
    else{
        alert("Sign in unsuccessul. Reason: " + data.msg);
    }
});
