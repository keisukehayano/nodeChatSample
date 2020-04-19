//var ioSocket = io.connect('http://localhost:8080');

//空のioSocket用意
var ioSocket = { on: function(){}};

function connect() {
  if(!ioSocket.connected){
//サーバーへ接続
ioSocket = io.connect('http://' + window.location.host);
console.log('URL:' + window.location.host);
console.log('サーバー接続!!');
} else {
  //サーバーへ再接続
  ioSocket.connect();
  console.log('サーバー再接続!!')
}
}

connect();

//サーバーからの受け取り処理
ioSocket.on('connect',function(){});
ioSocket.on('disconnect',function(){});

var isEnter = false;
var userName;

//サーバーからの送り返し
ioSocket.on('s2c_message',function( data ){ appendMessage( data.value ) });

//画面にメッセージを描画
function appendMessage( text ) {
  $('#messageView').append('<div>' + text + '</div><br/>');
    console.log("メッセージ:" + text);
}


//自分を含む全員宛てにメッセージを送信
$('#sendMessageBtn').on('click',function(){
  //メッセージの内容を取得し、フォームをレフレッシュ
  var message = $('#messageForm').val();
  $('#messageForm').val('');

  //入室処理
  if (isEnter) {
    message = '[' + userName + '] ' + message;
  //クライアントからサーバーへ送信
  ioSocket.emit('c2s_message',{ value: message });
} else {
  userName = message;
  var entryMessage = userName + 'さんが入室しました。';
  ioSocket.emit('c2s_broadcast',{ value: entryMessage });


  ioSocket.emit('c2s_personal' ,{ value: userName });
  changeLabel();
}
});

function changeLabel() {
  $('input').attr('placeholder','message In');
  $('button').text('送信');
  isEnter = true;
}

$(window).on("beforeunload",function() {
        var getoutMessage = userName + 'さんが退室しました。';
        ioSocket.emit('c2s_broadcast',{ value: getoutMessage});
        ioSocket.disconnect();
    });




////////////////////////////////////////////////////////////////////////////////
//自分以外の全員宛てにメッセージを送信
//$('#sendMessageBrodecastBtn').on('click',function(){
  //メッセージの取得と、フォームのリフレッシュ
  //var message = $('messageForm').val();
  //$('#messageForm').val('');

  //クライアントからサーバーへ送信
  //ioSocket.emit('c2s_broadcast',{ value: message });
//});



//$(window).on('ready',function(){
//});
