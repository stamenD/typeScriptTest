"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gameArea_1 = require("../classes/gameArea");
var gameObject_1 = require("../classes/gameObject");
var beFirst, socket, area;
function connect() {
    document.getElementById("newGame").hidden = true;
    socket = io();
}
function join() {
    var input = document.getElementById("room").getAttribute("value");
    socket.emit('roomName', input);
    socket.on('er', function (msg) {
        if (msg === "first") {
            beFirst = true;
            document.getElementById("infoRoom").remove();
            document.getElementById("error").innerHTML = "Waiting a second player!";
            socket.on("success", function (data) { document.getElementById("error").innerHTML = ''; startGame(); });
        }
        else if (msg === "second") {
            beFirst = false;
            document.getElementById("error").innerHTML = "";
            document.getElementById("infoRoom").remove();
            startGame();
        }
        else
            document.getElementById("error").innerHTML = "This room is full! Try with another one or create one.";
    });
}
function newGame() {
    document.getElementById("newGame").hidden = true;
    document.getElementById("error").innerHTML = 'Waiting an opponent!';
    socket.on("newGame", function (data) {
        if (data === "ready1") {
            document.getElementById("error").innerHTML = '';
            socket.emit('newGame', "ready2");
            startGame();
        }
        else {
            document.getElementById("error").innerHTML = '';
            startGame();
        }
    });
    socket.emit('newGame', "ready1");
}
function startGame() {
    console.log(beFirst, "start");
    area = new gameArea_1.GameArea();
    area.loadBoard();
    if (beFirst) {
        area.hero = new gameObject_1.default('\uD83D\uDC3B', { x: 40, y: 40 }, area);
        area.enemy = new gameObject_1.default('\uD83D\uDC05', { x: 940, y: 40 }, area);
        for (var i = 0; i < 11; i++) {
            var rH = Math.floor((Math.random() * 6) + 1) - 1;
            if (i % 2 == 0)
                area.NPCsBad[i] = new gameObject_1.default('\uD83C\uDF57', { x: 90 * i + 50, y: 90 * rH + 40 }, area);
            else
                area.NPCsGood[i] = new gameObject_1.default('\uD83C\uDF6F', { x: 90 * i + 50, y: 90 * rH + 40 }, area);
        }
        for (var i = 0; i < 11; i++) {
            var rH = Math.floor((Math.random() * 6) + 1) - 1;
            if (i % 2 == 0)
                area.NPCsGood[i] = new gameObject_1.default('\uD83C\uDF6F', { x: 90 * i, y: 90 * rH + 40 }, area);
            else
                area.NPCsBad[i] = new gameObject_1.default('\uD83C\uDF57', { x: 90 * i, y: 90 * rH + 40 }, area);
        }
        for (var i = 0; i < 11; i++) {
            var rH = Math.floor((Math.random() * 6) + 1) - 1;
            area.NPCsDanger[i] = new gameObject_1.default('\uD83D\uDC09', { x: 90 * i, y: 90 * rH + 40 }, area);
        }
    }
    else {
        area.enemy = new gameObject_1.default('\uD83D\uDC3B', { x: 40, y: 40 }, area);
        area.hero = new gameObject_1.default('\uD83D\uDC05', { x: 940, y: 40 }, area);
        for (var i = 0; i < 11; i++) {
            area.NPCsBad[i] = new gameObject_1.default('\uD83C\uDF57', { x: 0, y: 0 }, area);
            area.NPCsGood[i] = new gameObject_1.default('\uD83C\uDF6F', { x: 0, y: 0 }, area);
            area.NPCsDanger[i] = new gameObject_1.default('\uD83D\uDC09', { x: 0, y: 0 }, area);
        }
    }
    setInterval(updateGameArea, 60);
}
function toUTF16(codePoint) {
    var TEN_BITS = parseInt('1111111111', 2);
    function u(codeUnit) {
        return '\\u' + codeUnit.toString(16).toUpperCase();
    }
    if (codePoint <= 0xFFFF) {
        return u(codePoint);
    }
    codePoint -= 0x10000;
    var leadSurrogate = 0xD800 + (codePoint >> 10);
    var tailSurrogate = 0xDC00 + (codePoint & TEN_BITS);
    return u(leadSurrogate) + u(tailSurrogate);
}
function sendInfoForNewPositions() {
    socket.emit("heroCoordinates", area.hero);
    socket.emit("score", area.score);
    var npc;
    npc.good = area.NPCsGood;
    npc.bad = area.NPCsBad;
    npc.danger = area.NPCsDanger;
    socket.emit("npc", npc);
}
function receiveInfoForHeroes() {
    socket.on("enemyCoordinates", function (data) {
        area.enemy.coord.x = data.coord.x;
        area.enemy.coord.y = data.coord.y;
        area.enemy.bombs = data.bombs;
        area.enemy.explodedBombs = data.explodedBombs;
    });
    socket.on("score", function (data) { area.score = data; });
    socket.on("npcCoordinates", function (data) {
        for (var i = 0; i < 11; i++) {
            area.NPCsBad[i].coord.x = data.bad[i].coord.x;
            area.NPCsBad[i].coord.y = data.bad[i].coord.y;
            area.NPCsGood[i].coord.x = data.good[i].coord.x;
            area.NPCsGood[i].coord.y = data.good[i].coord.y;
            area.NPCsDanger[i].coord.x = data.danger[i].coord.x;
            area.NPCsDanger[i].coord.y = data.danger[i].coord.y;
        }
    });
}
function receiveInfoFromKeyboard() {
    window.addEventListener("keypress", function (event) {
        console.log(event);
        area.hero.storage.oldCoord.x = 0;
        area.hero.storage.oldCoord.y = 0;
    });
}
function updateHeroesPositions() {
    area.hero.update(false, false);
    area.hero.draw();
    area.enemy.draw();
    for (var i = 0; i < 11; i++) {
        area.NPCsBad[i].draw();
        area.NPCsGood[i].draw();
        area.NPCsDanger[i].draw();
    }
}
function checkForEnd() {
    for (var i = 0; i < area.NPCsDanger.length; i++)
        if (area.NPCsDanger[i].coord.x != -20)
            return 0;
    var winnerIsHero = true, winnerIsEnemy = true;
    for (var i = 0; i < area.NPCsBad.length; i++)
        if (area.NPCsBad[i].coord.x != -20)
            winnerIsEnemy = false;
    for (var i = 0; i < area.NPCsGood.length; i++)
        if (area.NPCsGood[i].coord.x != -20)
            winnerIsHero = false;
    if (winnerIsHero)
        return 1;
    if (winnerIsEnemy)
        return 2;
    return 0;
}
function moveDangers() {
    if (beFirst)
        for (var i = 0; i < 11; i++) {
            if (area.NPCsDanger[i].timeToMove === 0) {
                area.NPCsDanger[i].storage.oldCoord = { x: 0, y: 0 };
                area.NPCsDanger[i].timeToMove = 5;
                var direction = Math.floor((Math.random() * 5) + 1);
                switch (direction) {
                    case 1:
                        area.NPCsDanger[i].storage.oldCoord.x += 9;
                        break;
                    case 2:
                        area.NPCsDanger[i].storage.oldCoord.y -= 9;
                        break;
                    case 3:
                        area.NPCsDanger[i].storage.oldCoord.y += 9;
                        break;
                    case 4:
                        area.NPCsDanger[i].storage.oldCoord.x -= 9;
                        break;
                }
                area.NPCsDanger[i].update(beFirst, true);
            }
            else {
                area.NPCsDanger[i].update(beFirst, true);
                area.NPCsDanger[i].timeToMove -= 1;
            }
        }
}
function updateGameArea() {
    area.clear();
    area.draw();
    receiveInfoForHeroes();
    receiveInfoFromKeyboard();
    updateHeroesPositions();
    moveDangers();
    sendInfoForNewPositions();
    var res = checkForEnd();
    if (res)
        area.endGame(res);
}
//# sourceMappingURL=game.js.map