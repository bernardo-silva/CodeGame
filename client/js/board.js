class Player {
    constructor(name, id, isHost) {
        this.name = name;
        this.id = id;
        this.isHost = isHost;
        this.pieces = [];
        this.revealedPieces = [];
        this.lastPiece = null;
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

        this.piecesPositions = [[], [], [], []];

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
        for (let i = 0; i < this.playerNames.length; i++) {
            nameDivs[positions2[i]].innerText = this.playerNames[i];
        }
    }

    dealPieces(id, pieces, revealed = null, pos = null) {
        this.players[id].pieces = pieces;
        if (revealed) {
            this.players[id].revealedPieces = revealed;
        }
        if (pos != null) {
            this.players[id].lastPiece = pos;
        }
        else
            this.players[id].lastPiece = null;


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

        availableB.innerText = this.availableBPieces + ' remaining';
        availableW.innerText = this.availableWPieces + ' remaining';
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

        var whosePieces = (id == this.selfId) ? 'ownPiece' : 'otherPlayerPiece';
        var currentPieces = document.getElementsByClassName(id);
        console.log(currentPieces)

        var pos = this.players[id].lastPiece;

        var initialPositions = [];

        var originPosition = [[width / 2., -gameDiv.offsetHeight / 2.],[gameDiv.offsetWidth / 2., height / 2.],
                              [width / 2., gameDiv.offsetHeight / 2.],[-gameDiv.offsetWidth / 2.+width, height / 2.]]

        // var color = (this.players[id].pieces[this.players[id].lastPiece][0] == 'b')? 'pickB' : 'pickW';
        // var originElement = document.getElementById(color);

        var finalPositions = this.calculateCoordinates(position, id, piecesDiv);
        console.log(finalPositions);

        for (let i = 0; i < this.players[id].pieces.length; i++) {
            console.log('New pos: ' + pos + ' i: ' + i);
            if (i < pos) {
                initialPositions[i] = [currentPieces[i].offsetLeft, currentPieces[i].offsetTop];
                let x = finalPositions[i][0] - initialPositions[i][0];
                let y = finalPositions[i][1] - initialPositions[i][1];
                console.log(initialPositions[i], x, y)
                currentPieces[i].style.transform = "translate(" + x + 'px, ' + y + "px)";
                // currentPieces[i].classList.remove(currentPieces[i].classList[5]);
                // currentPieces[i].classList.remove(currentPieces[i].classList[4]);
                // currentPieces[i].classList.add(i);
                // currentPieces[i].classList.add('transition');
            }
            else if (i == pos) { //New piece
                if (position % 2) {
                    image_width = .15 * height;
                    image_height = width;
                }
                else {
                    image_width = .15 * width;
                    image_height = height;
                }
                var image = document.createElement("img");
                image.className = classNames[position];


                image.src = '/client/assets/' + this.players[id].pieces[i] + '.png';
                image.classList.add(this.players[id].pieces[i], whosePieces, id, i);


                // image.style.display = 'none';
                image.style.width = image_width;
                image.style.height = image_height;
                image.style.position = 'absolute';
                image.style.border = 'solid 1px #000';

                initialPositions[i] = [originPosition[position][0], originPosition[position][1]];
                console.log('initialposition ' + initialPositions[i])
                image.style.left = initialPositions[i][0];
                image.style.top = initialPositions[i][1];

                let x = finalPositions[i][0] - initialPositions[i][0];
                let y = finalPositions[i][1] - initialPositions[i][1];
                console.log("translate(" + x + 'px, ' + y + "px)");

                image.addEventListener('transitionend', this.updateTransition, true);
                image.classList.add('transition');

                if (pos == 0 && currentPieces.length > 0) {
                    piecesDiv.insertBefore(image, currentPieces[0])
                }
                else if (pos < currentPieces.length && currentPieces.length > 0) {
                    currentPieces[i - 1].insertAdjacentElement('afterend', image);
                }
                else {
                    piecesDiv.appendChild(image);
                }
                image.offsetWidth;
                image.style.transform = "translate(" + x + 'px, ' + y + "px)";

            }
            else {
                console.log(finalPositions[i], currentPieces[i - 1], [currentPieces[i - 1].offsetLeft, currentPieces[i - 1].offsetTop])
                initialPositions[i] = [currentPieces[i].offsetLeft, currentPieces[i].offsetTop];
                let x = finalPositions[i][0] - initialPositions[i][0];
                let y = finalPositions[i][1] - initialPositions[i][1];
                console.log('else', initialPositions, x, y)
                currentPieces[i].style.transform = "translate(" + x + 'px, ' + y + "px)";
                currentPieces[i].classList.toggle((i-1).toString());
                // currentPieces[i].classList.remove(currentPieces[i].classList[4]);
                currentPieces[i].classList.toggle(i.toString());
                // currentPieces[i].classList.add('transition');
            }
        }
    }

    calculateCoordinates(position, id, parent) {
        var coordinates = [];
        var width = parseInt(parent.offsetWidth);
        var height = parseInt(parent.offsetHeight);
        var n = this.players[id].pieces.length;

        switch (position) {
            case 0:
                for (let i = 0; i < n; i++) {
                    let left = width / 2. - .15 * width * (n / 2. - i);
                    let newArr = [left, 0];
                    coordinates[coordinates.length] = newArr;
                }
                break;
            case 1:
                for (let i = 0; i < n; i++) {
                    let top = height / 2. + .15 * height * (i - n / 2.);
                    coordinates = coordinates.concat([[0, top]]);
                }
                break;
            case 2:
                for (let i = 0; i < n; i++) {
                    let j = n - i - 1;
                    let left = width / 2. - .15 * width * (n / 2. - j);
                    coordinates = coordinates.concat([[left, 0]]);
                }
                break;
            case 3:
                for (let i = 0; i < n; i++) {
                    let top = height / 2. + .15 * height * (n / 2. - i - 1);
                    coordinates = coordinates.concat([[width, top]]);
                }
                break;
        }
        console.log('Pieces coordinates: ', coordinates)
        return coordinates;
    }

    updateTransition() {
        var left = this.offsetLeft;
        var top = this.offsetTop;

        this.classList.remove('transition');
        // this.style.transition = '';
        console.log(window.getComputedStyle(this).getPropertyValue("transform"));
        var transform = window.getComputedStyle(this).getPropertyValue("transform").match(/(-?[0-9\.]+)/g);
        this.style.transform = '';


        left += parseFloat(transform[4]);
        top  += parseFloat(transform[5]);
        console.log(transform, left, top)
        console.log('new coordinates: ', left, top);


        this.style.left = left;
        this.style.top = top;
        this.offsetHeight;
        this.classList.add('transition');

    }

    setClickable() {
        var pieces = document.getElementsByClassName('otherPlayerPiece');
        for (let i = 0; i < pieces.length; i++) {
            var classes = pieces[i].classList;
            for(let j=0;j<classes.length; j++){
                if(classes[j].length <= 3 && (classes[j][0] == 'b' || classes[j][0] == 'w')){
                    var piece = classes[j];
                    break;
                }
            }
            if (piece.length != 1) {
                continue;
            }
            pieces[i].onmouseover = this.highlight;
            pieces[i].onmouseout  = this.unHighlight;
            pieces[i].onclick     = this.makeGuess;
        }
    }

    setUnclickable() {
        var pieces = document.getElementsByClassName('otherPlayerPiece');
        var ownpieces = document.getElementsByClassName('ownPiece');
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].onmouseover = this.unHighlight;
            pieces[i].onmouseout  = this.unHighlight;
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
        this.onmousever = function () { };

        var classes = this.classList
        
        var guess = '';
        var target   = '';
        var position = 0;

        for(let i=0; i<classes.length; i++){
            if(classes[i] in board.players){
                target = classes[i];
                continue;
            }
            if(classes[i].length == 1 && !isNaN(parseInt(classes[i]))){
                position = parseInt(classes[i]);
                continue;
            }
            if(classes[i].length <= 3 && (classes[i][0] == 'b' || classes[i][0] == 'w')){
                guess = classes[i];
            }
        }
        console.log('Target ' + target + ' position ' + position + 'guess ' + guess);
        var textTip  = document.getElementById('textTip');
        var guessDiv = document.getElementById('guessDiv');
        
        var guessNumberSelect = document.getElementById('guessNumberSelect');
        var guessSubmitButton = document.getElementById('guessSubmitButton');
        

        guessSubmitButton.onclick = function () {
            guess += guessNumberSelect.value;
            guessDiv.style.display = 'none';
            board.socket.emit('played', { guess: guess, target: target, position: position });
            board.setUnclickable;
            return guess;
        };

        textTip.style.display = 'none';
        guessDiv.style.display = 'inline-block';

    }

    revealPiece(id, revealed, playerPieces = null) {
        this.players[id].revealedPieces = revealed;
        var pieces = document.getElementsByClassName(id);
        if (id == this.selfId) {
            for (let i = 0; i < pieces.length; i++) {
                if (this.players[id].revealedPieces[i])
                    pieces[i].style.border = 'solid 2px #f00';
            }
            if (this.revealed) {
                this.revealed = false;
                this.socket.emit('playEnded', { revealed: this.players[this.selfId].revealedPieces })
            }
        }
        else {
            console.log(pieces);
            this.players[id].pieces = playerPieces;
            for (let i = 0; i < pieces.length; i++) {
                pieces[i].src = '/client/assets/' + this.players[id].pieces[i] + '.png';
                pieces[i].classList.toggle(this.players[id].pieces[i][0],false);
                pieces[i].classList.toggle(this.players[id].pieces[i],true);
            }
        }
    }

    highlight() {
        this.style.border = "2px #00ff00 solid";
    }
    unHighlight() {
        this.style.border = "1px #000 solid";
    }
}
