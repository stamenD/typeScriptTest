import { IGameObject } from "../interfaces/gameObject"
import { IBomb } from "../interfaces/bomb"
import { ICoord } from "../interfaces/coord"
import { IExplodedBomb } from "../interfaces/explodedBomb"
import { IStorage } from "../interfaces/storage";
import { IGameArea } from "../interfaces/gameArea";

import { GameArea } from "../classes/gameArea";
import GameObject from "../classes/gameObject";

let beFirst: boolean, socket: SocketIOClient.Socket, area: IGameArea;


function connect() {
  document.getElementById("newGame").hidden = true; //TODO
  socket = io();
}

function join() {
  let input = document.getElementById("room").getAttribute("value");
  socket.emit('roomName', input)
  socket.on('er', (msg: string) => {
    if (msg === "first") {
      beFirst = true;
      document.getElementById("infoRoom").remove();
      document.getElementById("error").innerHTML = "Waiting a second player!";
      socket.on("success", (data: string) => { document.getElementById("error").innerHTML = ''; startGame() })
    }
    else if (msg === "second") {
      beFirst = false
      document.getElementById("error").innerHTML = "";
      document.getElementById("infoRoom").remove();
      startGame();
    }
    else
      document.getElementById("error").innerHTML = "This room is full! Try with another one or create one.";
  })
}

//TODO
function newGame() {
  document.getElementById("newGame").hidden = true; //TODO
  document.getElementById("error").innerHTML = 'Waiting an opponent!'

  socket.on("newGame", (data: string) => {
    if (data === "ready1") {
      document.getElementById("error").innerHTML = '';
      socket.emit('newGame', "ready2");
      startGame();
    }
    else {
      document.getElementById("error").innerHTML = '';
      startGame();
    }
  })

  socket.emit('newGame', "ready1")
}


function startGame() {
  console.log(beFirst, "start")
  area = new GameArea()
  area.loadBoard();

  if (beFirst) {
    area.hero = new GameObject('\uD83D\uDC3B', { x: 40, y: 40 }, area);
    area.enemy = new GameObject('\uD83D\uDC05', { x: 940, y: 40 }, area);

    //generate positions of npcs
    for (let i = 0; i < 11; i++) {
      let rH = Math.floor((Math.random() * 6) + 1) - 1;  // 0 - 5
      if (i % 2 == 0)
        area.NPCsBad[i] = new GameObject('\uD83C\uDF57', { x: 90 * i + 50, y: 90 * rH + 40 }, area);
      else
        area.NPCsGood[i] = new GameObject('\uD83C\uDF6F', { x: 90 * i + 50, y: 90 * rH + 40 }, area);
    }
    for (let i = 0; i < 11; i++) {
      let rH = Math.floor((Math.random() * 6) + 1) - 1;  // 0 - 5
      if (i % 2 == 0)
        area.NPCsGood[i] = new GameObject('\uD83C\uDF6F', { x: 90 * i, y: 90 * rH + 40 }, area);
      else
        area.NPCsBad[i] = new GameObject('\uD83C\uDF57', { x: 90 * i, y: 90 * rH + 40 }, area);
    }
    for (let i = 0; i < 11; i++) {
      let rH = Math.floor((Math.random() * 6) + 1) - 1;  // 0 - 5
      area.NPCsDanger[i] = new GameObject('\uD83D\uDC09', { x: 90 * i, y: 90 * rH + 40 }, area);
    }

  }
  else {
    area.enemy = new GameObject('\uD83D\uDC3B', { x: 40, y: 40 }, area);
    area.hero = new GameObject('\uD83D\uDC05', { x: 940, y: 40 }, area);

    //just create npc objects
    for (let i = 0; i < 11; i++) {
      area.NPCsBad[i] = new GameObject('\uD83C\uDF57', { x: 0, y: 0 }, area);
      area.NPCsGood[i] = new GameObject('\uD83C\uDF6F', { x: 0, y: 0 }, area);
      area.NPCsDanger[i] = new GameObject('\uD83D\uDC09', { x: 0, y: 0 }, area);
    }
  }

  setInterval(updateGameArea, 60);
}


