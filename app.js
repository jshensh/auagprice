var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pio=require("socket.io-client");
var request = require('request');
var Psocket,Nsocket;

var main=function() {
    request('http://jin10.com/js/pserver.js', function (error, response, pbody) {
        if (error || response.statusCode != 200) {
            console.log("Get PServer Failed.")
            return false;
        }
        var pServerArr=JSON.parse(pbody.substr(13,pbody.length-14));
        var pServer=pServerArr[Math.floor(Math.random() * pServerArr.length + 1) - 1];
        console.log("PServer: "+pServer);
        Psocket=Pio.connect(pServer, {'force new connection': true, 'reconnection': false});
        pSocketConnect();
        request('http://jin10.com/js/server.js', function (error, response, nbody) {
            if (error || response.statusCode != 200) {
                console.log("Get NServer Failed.")
                return false;
            }
            var nServerArr=JSON.parse(nbody.substr(12,nbody.length-13));
            var nServer=nServerArr[Math.floor(Math.random() * nServerArr.length + 1) - 1];
            console.log("nServerArr: "+nServer);
            Nsocket=Pio.connect(nServer, {'force new connection': true, 'reconnection': false});
            nSocketConnect();
        });
    });
};




var his = {};

var pSocketConnect=function() {
    Psocket.on('connect' , function() {
        Psocket.emit('delAllSubscription' , []);
        Psocket.emit('addSubscription' , ['XAUUSD', 'XAGUSD', 'UKOIL', 'USOIL', 'DXY', 'EURUSD', 'GC', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF', 'NZDUSD', 'USDCNH', 'XPDUSD', 'DOWI', 'NASX', 'SPX500', 'JPN225', 'SZZZ', 'SZCZ', 'XPTUSD']);
        Psocket.emit('reqvote', "ok");
    });
    Psocket.on('price list', function(msg) {
        console.log(msg);
        his[msg['name']]=msg;
        io.emit('price list', msg);
    });
    Psocket.on('error', function (reason) {
        setTimeout(function () {
            main();
        }, 1000)
    });
    Psocket.on('connect_error', function (reason) {
        setTimeout(function () {
            main();
        }, 1000)
    });
    Psocket.on('repair', function (reason) {
        setTimeout(function () {
            main();
        }, 4000)
    });
    Psocket.on('disconnect', function () {
        setTimeout(function () {
            main();
        }, 1000)
    });
};

var nSocketConnect=function() {
    Nsocket.on('connect' , function() {
        Nsocket.emit('reg', "ok");
    });
    Nsocket.on('user message', function(msg) {
        io.emit('user message', msg);
        console.log(msg);
    });
    Nsocket.on('error', function (reason) {
        setTimeout(function () {
            main();
        }, 1000)
    });
    Nsocket.on('connect_error', function (reason) {
        setTimeout(function () {
            main();
        }, 1000)
    });
    Nsocket.on('repair', function (reason) {
        setTimeout(function () {
            main();
        }, 4000)
    });
    Nsocket.on('disconnect', function () {
        setTimeout(function () {
            main();
        }, 1000)
    });
};

app.get('/', function(req, res){
    request('http://www.jin10.com/example/jin10.com.html', function (error, response, body) {
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
    request('http://m.jin10.com/flash?maxId=0&count=50', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body=JSON.parse(body);
            for (var i = body.length - 1; i >= 0; i--) {
                io.emit('user message', body[i]);
            };
        }
    });
});

main();
http.listen(3000, function(){
    console.log('listening on *:3000');
});