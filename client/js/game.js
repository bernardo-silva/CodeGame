

// ---- GAME ----
var gameDiv       = document.getElementById("gameDiv");
var pickPieceDiv = document.getElementById("pickPieceDiv");
var pickB        = document.getElementById("pickB");
var pickW        = document.getElementById("pickW");

var img = {};
var img_names = ['black.png', 'black0.png', 'black1.png', 'black2.png', 'black3.png', 
'black4.png', 'black5.png', 'black6.png', 'black7.png', 'black8.png',
'black9.png', 'black10.png', 'black11.png', 'black-.png',
'white.png', 'white0.png', 'white1.png', 'white2.png', 'white3.png', 
'white4.png', 'white5.png', 'white6.png', 'white7.png', 'white8.png',
'white9.png', 'white10.png', 'white11.png', 'white-.png'];

for(let i in img_names){
    img[img_names[i]] = new Image();
    img[img_names[i]].src = '/client/assets/' + img_names[i];
}
var game_width  = gameDiv.width;
var game_height = gameDiv.height;
var availableB  = 12;
var availableW  = 12;
var playerDrew = false;
const timeout = async ms => new Promise(res => setTimeout(res, ms));

socket.on('initialDraw', async function(){
    pickPieceDiv.style.display = 'inline-block';
    for(let i=0; i<3;i++){
        while(!playerDrew){
            console.log("Still Here"); 
            await timeout(50);
        }
        playerDrew = false;
    }
    console.log('Picking done!');
    socket.emit('initialDrawOver');
    pickPieceDiv.style.display = 'none';
});

socket.on('addSelfPiece',function(data){
    // pickPieceDiv.style.display = 'inline-block';
    drawPieces(data.pieces,data.nr,0);
});

socket.on('yourTurn',function(data){
    // pickPieceDiv.style.display = 'inline-block';
    availableB = data.available[0];
    availableW = data.available[1];
});


pickB.onmouseover = function(){
    if (availableB > 0)
        this.style.border = "2px #00ff00 solid";
    else
        this.style.border = "2px #ff0000 solid";
};
pickB.onmouseout = function(){
    this.style.border = "";
};
pickW.onmouseover = function(){
    if (availableW > 0)
        this.style.border = "2px #00ff00 solid";
    else
        this.style.border = "2px #ff0000 solid";
};
pickW.onmouseout = function(){
    this.style.border = "";
};

pickB.onclick = function(){
    if (availableB == 0)
        return;
    socket.emit('piecePicked',{color: 'b'});
    // pickPieceDiv.style.display = 'none';
    playerDrew = true;
}

pickW.onclick = function(){
    if (availableW == 0)
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
    var piecesDiv = playerDiv.firstElementChild;
    var width  = playerDiv.offsetWidth;
    var height = piecesDiv.offsetHeight;
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
        var image = document.createElement("img");
        image.src = '/client/assets/' + pieces[i] + '.png';
        image.style.transform = 'rotate(' + rotation + ');';
        image.style.width = image_width;
        image.style.height = image_height;

        piecesDiv.appendChild(image);
    }
}