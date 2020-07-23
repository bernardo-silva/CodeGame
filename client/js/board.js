class Player {
    constructor(name, id, isHost) {
        this.name = name;
        this.id = id;
        this.isHost = isHost;
        this.pieces = [];
        this.revealedPieces = [];
        this.lastRevealed = null;
    }
}

class Board {
    constructor(socket, name, id, isHost) {
        this.socket = socket;
        this.selfName = name;
        this.selfId = id;
        this.selfIsHost = isHost;

        this.numberPlayers = 0;
        this.players = {};
        this.playerNames = [];
        this.playerTurn = 0;
        this.revealed = false;
        // this.currentPlayers = [];

        this.availableBPieces = 12;//,'b-'
        this.availableWPieces = 12;//,'w-'
    }

    currentPlayers(names, ids, host) {
        if (names.length === ids.length) {
            for (let i = 0; i < names.length; i++) {
                this.players[ids[i]] = new Player(names[i], ids[i], ids[i] == host);
            }
            this.playerNames = names;
        }
        this.numberPlayers = names.length;
    }

    newPlayer(name, id, isHost) {
        this.players[id] = new Player(name, id, isHost);
        this.playerNames.push(name);
        this.numberPlayers++;
    }

    removePlayer(id) {
        this.playerNames = this.playerNames.filter(player => player != this.players[id].name);
        delete this.players[id];
        this.numberPlayers--;
    }

    addPlayersToLobby(div) {
        div.innerHTML = '';
        for (let i in this.players) {
            name = this.players[i].name;
            if (this.players[i].isHost)
                name += ' (Host)';

            div.innerHTML += '<div>' + name + '</div>';
        }
    }

    startGame() {
        //Ordering players
        var nameDivs = document.getElementsByClassName('name');
        var positions = [[0, 2], [0, 1, 2], [0, 1, 2, 3]];
        var positions2 = positions[this.numberPlayers - 2];

        while (this.playerNames[0] != this.selfName) {
            this.playerNames.unshift(this.playerNames.pop());
        }
        for(let i = 0; i<this.playerNames.length; i++){
            nameDivs[positions2[i]].innerText = this.playerNames[i];
        }
    }

    // checkPlayer(id){return Object.keys(this.players).includes(id);}

    dealPieces(id, pieces, revealed = null, pos = null) {
        this.players[id].pieces = pieces;
        if (revealed) {
            this.players[id].revealedPieces = revealed;
        }
        if(pos){
            this.players[id].lastRevealed = pos;
        }
        let b = 0;
        let w = 0;
        for (let i in this.players) {
            for (let j = 0; j < this.players[i].pieces.length; j++) {
                if (this.players[i].pieces[j][0] == 'b')
                    b++;
                else
                    w++;
            }
        }
        this.availableBPieces = 12 - b;
        this.availableWPieces = 12 - w;
    }

    drawPieces(id) {
        var player = this.playerNames.indexOf(this.players[id].name);
        var positions = [[0, 2], [0, 1, 2], [0, 1, 2, 3]];
        var positions2 = positions[this.numberPlayers - 2];
        var position = positions2[player];

        var classNames = ['upright', 'rotatedRight', 'downwards', 'rotatedLeft'];

        var piecesDiv = document.getElementById("player" + position + "PiecesDiv");;
        var width = parseInt(piecesDiv.offsetWidth);
        var height = parseInt(piecesDiv.offsetHeight);

        var image_width = 0;
        var image_height = 0;
        // console.log('w: ' + width + " h: " + height);

        if (position % 2) {
            image_width = .15 * height + "px";
            image_height = width + "px";
        }
        else {
            image_width = "15%";
            image_height = "100%";
        }
        piecesDiv.innerHTML = '';

        for (let i = 0; i < this.players[id].pieces.length; i++) {
            var image = document.createElement("img");

            image.className = classNames[position];
            if (position == 2) {
                let j = this.players[id].pieces.length - i - 1;
                image.src = '/client/assets/' + this.players[id].pieces[j] + '.png';
                image.className += ' ' + this.players[id].pieces[j];
                image.className += ' ' + j + ' ' + id;
            }
            else {
                image.className += ' ' + this.players[id].pieces[i];
                image.src = '/client/assets/' + this.players[id].pieces[i] + '.png';
                image.className += ' ' + i + ' ' + id;
            }

            image.style.width = image_width;
            image.style.height = image_height;
            image.style.border = 'solid 1px #000'

            if (position == 1) {
                var topPos = height / 2 + .15 * height * (i - this.players[id].pieces.length / 2);
                image.style.top = topPos + 'px';
            }
            if (position == 3) {
                var topPos = height / 2 + .15 * height * (-i + this.players[id].pieces.length / 2 - 1);
                image.style.top = topPos + 'px';
            }

            if (id != this.selfId) {
                image.className += ' otherPlayerPiece';
            }
            else {
                image.className += ' ownPiece';
            }
            
            piecesDiv.appendChild(image);
        }
    }


