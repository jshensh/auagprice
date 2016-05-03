var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pio=require("socket.io-client");
var Nsocket=Pio.connect("http://121.199.58.43:8081");
var Psocket=Pio.connect("http://121.199.41.71:8085");
var request = require('request');

var his = {};

Psocket.on('connect' , function() {
    Psocket.emit('delAllSubscription' , []);
    Psocket.emit('addSubscription' , ['XAUUSD' , 'XAGUSD' , 'UKOIL' , 'USOIL' , 'DXY' , 'EURUSD' , 'GC' , 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF', 'EURGBP', 'EURJPY', 'XPDUSD' , 'DOWI' ,'NASX' ,'SPX500' ,'JPN225' ,'SZZZ' ,'SZCZ' ,'XPTUSD']);
    Psocket.emit('reqvote', "ok");
});
Nsocket.on('connect' , function() {
    Nsocket.emit('reg', "ok");
});


app.get('/', function(req, res){
    request('http://www.jin10.com/jin10.com.html', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(body.replace(/\n|\s{3,}/g,""));
        }
    });
});

io.on('connection', function(socket) {
    for (var i in his) {
        io.emit('price list', his[i]);
    }
});
Psocket.on('price list', function(msg) {
    his[msg['name']]=msg;
    io.emit('price list', msg);
    console.log(msg);
});

Nsocket.on('user message', function(msg) {
    io.emit('user message', msg);
    console.log(msg);
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});