//use to visualizate unicode symbols  \uD83D\uDD32
// 0x1F409   // \uD83D\uDC09 - dragon
// 0x1F43B   // \uD83D\uDC3B - bear
// 0x1F36F  //\uD83C\uDF6F - honey
// 0x1F357 //\uD83C\uDF57 - meat
// 0x1F525  //\uD83D\uDD25 - fire
// 0x1F405   // \uD83D\uDC05 - tiger
// 0x1f4a3   // \uD83D\uDCA3  -bomb
function toUTF16(codePoint: number) {
  var TEN_BITS = parseInt('1111111111', 2);
  function u(codeUnit: number) {
    return '\\u' + codeUnit.toString(16).toUpperCase();
  }

  if (codePoint <= 0xFFFF) {
    return u(codePoint);
  }
  codePoint -= 0x10000;

  // Shift right to get to most significant 10 bits
  var leadSurrogate = 0xD800 + (codePoint >> 10);

  // Mask to get least significant 10 bits
  var tailSurrogate = 0xDC00 + (codePoint & TEN_BITS);

  return u(leadSurrogate) + u(tailSurrogate);
}



function sendInfoForNewPositions() {
  socket.emit("heroCoordinates", area.hero)
  socket.emit("score", area.score)

  let npc: { bad: GameObject[], good: GameObject[], danger: GameObject[] }
  npc.good = area.NPCsGood
  npc.bad = area.NPCsBad
  npc.danger = area.NPCsDanger
  socket.emit("npc", npc)
}

function receiveInfoForHeroes() {
  socket.on("enemyCoordinates", (data: IGameObject) => {
    area.enemy.coord.x = data.coord.x
    area.enemy.coord.y = data.coord.y
    area.enemy.bombs = data.bombs
    area.enemy.explodedBombs = data.explodedBombs
  });

  socket.on("score", (data: { hero: number, enemy: number }) => { area.score = data })

  socket.on("npcCoordinates", (data: { bad: GameObject[], good: GameObject[], danger: GameObject[] }) => {
    for (let i = 0; i < 11; i++) {
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
    console.log(event)
    area.hero.storage.oldCoord.x = 0
    area.hero.storage.oldCoord.y = 0

  }
    //     switch(event.returnValue)
    //     {
    //       case 100: hero.storage.oldCoord.x += 9; break;
    //       case 119: hero.storage.oldCoord.y -= 9; break;
    //       case 115: hero.storage.oldCoord.y += 9; break;
    //       case 97:  hero.storage.oldCoord.x -= 9; break; 
    //       case 32: {
    //                hero.plantBomb();
    //                hero.storage.oldCoord.x = hero.storage.oldCoord.x;
    //                hero.storage.oldCoord.y = hero.storage.oldCoord.y;
    //                } break;                
    //     }
    //  },{once:true}
  )
}

function updateHeroesPositions() {
  area.hero.update(beFirst, false);
  area.hero.draw();
  area.enemy.draw();
  for (let i = 0; i < 11; i++) {
    area.NPCsBad[i].draw();
    area.NPCsGood[i].draw();
    area.NPCsDanger[i].draw();
  }
}

function checkForEnd() {
  for (let i = 0; i < area.NPCsDanger.length; i++)
    if (area.NPCsDanger[i].coord.x != -20) return 0

  let winnerIsHero = true, winnerIsEnemy = true
  for (let i = 0; i < area.NPCsBad.length; i++)
    if (area.NPCsBad[i].coord.x != -20) winnerIsEnemy = false
  for (let i = 0; i < area.NPCsGood.length; i++)
    if (area.NPCsGood[i].coord.x != -20) winnerIsHero = false

  if (winnerIsHero) return 1
  if (winnerIsEnemy) return 2
  return 0
}


function moveDangers() {
  if (beFirst)
    for (let i = 0; i < 11; i++) {
      if (area.NPCsDanger[i].timeToMove === 0) {
        area.NPCsDanger[i].storage.oldCoord = { x: 0, y: 0 }
        area.NPCsDanger[i].timeToMove = 5
        let direction = Math.floor((Math.random() * 5) + 1);  // 1 - 4
        switch (direction) {
          case 1: area.NPCsDanger[i].storage.oldCoord.x += 9; break;
          case 2: area.NPCsDanger[i].storage.oldCoord.y -= 9; break;
          case 3: area.NPCsDanger[i].storage.oldCoord.y += 9; break;
          case 4: area.NPCsDanger[i].storage.oldCoord.x -= 9; break;
        }
        area.NPCsDanger[i].update(beFirst, true)
      }
      else {
        area.NPCsDanger[i].update(beFirst, true)
        area.NPCsDanger[i].timeToMove -= 1
      }
    }
}

function updateGameArea() {
  area.clear()
  area.draw()

  receiveInfoForHeroes()
  receiveInfoFromKeyboard()

  updateHeroesPositions()

  moveDangers()
  sendInfoForNewPositions()
  let res = checkForEnd()
  if (res) area.endGame(res)
}