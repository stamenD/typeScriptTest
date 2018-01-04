"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var socketIO = require("socket.io");
var app = express();
var http = require('http').Server(app);
var io = socketIO(http);
var port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
var rooms = [];
io.on('connection', function (socketFS) {
    socketFS.on('roomName', function (msg) {
        var result = 0;
        if (rooms)
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].name === msg)
                    result = rooms[i].count;
            }
        console.log(rooms, msg);
        if (result == 0) {
            socketFS.emit("er", "first");
            socketFS.join(msg);
            var newRoom = { name: msg, count: 1 };
            rooms.push(newRoom);
            socketFS.on('npc', function (data) {
                socketFS.broadcast.to(msg).emit('npcCoordinates', data);
            });
            socketFS.on('score', function (data) {
                socketFS.broadcast.to(msg).emit('score', data);
            });
            socketFS.on('heroCoordinates', function (data) {
                socketFS.broadcast.to(msg).emit('enemyCoordinates', data);
            });
        }
        else if (result == 1) {
            socketFS.emit("er", "second");
            socketFS.join(msg);
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].name === msg)
                    rooms[i].count++;
            }
            socketFS.broadcast.to(msg).emit('success', "ready");
            socketFS.on('heroCoordinates', function (data) {
                socketFS.broadcast.to(msg).emit('enemyCoordinates', data);
            });
        }
        else {
            socketFS.emit("er", false);
        }
        socketFS.on('disconnect', function () {
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].name === msg)
                    rooms[i].count--;
            }
            console.log("player leaves", rooms);
        });
        console.log(rooms);
    });
});
http.listen(port, function () {
    console.log('listening on *:' + port);
});
//# sourceMappingURL=index.js.map