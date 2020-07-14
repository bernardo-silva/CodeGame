class Player{
    constructor(name, id, socket, isHost){
        this.name = name;
        this.id = id;
        this.socket = socket;
        this.isHost = isHost;
        this.pieces = [];
        this.revealedPieces = [];
    }
}

class GameStatus{
    constructor(){
        this.availableBPieces = ['b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11'];//,'b-'
        this.availableWPieces = ['w0','w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11'];//,'w-'

        this.numberPlayers = 0;
        this.gameStarted = false;
        this.players = {};
        this.playerNames = [];
        this.playerTurn = 0;
        this.playerID = [];
    }

    newPlayer(id, name, socket, isHost){
        if(this.playerNames.includes(name)){
            return {success: false, msg: "Name already in use"};
        }
        if(this.numberPlayers == 4){
            return {success: false, msg: "Game is full"};
        }
        console.log("New player " + name + " with id " + id + " and " + isHost);
        this.playerID.push(id);
        this.playerNames.push(name);
        this.players[id] = new Player(name, id, socket, isHost);
        console.log(this.playerNames);
        this.numberPlayers ++;
        return {success: true, msg: "Login successful"};
    }

    removePlayer(id){
        console.log(this.players[id].name + ' left');
        if (!this.gameStarted){
            this.playerNames = this.playerNames.filter(player => player != this.players[id].name);
            delete this.players[id];
            this.numberPlayers --;
            console.log(this.playerNames);
        }
    }

    checkPlayer(id){return Object.keys(this.players).includes(id);}

    getAdmin(){
        for(let i in this.players){
            if (this.players[i].isHost){
                return i;
            }
        }
    }

    dealPiece(id,color){
        if(color == 'b'){
            let i = Math.floor(Math.random()*this.availableBPieces.length);
            // players[id].pieces.push(this.availableBPieces[i]);
            this.insertPiece(id,this.availableBPieces[i]);
            this.availableBPieces = this.availableBPieces.filter(piece => piece != this.availableBPieces[i]);
        }
        if(color == 'w'){
            let i = Math.floor(Math.random()*this.availableWPieces.length);
            // this.players[id].pieces.push(this.availableWPieces[i]);
            this.insertPiece(id,this.availableWPieces[i]);
            this.availableWPieces = this.availableWPieces.filter(piece => piece != this.availableWPieces[i]);
        }
    }

    firstPlayer(){
        this.playerTurn = Math.floor(Math.random()*this.numberPlayers);
        console.log("First player is " + this.playerID[this.playerTurn]); 
        return this.playerID[this.playerTurn];
    }
    nextPlayer(){
        this.playerTurn = (this.playerTurn + 1)%this.numberPlayers;
        return this.playerID[this.playerTurn];
    }

    getAvailable(){
        return [this.availableBPieces.length, this.availableWPieces.length];
    }

    insertPiece(id,piece){
        var color = piece[0];
        var number = piece.substring(1);
        if(this.players[id].pieces.length == 0){
            this.players[id].pieces.push(piece);
            this.players[id].revealedPieces.push(false);
            return;
        }

        let index = 0;
        while(number >= parseInt(this.players[id].pieces[index].substring(1))){
            index++;
            if(this.players[id].pieces.length == index)
                break;
        }
        if(index == 0){
            this.players[id].pieces.unshift(piece);
            this.players[id].revealedPieces.unshift(false);
        }
        else{
            if(number === parseInt(this.players[id].pieces[index-1].substring(1)) && color === 'b')
                index--;

                this.players[id].pieces.splice(index,0,piece);
                this.players[id].revealedPieces.splice(index,0,false);
        }
    }
    getShownPieces(id){
        var pieces = [];
        for(let i=0; i<this.players[id].pieces.length; i++){
            if(this.players[id].pieces.length == this.players[id].revealedPieces.length){
                if(this.players[id].revealedPieces[i])
                    pieces.push(this.players[id].pieces[i]);

                else
                    pieces.push(this.players[id].pieces[i][0]);
            }
        }
        return pieces;
    }

    guess(player, target_player, target_position, piece_guess){
        if(this.players[target_player].pieces[target_position] == piece_guess){
            this.players[target_player].revealedPieces[target_position] = true;
        }
        else{
            
        }
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

module.exports = GameStatus