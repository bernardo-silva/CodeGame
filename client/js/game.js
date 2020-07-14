

// ---- GAME ----
var gameDiv      = document.getElementById("gameDiv");
var pickPieceDiv = document.getElementById("pickPieceDiv");
var pickB        = document.getElementById("pickB");
var pickW        = document.getElementById("pickW");
var guessTip     = document.getElementById("guessTip");
var currentPlayerTurn  = document.getElementById("currentPlayerTurn");

var game_width  = gameDiv.width;
var game_height = gameDiv.height;
var playerDrew = false;
const timeout = async ms => new Promise(res => setTimeout(res, ms));

socket.on('initialDraw', async function(){
    pickPieceDiv.style.display = 'inline-block';
    //Picking 3 initial pieces
    for(let i=0; i<3;i++){
        while(!playerDrew){
            await timeout(10);
        }
        playerDrew = false;
    }
    console.log('Picking done!');
    socket.emit('initialDrawOver');
    pickPieceDiv.style.display = 'none';
});

socket.on('addSelfPiece',function(data){
    board.dealPieces(data.id, data.pieces);
    // drawPieces(data.pieces,data.nr,0);
    board.drawPieces(data.id);
});
socket.on('addPlayerPiece',function(data){
    board.dealPieces(data.id, data.pieces);
    // drawPieces(data.pieces,data.nr,player);
    board.drawPieces(data.id);
});


socket.on('yourTurn',async function(data){
    console.log('Your turn to play');
    currentPlayerTurn.style.display = 'none';
    pickPieceDiv.style.display = 'inline-block';
    playerDrew = false;
    while(!playerDrew){
        await timeout(10);
    }
    console.log('Piece picked');
    pickPieceDiv.style.display = 'none';
    guessTip.style.display = 'inline-block';
});

socket.on('currentPlayerTurn', function(data){
    currentPlayerTurn.innerHTML = board.players[data.id].name + '\' turn!';
    currentPlayerTurn.style.display = 'inline-block';
});


pickB.onmouseover = function(){
    if (board.availableBPieces > 0)
        this.style.border = "2px #00ff00 solid";
    else
        this.style.border = "2px #ff0000 solid";
};
pickB.onmouseout = function(){
    this.style.border = "";
};
pickW.onmouseover = function(){
    if (board.availableWPieces > 0)
        this.style.border = "2px #00ff00 solid";
    else
        this.style.border = "2px #ff0000 solid";
};
pickW.onmouseout = function(){
    this.style.border = "";
};

pickB.onclick = function(){
    if (board.availableBPieces == 0)
        return;
    socket.emit('piecePicked',{color: 'b'});
    // pickPieceDiv.style.display = 'none';
    playerDrew = true;
}

pickW.onclick = function(){
    if (board.availableWPieces == 0)
        return;
    socket.emit('piecePicked',{color: 'w'});
    playerDrew = true;
    // pickPieceDiv.style.display = 'none';
}

function drawPieces(pieces, nrPlayers,player){
    var positions = [[0,2],[0,1,2],[0,1,2,3]];
    var positions2 = positions[nrPlayers-2];
    var position = positions2[player];

    var rotation = ['0deg','90deg','180deg','270deg'];
    var rotate = rotation[position];

    var playerDiv = document.getElementById("player" + position + "Div");
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
    console.log('imgw: ' + image_width + " imgh: " + image_height);
    piecesDiv.innerHTML = '';

    for(let i=0; i<pieces.length; i++){
        var div = document.createElement("div");
        var image = document.createElement("img");
        image.src = '/client/assets/' + pieces[i] + '.png';
        image.style.transform = 'rotate(' + rotate + ')';
        div.style.width = image_width;
        div.style.height = image_height;
        image.style.width = "100%";
        image.style.height = "100%";
        div.style.position = 'relative';
        if(position==1){
            console.log(height,image_width,image_height,pieces.length);
            topPos = height/2 + .15*height*(i-pieces.length/2);
            console.log("Top: " + topPos);
            div.style.top = topPos + 'px';
            div.style.left = '0px';
            // image.s
        }
        
        piecesDiv.appendChild(div);
        div.appendChild(image);
    }
}