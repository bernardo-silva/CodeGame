

// ---- GAME ----
var gameDiv = document.getElementById("gameDiv");
var pickPieceDiv = document.getElementById("pickPieceDiv");
var pickB = document.getElementById("pickB");
var pickW = document.getElementById("pickW");
var guessTip = document.getElementById("guessTip");
var currentPlayerTurn = document.getElementById("currentPlayerTurn");

var game_width = gameDiv.width;
var game_height = gameDiv.height;
var playerDrew = false;
const timeout = async ms => new Promise(res => setTimeout(res, ms));

socket.on('initialDraw', async function () {
    pickPieceDiv.style.display = 'inline-block';
    //Picking 3 initial pieces
    for (let i = 0; i < 3; i++) {
        console.log(i);
        while (!playerDrew) {
            await timeout(10);
        }
        playerDrew = false;
    }
    console.log('Picking done!');
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
    console.log('Your turn to play');
    currentPlayerTurn.style.display = 'none';
    pickPieceDiv.style.display = 'inline-block';
    playerDrew = false;
    while (!playerDrew) {
        await timeout(10);
    }
    console.log('Piece picked');
    pickPieceDiv.style.display = 'none';
    guessTip.style.display = 'inline-block';
    board.setClickable();
});

socket.on('guessAgain', async function (data) {
    console.log('Your turn to play');
    currentPlayerTurn.style.display = 'none';

    pickPieceDiv.style.display = 'none';
    guessTip.style.display = 'inline-block';
    board.setClickable();
});

socket.on('pieceRevealed', function (data){
    board.revealPiece(data.revealed);
});

socket.on('revealPiece', async function (data) {
    console.log('You have to reveal a piece');
    currentPlayerTurn.style.display = 'none';
    board.revealed = false;
    board.pickPieceToReveal();
});

socket.on('currentPlayerTurn', function (data) {
    currentPlayerTurn.innerHTML = board.players[data.id].name + '\' turn!';
    currentPlayerTurn.style.display = 'inline-block';
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