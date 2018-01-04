import { IGameObject } from "../interfaces/gameObject";
import { IBomb } from "../interfaces/bomb";
import { IExplodedBomb } from "../interfaces/explodedBomb";
import { IStorage } from "../interfaces/storage";
import { ICoord } from "../interfaces/coord";
import { IGameArea } from "../interfaces/gameArea";

export default class GameObject implements IGameObject  {
    timeToMove:number;
    bombs:IBomb[];
    explodedBombs:IExplodedBomb[];
    storage:IStorage;
    constructor(public symbol:string,public coord:ICoord,public area:IGameArea) {
      this.timeToMove=5;
      this.bombs;
      this.explodedBombs;
      this.storage;
    }
    update(beFirst:boolean,danger:boolean){
      let newX = this.coord.x + this.storage.oldCoord.x
      let newY = this.coord.y + this.storage.oldCoord.y
      
      let myRightX = newX + 40;
      let myTopY = newY - 35;
      let myLeftX = newX;
      let myBottomY = newY + 4;
    
      let touch = checkTouching(this.area, myRightX , myTopY , myLeftX , myBottomY)
      if(touch === 0)  // clear movement
      {
        this.coord.x = newX
        this.coord.y = newY
        this.storage.oldCoord.x = this.storage.curCoord.x
        this.storage.oldCoord.y = this.storage.curCoord.y
      }
      else if(touch === 1) // touch wall 
      {
        this.coord.x += this.storage.oldCoord.x
        this.coord.y += this.storage.oldCoord.y
      }
      else if(touch === 2){ // touch border
        this.storage.oldCoord.x = 0
        this.storage.oldCoord.y = 0
      }
    
      //only one player checks whether someone touch specific element
      if(beFirst && !danger){
    
      //1 -goodNPC , 2 -badNPC , 0 -dangerNPC , 3 - hero , 4 - enemy
      for(let i = 0; i < 3;i++){ 
       let getEl = touchElement(this.area,myRightX , myTopY , myLeftX , myBottomY,i) 
       if(getEl!==-1)  
       {
         if(i==1){
        this.area.score.hero += 400 
        this.area.NPCsGood[getEl].coord.x=-20
        this.area.NPCsGood[getEl].coord.y=-20
         }
         else {
        this.area.score.hero -= 100     
         }
       }
      }
      this.explodedBombs.forEach(current => {
        for(let i =0;i<current.explosion.length;i++){
        let hit=touchElement(this.area,current.explosion[i].x+35,
        current.explosion[i].y - 35,
        current.explosion[i].x,
        current.explosion[i].y,
        0)
        if(hit!=-1)
        {        
          this.area.score.hero += 300
          this.area.NPCsDanger[hit].coord.x =- 20
          this.area.NPCsDanger[hit].coord.y =- 20
        }
        hit=touchElement(this.area,current.explosion[i].x+35,
          current.explosion[i].y - 35,
          current.explosion[i].x,
          current.explosion[i].y,
          4)
          if(hit!=-1)
          {
          this.area.score.enemy -= 500
          }
        }
      });
    
    
      for(let i = 0; i < 3;i++){ 
        let getEl = touchElement(this.area,this.area.enemy.coord.x +40 , this.area.enemy.coord.y-35 , this.area.enemy.coord.x , this.area.enemy.coord.y+4,i) 
        if(getEl!==-1)  
        {
          if(i==2){
         this.area.score.enemy += 400 
         this.area.NPCsBad[getEl].coord.x=-20
         this.area.NPCsBad[getEl].coord.y=-20
          }
          else {
         this.area.score.enemy -= 100     
          }
        }
      }
      this.area.enemy.explodedBombs.forEach(current => {
        for(let i =0;i<current.explosion.length;i++){
          let hit=touchElement(this.area,current.explosion[i].x+35,
         current.explosion[i].y-35,
         current.explosion[i].x,
         current.explosion[i].y,
         0)
         if(hit!=-1)
         {
           console.error("you danger", this.area.NPCsDanger[hit])
           this.area.score.enemy += 300
           this.area.NPCsDanger[hit].coord.x=-20
           this.area.NPCsDanger[hit].coord.y=-20
         }
          hit=touchElement(this.area,current.explosion[i].x+35,
            current.explosion[i].y-35,
            current.explosion[i].x,
            current.explosion[i].y,
          3)
          if(hit!=-1)
          {
            console.error("you enemy")
            this.area.score.hero -= 500
          }
        }
      });
      }
     
    }

