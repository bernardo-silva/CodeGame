

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

socket.on('pickUpPiece',function(data){
    
});


pickB.onmouseover = function(){
    this.style.border = "2px #00ff00 solid";
};
pickB.onmouseout = function(){
    this.style.border = "";
};
pickW.onmouseover = function(){
    this.style.border = "2px #00ff00 solid";
};
pickW.onmouseout = function(){
    this.style.border = "";
};