    setClickable() {
        var pieces = document.getElementsByClassName('otherPlayerPiece');
        for (let i = 0; i < pieces.length; i++) {
            var splited = pieces[i].className.split(" ");
            if (splited[1].length != 1) { //////VERIFICAR AQUI A COR
                continue;
            }
            pieces[i].onmouseover = this.highlight;
            pieces[i].onmouseout = this.unHighlight;
            pieces[i].onclick = this.makeGuess;
        }
    }

    setUnclickable() {
        var pieces = document.getElementsByClassName('otherPlayerPiece');
        var ownpieces = document.getElementsByClassName('ownPiece');
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].onmouseover = this.unHighlight;
            pieces[i].onmouseout = this.unHighlight;
            pieces[i].onclick = function () { };
        }
        for (let i = 0; i < ownpieces.length; i++) {
            ownpieces[i].onmouseover = null;
            ownpieces[i].onmouseout = null;
            ownpieces[i].onclick = function () { };
        }
    }

    makeGuess() {
        board.setUnclickable();
        this.style.border = '2px #0f0 solid';
        this.onmouseout = function () { };

        console.log("Clicked");

        var guess = '';
        var classes = this.className.split(" ")
        guess += classes[1];

        var textTip = document.getElementById('textTip');
        var guessDiv = document.getElementById('guessDiv');

        var guessNumberSelect = document.getElementById('guessNumberSelect');
        var guessSubmitButton = document.getElementById('guessSubmitButton');


        guessSubmitButton.onclick = function () {
            guess += guessNumberSelect.value;
            guessDiv.style.display = 'none';
            board.socket.emit('played', { guess: guess, target: classes[3], position: classes[2] });
            return guess;
        };

        textTip.style.display = 'none';
        guessDiv.style.display = 'inline-block';

    }

    revealPiece(revealed) {
        this.players[this.selfId].revealedPieces = revealed;
        var pieces = document.getElementsByClassName('ownPiece');
        for (let i = 0; i < pieces.length; i++) {
            if (this.players[this.selfId].revealedPieces[i])
                pieces[i].style.border = 'solid 2px #f00';
        }
        if (this.revealed) {
            this.revealed = false;
            this.socket.emit('playEnded', { revealed: this.players[this.selfId].revealedPieces })
        }
    }


    highlight() {
        this.style.border = "2px #00ff00 solid";
    }
    unHighlight() {
        this.style.border = "1px #000 solid";
    }

    firstPlayer() {
        this.playerTurn = Math.floor(Math.random() * this.numberPlayers);
        console.log("First player is " + this.currentPlayers[this.playerTurn]);
        return this.currentPlayers[this.playerTurn];
    }
    nextPlayer() {
        this.playerTurn = (this.playerTurn + 1) % this.numberPlayers;
        return this.currentPlayers[this.playerTurn];
    }

    getAvailable() {
        return [this.availableBPieces.length, this.availableWPieces.length];
    }

    insertPiece(id, piece) {
        // var pieces =  this.players[id].pieces;
        var color = piece[0];
        var number = piece.substring(1);
        // console.log(number)
        // console.log("Inserting " + id + ": " + piece + " in " + this.players[id].pieces);
        if (this.players[id].pieces.length == 0) {
            this.players[id].pieces.push(piece);
            return;
        }

        let index = 0;
        while (number >= parseInt(this.players[id].pieces[index].substring(1))) {
            // console.log('Coiso' + this.players[id].pieces[index].substring(1));
            index++;
            if (this.players[id].pieces.length == index)
                break;
        }
        if (index == 0) {
            this.players[id].pieces.unshift(piece);
        }
        else {
            if (number === parseInt(this.players[id].pieces[index - 1].substring(1)) && color === 'b')
                index--;

            this.players[id].pieces.splice(index, 0, piece);
        }

    }
    printNames() {
        Object.values(this.players).forEach((value) => {
            console.log(value.name);
        })
    }
    printPlayerPieces() {
        for (let i in this.players) {
            console.log(this.players[i].name, this.players[i].pieces);
        }
    }
}
