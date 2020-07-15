class Player{
    constructor(name, id, isHost){
        this.name = name;
        this.id = id;
        this.isHost = isHost;
        this.pieces = [];
    }
}

class Board{
    constructor(socket, name, id, isHost){
        this.socket = socket;
        this.selfName = name;
        this.selfId = id;
        this.selfIsHost = isHost;

        this.numberPlayers = 0;
        this.players = {};
        this.playerNames = [];
        this.playerTurn = 0;
        // this.currentPlayers = [];

        this.availableBPieces = 12;//,'b-'
        this.availableWPieces = 12;//,'w-'
    }

    currentPlayers(names, ids, host){
        if(names.length === ids.length){
            for(let i=0; i<names.length; i++){
                this.players[ids[i]] = new Player(names[i], ids[i],ids[i]==host);
            }
            this.playerNames = names;
        }
        this.numberPlayers = names.length;
    }

    newPlayer(name, id, isHost){
        this.players[id] = new Player(name, id, isHost);
        this.playerNames.push(name);
        this.numberPlayers ++;
    }

    removePlayer(id){
        this.playerNames = this.playerNames.filter(player => player != this.players [id].name);
        delete this.players [id];
        this.numberPlayers --;
    }

    addPlayersToLobby(div){
        div.innerHTML = '';
        for(let i in this.players){
            name = this.players[i].name;
            if(this.players[i].isHost)
                name += ' (Host)';
                
            div.innerHTML += '<div>' + name + '</div>';
        }
    }

    startGame(){
        //Ordering players
        while(this.playerNames[0] != this.selfName){
            this.playerNames.unshift(this.playerNames.pop());
        } 

    }

    // checkPlayer(id){return Object.keys(this.players).includes(id);}

    dealPieces(id,pieces){
        this.players[id].pieces = pieces;
        let b = 0;
        let w = 0;
        for(let i in this.players){
            for(let j = 0; j < this.players[i].pieces.length; j++){
                if(this.players[i].pieces[j][0] == 'b')
                    b++;
                else
                    w++;
            }
        }
        this.availableBPieces = 12 - b;
        this.availableWPieces = 12 -w;
    }

    drawPieces(id){
        var player = this.playerNames.indexOf(this.players[id].name);
        var positions = [[0,2],[0,1,2],[0,1,2,3]];
        var positions2 = positions[this.numberPlayers-2];
        var position = positions2[player];

        var classNames = ['upright','rotatedRight','downwards','rotatedLeft'];

        var piecesDiv = document.getElementById("player" + position + "PiecesDiv");;
        var width  = parseInt(piecesDiv.offsetWidth);
        var height = parseInt(piecesDiv.offsetHeight);

        var image_width = 0;
        var image_height = 0;
        console.log('w: ' + width + " h: " + height);

        if (position%2){
            image_width = .15*height +"px";
            image_height = width +"px"; 
        }
        else{
            image_width = "15%";
            image_height = "100%";
        }
        piecesDiv.innerHTML = '';

        for(let i=0; i<this.players[id].pieces.length; i++){
            var image = document.createElement("img");
            image.src = '/client/assets/' + this.players[id].pieces[i] + '.png';

            image.className = classNames[position];
            image.className += ' ' + this.players[id].pieces[i];
            image.style.width = image_width;
            image.style.height = image_height;
            image.style.border = 'solid 1px #000'

            if(position==1){
                var topPos = height/2 + .15*height*(i-this.players[id].pieces.length/2);
                image.style.top = topPos + 'px';
            }
            if(position == 3){
                var topPos = height/2 + .15*height*(-i+this.players[id].pieces.length/2-1);
                image.style.top = topPos + 'px';
            }
            
            if(id != this.selfId){
                image.className += ' otherPlayerPiece';
            }
            piecesDiv.appendChild(image);
        }
    }
    
    
    setClickable(){
        var pieces = document.getElementsByClassName('otherPlayerPiece');
        console.log(pieces);
        for(let i=0; i<pieces.length; i++){
            var splited = pieces[i].className.split(" ");
            if(splited[1].length != 1){ //////VERIFICAR AQUI A COR
                continue;
            }
            pieces[i].onmouseover = this.highlight;
            pieces[i].onmouseout = this.unHighlight;
            pieces[i].onclick = this.makeGuess;
        }
    }
    
