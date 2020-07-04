// import Player from './player'

class Player{
    constructor(name, id, socket, isAdmin){
        this.name = name;
        this.id = id;
        this.socket = socket;
        this.isAdmin = isAdmin;
        this.pieces = [];
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
        this.currentPlayers = [];
    }

    newPlayer(id, name, socket, isAdmin){
        if(this.playerNames.includes(name)){
            return {success: false, msg: "Name already in use"};
        }
        if(this.numberPlayers == 4){
            return {success: false, msg: "Game is full"};
        }
        console.log("New player " + name + " with id " + id + " and " + isAdmin);
        this.currentPlayers.push(id);
        this.players[id] = new Player(name, id, socket, isAdmin);
        this.playerNames.push(name);
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

    checkPlayer(id){
        // console.log(Object.keys(this.players));
        // console.log(id);
        // console.log(Object.keys(this.players).includes(id));
        console.log(Object.keys(this.players));
        return Object.keys(this.players).includes(id);
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
        // console.log(this.players)
        console.log("Inserting " + id + ": " + piece + " in " + this.players[id].pieces);
        if(this.players[id].pieces.length == 0){
            this.players[id].pieces.push(piece);
            return;
        }

        let index = 0;
        console.log('Coiso' + this.players[id].pieces[index]);
        while(number >= this.players[id].pieces[index].substring(1)){
            index++;
        }
        if(index == 0){
            this.players[id].pieces.unshift(piece);
        }
        else{
            if(number === this.players[id].pieces[index-1].substring(1) && color === 'b')
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

module.exports = GameStatus