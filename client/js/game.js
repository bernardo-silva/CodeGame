

// ---- GAME ----
var gameDiv           = document.getElementById("gameDiv");
var pickPieceDiv      = document.getElementById("pickPieceDiv");
var pickB             = document.getElementById("pickB");
var pickW             = document.getElementById("pickW");
var textTip           = document.getElementById("textTip");
var currentPlayerTurn = document.getElementById("currentPlayerTurn");
var guessDiv = document.getElementById('guessDiv');
var endTurnButton     = document.getElementById('endTurnButton');

var game_width  = gameDiv.width;
var game_height = gameDiv.height;
var playerDrew  = false;
const timeout   = async ms => new Promise(res => setTimeout(res, ms));

socket.on('initialDraw', async function () {
    pickPieceDiv.style.display = 'inline-block';
    //Picking 3 initial pieces
    for (let i = 0; i < 3; i++) {
        while (!playerDrew) {
            await timeout(10);
        }
        playerDrew = false;
    }
    // console.log('Picking done!');
    socket.emit('initialDrawOver');
    pickPieceDiv.style.display = 'none';
});

socket.on('addSelfPiece', function (data) {
    board.dealPieces(data.id, data.pieces, data.revealed,data.pos);
    // drawPieces(data.pieces,data.nr,0);
    board.drawPieces(data.id);
    board.revealPiece(data.revealed);
});
socket.on('addPlayerPiece', function (data) {
    board.dealPieces(data.id, data.pieces);
    // drawPieces(data.pieces,data.nr,player);
    board.drawPieces(data.id);
});


socket.on('yourTurn', async function (data) {
    // console.log('Your turn to play');
    if(board.availableBPieces + board.availableWPieces > 0){
        textTip.style.display = 'none';
        pickPieceDiv.style.display = 'inline-block';
        playerDrew = false;
        while (!playerDrew) {
            await timeout(10);
        }
        // console.log('Piece picked');
    }
    pickPieceDiv.style.display = 'none';
    textTip.style.display = 'inline-block';
    textTip.innerText = 'Click on a piece to make a guess!';
    board.setClickable();
});

socket.on('guessAgain', async function (data) {
    // console.log('Your turn to play');
    endTurnButton.style.display = 'inline-block';
    // textTip.style.display = 'none';

    pickPieceDiv.style.display = 'none';

    textTip.innerText = 'Guess again or end turn!'
    textTip.style.display = 'inline-block';
    board.setClickable();
});

socket.on('pieceRevealed', function (data){
    board.revealPiece(data.revealed);
}); 

socket.on('currentPlayerTurn', function (data) {
    guessDiv.style.display = 'none';
    textTip.innerText = board.players[data.id].name + '\'s turn!';
    textTip.style.display = 'inline-block';
});

socket.on('guessResult',function(data){
    var text = board.players[data.player].name + ' guessed ' + data.piece + ' on position ';
    text += data.position + ' and was ' + (data.success? 'right!' : 'wrong!');
    textTip.innerText = text;
});

socket.on('ownGuess',function(data){
    textTip.style.display = 'inline-block';
    textTip.innerText = 'Guess was ' + (data.success? 'right!': 'wrong!');  
});

socket.on('gameOver', function(data){
    location.reload();
});

pickB.onmouseover = function () {
    if (board.availableBPieces > 0)
        this.style.border = "2px #00ff00 solid";
    else
        this.style.border = "2px #ff0000 solid";
};
pickB.onmouseout = function () {
    this.style.border = "";
};
pickW.onmouseover = function () {
    if (board.availableWPieces > 0)
        this.style.border = "2px #00ff00 solid";
    else
        this.style.border = "2px #ff0000 solid";
};
pickW.onmouseout = function () {
    this.style.border = "";
};

pickB.onclick = function () {
    if (board.availableBPieces == 0)
        return;
    socket.emit('piecePicked', { color: 'b' });
    // pickPieceDiv.style.display = 'none';
    playerDrew = true;
};

pickW.onclick = function () {
    if (board.availableWPieces == 0)
        return;
    socket.emit('piecePicked', { color: 'w' });
    playerDrew = true;
    // pickPieceDiv.style.display = 'none';
};

endTurnButton.onclick = function(){
    socket.emit('endTurn');
    this.style.display = 'none';
    board.setUnclickable();
};