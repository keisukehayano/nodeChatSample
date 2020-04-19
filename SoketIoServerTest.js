//httpモジュール読み込み
var http = require( 'http' );

// Socket.IOモジュール読み込み
var socketio = require( 'socket.io' );

 // ファイル入出力モジュール読み込み
var fs = require( 'fs' );

//パスのモジュール読み込み
const path = require('path');

//8080番ポートでHTTPサーバーを立てる
var server = http.createServer( function( req, res ) {
  //リクエストされたファイルパスを取り出す
  var filePath = "." + req.url;
  console.log(filePath);

  //ファイルパスのファイル名がなければindex.html
  if (filePath == './') {
      filePath = './index.html'
  }
    
  //拡張子名を取り出す
  var extname = String(path.extname(filePath)).toLowerCase();
  console.log('extenname:' + extname);
    
　//拡張子に対応するコンテンツ表
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml',
    '.ico': 'image/x-icon'
};
    
　//MIMEがない場合はデフォルトを使用
　var contentType = mimeTypes[extname] || 'application/octet-stream';
　
  
  //リクエストされたファイルパスを読み込み
  fs.readFile(filePath, function(error, content) {

    //エラー処理
    if (error) {
      console.log('ERROR!!' + error.code);
        //リクエストしたファイルが存在しない場合
        if (error.code === 'ENOENT') {
          //ファイルパスの先にファイルがないエラー
          res.writeHead(404);
          res.write('Sorry, check with the site admin for error: '+error.code+' ..\n404');
          res.end();
            
      } else {
        //CGIエラー
        res.writeHead(500);
        res.write('Sorry, check with the site admin for error: '+error.code+' ..\n500');
        res.end();
      }
    } else {
      //エラーがない場合、正常処理
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');


    }
  });
    
    

}).listen(8080);

//サーバーをソケットに紐づける
var io = socketio.listen( server );

//接続確立後の通信処理部分を定義
io.sockets.on( 'connection', function( socket ){
  var name;
  console.log('コネクション:' + socket);

  //クライアントからサーバーへメッセーゾ送信ハンドラ(自分を含む全員に送る)
   socket.on( 'c2s_message', function( data ) {

//サーバーからクライアントへメッセージ送り返し
  io.sockets.emit( 's2c_message', { value : data.value } );
  console.log('通常メッセージ:' + data.value);

});

  //サーバーからクライアントへメッセージ送信ハンドラ(自分以外の全員に送る)
  socket.on( 'c2s_broadcast', function( data )  {

    //サーバーからクライアントへメッセージ送り返し
    socket.broadcast.emit( 's2c_message', { value : data.value } );
    console.log('ブロードキャストメッセージ:' + data.value);

  });

  socket.on('c2s_personal', function( data ){

    var id = socket.id;
    name = data.value;
    var personalMessage = 'あなたは、' + name + 'さんとして入室しました。';
    console.log('ゆーざーID:' + id);

    io.to(id).emit('s2c_message',{ value: personalMessage });

  });
});