    manageBombs(){
      const timeNow = new Date().getTime() / 1000;
      this.bombs.forEach(bomb => { 
         if(bomb.endTime <= timeNow) 
          {
            let bomb = this.bombs.shift()
            expodeBomb(this,bomb)
          }
          else
          {
           let ctx = this.area.context;
           ctx.fillText('\uD83D\uDCA3', bomb.coord.x, bomb.coord.y)      
          }
      });
    }

    draw(){
      let ctx = this.area.context;
      ctx.font = "900 40px Arial";
      ctx.fillText(this.symbol, this.coord.x, this.coord.y);
      this.manageBombs()
      let time = new Date().getTime() / 1000
      this.explodedBombs.forEach(current => {
        if(current.endTime > time)
       {
         console.log("start")
         for(let i =0;i<current.explosion.length;i++)
        { 
          ctx.fillText('\uD83D\uDD25', current.explosion[i].x, current.explosion[i].y) 
          console.log("x:",current.explosion[i].x,"y:", current.explosion[i].y)
        }
       }
       else{
          this.explodedBombs.shift()
       }
      });
    
    }
    plantBomb(){
      if(this.bombs.length>= 10) return  // limit of number of bombs
      
      let column = Math.floor((this.coord.x+20 ) / 90)*2-1+((this.coord.x+20 -Math.floor((this.coord.x+20 ) / 90)*90)>50?2:1);
      let row = Math.floor((this.coord.y-20 ) / 90)*2-1+((this.coord.y-20 -Math.floor((this.coord.y-20 ) / 90)*90)>50?2:1);
      let offsetC = Math.round(column / 2)
      let offsetR = Math.round(row / 2)
      let bomb:IBomb
      bomb.coord = {x:column*50 - offsetC*10 + 5, y:(row+1)*50 - offsetR*10 - 5}
      bomb.endTime = new Date().getTime() / 1000 + 3 // (3)sec time to exposion
      let lastBomb = this.bombs.pop()
      if(lastBomb && bomb.coord.x == lastBomb.coord.x && bomb.coord.y == lastBomb.coord.y)
        this.bombs.push(lastBomb)
      else{
        if(lastBomb) this.bombs.push(lastBomb)
        this.bombs.push(bomb)      
      }
      // console.log(this.bombs)
    }
  }
  

function checkTouching(area:IGameArea,myRightX:number, myTopY:number, myLeftX:number, myBottomY:number){
    //check 
    for(let i=0;i<area.enemy.bombs.length;i++)
    {
      let rightX = area.enemy.bombs[i].coord.x + 40;
      let topY = area.enemy.bombs[i].coord.y - 35;
      let leftX = area.enemy.bombs[i].coord.x ;
      let bottomY = area.enemy.bombs[i].coord.y;

      
      let lt = (leftX<=myLeftX && myLeftX<=rightX && bottomY>=myTopY &&  myTopY>=topY) 
      let lb = (leftX<=myLeftX && myLeftX<=rightX && bottomY>=myBottomY &&  myBottomY>=topY) 
      let rt = (leftX<=myRightX && myRightX<=rightX && bottomY>=myTopY &&  myTopY>=topY) 
      let rb = (leftX<=myRightX && myRightX<=rightX && bottomY>=myBottomY &&  myBottomY>=topY) 
      if(lt || lb || rt || rb)
      { 
        console.log(bottomY , leftX ,topY, rightX)
        console.error("touched bomb!!!")
        return 2
      }            
    }
   
    for(let x=0;x<11;x++)
    for(let y=0;y<5;y++)
    {
      
      let rightX = 50 + 90*x + 40;
      let topY = 50 + 90*y;
      let leftX = 50 + 90*x;
      let bottomY = 50 + 90*y+40;
      // console.log(bottomY , leftX ,topY, rightX)
      let lt = (leftX<=myLeftX && myLeftX<=rightX && bottomY>=myTopY &&  myTopY>=topY) 
      let lb = (leftX<=myLeftX && myLeftX<=rightX && bottomY>=myBottomY &&  myBottomY>=topY) 
      let rt = (leftX<=myRightX && myRightX<=rightX && bottomY>=myTopY &&  myTopY>=topY) 
      let rb = (leftX<=myRightX && myRightX<=rightX && bottomY>=myBottomY &&  myBottomY>=topY) 
      if(lt || lb || rt || rb)
      { 
        return 1
      }            
    }

    if(myRightX > this.area.size.x || myLeftX < 1 || myBottomY > this.area.size.y-4 || myTopY < 4) 
    {
        return 2
    }
     
    return 0;
}

