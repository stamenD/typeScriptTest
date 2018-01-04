import * as express from 'express';
import * as socketIO from 'socket.io';
import { IRoom } from "./interfaces/room"
const app = express();
const http = require('http').Server(app);
const io = socketIO(http);
const port = process.env.PORT || 3000;


app.use(express.static(__dirname + '/public'));

let rooms:IRoom[] = []
io.on('connection', function(socketFS){
  // var srvSockets = io.sockets.sockets;
  // Object.keys(srvSockets)     
  socketFS.on('roomName',(msg:string)=>{  
    let result:number=0
   if(rooms)
    for (let i = 0;i < rooms.length;i++) {
        if(rooms[i].name===msg) result = rooms[i].count  
    }
    console.log(rooms,msg)
    if(result == 0)
    {
      socketFS.emit("er","first")
      socketFS.join(msg)
      let newRoom:IRoom={name:msg,count:1}
      rooms.push(newRoom)
      
      // socketFS.on('newGame', function(data){       
      //   socketFS.broadcast.to(name).emit('newGame', data) 
      // })     
      socketFS.on('npc', function(data){  
        socketFS.broadcast.to(msg).emit('npcCoordinates', data);
      })

      socketFS.on('score', function(data){  
        socketFS.broadcast.to(msg).emit('score', data);
      })
      socketFS.on('heroCoordinates', function(data){      
        socketFS.broadcast.to(msg).emit('enemyCoordinates', data);
      })
    }
    else if(result == 1)
    {
      socketFS.emit("er","second")
      socketFS.join(msg)
      for (let i = 0;i < rooms.length;i++) {
        if(rooms[i].name===msg) rooms[i].count++  
    }
      socketFS.broadcast.to(msg).emit('success', "ready")
      
      // socketFS.on('newGame', function(data){       
      //   socketFS.broadcast.to(name).emit('newGame',data) 
      // })     
      socketFS.on('heroCoordinates', function(data){       
        socketFS.broadcast.to(msg).emit('enemyCoordinates', data);
      })
    }
    else{   
      socketFS.emit("er",false)
      }

    socketFS.on('disconnect',()=>
    {    
      for (let i = 0;i < rooms.length;i++) {
      if(rooms[i].name===msg) rooms[i].count--;  
      }
    console.log("player leaves",rooms);  })
      console.log(rooms)
   })
})

http.listen(port, function(){
  console.log('listening on *:' + port);
});