    setUnclickable(){
        var pieces = document.getElementsByClassName('otherPlayerPiece');
        for(let i=0; i<pieces.length; i++){
            pieces[i].onmouseover = this.unHighlight;
            pieces[i].onmouseout  = this.unHighlight;
        }
    }

    makeGuess(){
        board.setUnclickable();

        console.log("Clicked");
        var guess = '';

        var guessTip       = document.getElementById('guessTip');
        var guessDiv       = document.getElementById('guessDiv');
        var guessColorDiv  = document.getElementById('guessColorDiv');
        var guessNumberDiv = document.getElementById('guessNumberDiv');

        var guessB = document.getElementById('guessB');
        var guessW = document.getElementById('guessW');

        var guessNumberSelect = document.getElementById('guessNumberSelect');
        var guessSubmitButton = document.getElementById('guessSubmitButton');

        guessB.onmouseover = board.highlight;
        guessB.onmouseout  = board.unHighlight;
        guessW.onmouseover = board.highlight;
        guessW.onmouseout  = board.unHighlight;

        guessB.onclick = function(){
            guess += 'b';
            guessColorDiv.style.display = 'none';
            guessNumberDiv.style.display = 'inline-block';
        };
        guessW.onclick = function(){
            guess += 'w';
            guessColorDiv.style.display = 'none';
            guessNumberDiv.style.display = 'inline-block';
        }

        guessSubmitButton.onclick = function(){
            guess += guessNumberSelect.value;
            guessDiv.style.display = 'none';
            board.socket.emit('played',{guess:guess});
            return guess;
        };

        guessTip.style.display = 'none';
        guessDiv.style.display = 'inline-block';
        guessColorDiv.style.display = 'inline-block';

    }


    highlight(){
        this.style.border = "2px #00ff00 solid";
    }
    unHighlight(){
        this.style.border = "1px #000 solid";
    }

    firstPlayer(){
        this.playerTurn = Math.floor(Math.random()*this.numberPlayers);
        console.log("First player is " + this.currentPlayers[this.playerTurn]); 
        return this.currentPlayers[this.playerTurn];
    }
    nextPlayer(){
        this.playerTurn = (this.playerTurn + 1)%this.numberPlayers;
        return this.currentPlayers[this.playerTurn];
    }

    getAvailable(){
        return [this.availableBPieces.length, this.availableWPieces.length];
    }

    insertPiece(id,piece){
        // var pieces =  this.players[id].pieces;
        var color = piece[0];
        var number = piece.substring(1);
        // console.log(number)
        // console.log("Inserting " + id + ": " + piece + " in " + this.players[id].pieces);
        if(this.players[id].pieces.length == 0){
            this.players[id].pieces.push(piece);
            return;
        }

        let index = 0;
        while(number >= parseInt(this.players[id].pieces[index].substring(1))){
            // console.log('Coiso' + this.players[id].pieces[index].substring(1));
            index++;
            if(this.players[id].pieces.length == index)
                break;
        }
        if(index == 0){
            this.players[id].pieces.unshift(piece);
        }
        else{
            if(number === parseInt(this.players[id].pieces[index-1].substring(1)) && color === 'b')
                index--;

                this.players[id].pieces.splice(index,0,piece);
        }
        // this.players[id].pieces = pieces;
        // console.log("Insert:",pieces, this.players[id].pieces);
    }
    printNames(){
        Object.values(this.players).forEach((value) => {
            console.log(value.name);
        })
    }
    printPlayerPieces(){
        for(let i in this.players){
            console.log(this.players[i].name,this.players[i].pieces);
        }
    }
}