function expodeBomb(who:GameObject,bomb:IBomb){
 let explosion:ICoord[]

 for(let i=-2;i<=2;i++)
 {
  let coords = {x: bomb.coord.x+i*45,y:bomb.coord.y}
  let touch = checkTouching(who.area,bomb.coord.x+i*45 + 40 , bomb.coord.y - 40 , bomb.coord.x+i*45 , bomb.coord.y)
  if(touch !== 1)
  explosion.push(coords)  
  else if(i === -1)
  {
    console.error("i:",i,"x:",coords.x,"y:",coords.y)      
    explosion.pop()  
  }
  else if(i === 1)
  {
    console.error("i:",i,"x:",coords.x,"y:",coords.y)      
    break
  }
 }  
 for(let j=-2;j<=2;j++)
 {
  if(j==0) continue
  let coords = {x: bomb.coord.x,y:bomb.coord.y+j*45}
  let touch = checkTouching(who.area, bomb.coord.x + 40 , bomb.coord.y+j*45 - 40 , bomb.coord.x , bomb.coord.y+j*45)
  if(touch !== 1)
  explosion.push(coords)  
  else if(j === -1)
  {
    console.error("j:",j,"x:",coords.x,"y:",coords.y)      
    explosion.pop()  
  } 
  else if(j === 1)
  {
    console.error("j:",j,"x:",coords.x,"y:",coords.y)      
    break
  } 
 }
 let time = new Date().getTime() / 1000 + 0.7
 who.explodedBombs.push({explosion: explosion , endTime: time})
}

function touchElement(area:IGameArea,myRightX:number, myTopY:number, myLeftX:number, myBottomY:number,npc:number){
    let touch = -1,len
   if(npc == 3 || npc == 4) len = 1
   else len = 11
    // console.log(myBottomY, myLeftX, myTopY,myRightX)
    for(let i=0;i<len;i++)
    {
      let rightX,leftX,topY,bottomY
      if(npc == 1){
       rightX = area.NPCsGood[i].coord.x + 35;
       topY = area.NPCsGood[i].coord.y - 40;
       leftX = area.NPCsGood[i].coord.x;
       bottomY = area.NPCsGood[i].coord.y;
      }
      else if(npc == 2)
      {
         rightX = area.NPCsBad[i].coord.x + 35;
         topY = area.NPCsBad[i].coord.y - 40;
         leftX = area.NPCsBad[i].coord.x;
         bottomY = area.NPCsBad[i].coord.y;
      }
      else if(npc == 0){
        rightX = area.NPCsDanger[i].coord.x + 35;
        topY = area.NPCsDanger[i].coord.y - 40;
        leftX = area.NPCsDanger[i].coord.x;
        bottomY = area.NPCsDanger[i].coord.y;
      }
      else if(npc == 3){
        rightX = area.hero.coord.x + 35;
        topY = area.hero.coord.y - 40;
        leftX = area.hero.coord.x;
        bottomY = area.hero.coord.y;
      }    
      else if(npc == 4){
        rightX = area.enemy.coord.x + 35;
        topY = area.enemy.coord.y - 40;
        leftX = area.enemy.coord.x;
        bottomY = area.enemy.coord.y;
      }
  
      let left = (leftX<myRightX && myRightX<rightX  && Math.abs(topY - myTopY)<10) 
      let bottom = (bottomY>myTopY &&  myTopY>topY && Math.abs(leftX - myLeftX)<10) 
      let right = (myLeftX<rightX &&  leftX <myLeftX && Math.abs(topY - myTopY)<10)
      let top = (myBottomY>topY+5 && myBottomY<bottomY && Math.abs(leftX - myLeftX)<10)
      if(left || bottom || right || top)
      { 
        console.log(bottom,left  , top, right)
        touch = i
        break
      }            
    }
    return touch
  }