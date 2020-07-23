

// ---- CHAT ----
var chatDiv   = document.getElementById("chatDiv");
var chatText  = document.getElementById("chatText");
var chatForm  = document.getElementById("chatForm");
var chatInput = document.getElementById("chatInput");

//CHAT-----
chatForm.onsubmit = function(e){
    e.preventDefault();
    if (!chatInput.value.replace(/\s/g, '').length){
        return;
    }
    socket.emit('addToChat',{msg:chatInput.value});
    chatInput.value = "";
};

socket.on('addToChat',function(msg){
    // console.log(msg.msg);
    addToChat(msg.msg);
    chatText.scrollTop = chatText.scrollHeight;

});

function addToChat(msg){
    chatText.innerHTML += '<div class="msg">' + msg + '</div>';
}