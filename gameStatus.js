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
        this.availableBPieces = ['b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b-'];
        this.availableWPieces = ['w0','w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w-'];

        this.numberPlayers = 0;
        this.gameStarted = false;
        this.players = {};
        this.playerNames = [];
    }

    newPlayer(id, name, socket, isAdmin){
        if(this.playerNames.includes(name)){
            return {success: false, msg: "Name already in use"};
        }
        console.log("New player " + name + " with id " + id + " and " + isAdmin);
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
            player[id].pieces.push(this.availableBPieces[i]);
            this.availableBPieces = this.availableBPieces.filter(piece => piece != this.availableBPieces[i]);
        }
        if(color == 'w'){
            let i = Math.floor(Math.random()*this.availableWPieces.length);
            player[id].pieces.push(this.availableWPieces[i]);
            this.availableWPieces = this.availableBPieces.filter(piece => piece != this.availableWPieces[i]);
        }
    }
    printNames(){
        Object.values(this.players).forEach((value) => {
            console.log(value.name);
        })
        // for(let i in this.players){
        //     console.log(i.name);
        // }
    }
}

module.exports = GameStatus