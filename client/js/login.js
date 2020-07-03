var loginDiv       = document.getElementById("loginDiv");
var loginDivForm   = document.getElementById("loginDivForm");
var loginDivInput  = document.getElementById("loginDiv-input");
var loginDivButton = document.getElementById("loginDiv-button");
var myName = '';

//Login

loginDivButton.onclick = function() {
    if (loginDivInput.value.length < 1){
        alert("Name is too short");
        return;
    }
    myName = loginDivInput.value;   
    socket.emit('login',{name:loginDivInput.value});
}

loginDivForm.onsubmit = function(e){
    e.preventDefault();
    if (loginDivInput.value.length < 1){
        alert("Name is too short");
        return;
    }
    myName = loginDivInput.value;   
    socket.emit('login',{name:loginDivInput.value});
}

var currentPlayers = [];

socket.on('loginResponse',function(data){
    if(data.success){
        loginDiv.style.display = 'none';
        lobbyDiv.style.display = 'inline-block';
        // gameDiv.style.display = 'inline-block';
        // chatDiv.style.display = 'inline-block';
        currentPlayers = data.players;
        // console.log(currentPlayers);
        for(let i in currentPlayers){
            addPlayerToLobby(currentPlayers[i]);
        }
        if(data.isAdmin){
            lobbyDivButton.style.display = 'inline-block';
        }
        socket.emit('newPlayer',socket.id);
    } 
    else{
        alert("Sign in unsuccessul. Reason: " + data.msg);
    }
});

function addPlayerToLobby(name){
    playerListDiv.innerHTML += '<div>' + name + '</div>';
}
