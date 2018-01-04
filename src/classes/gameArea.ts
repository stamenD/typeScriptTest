import { IGameArea } from "../interfaces/gameArea";
import { IGameObject } from "../interfaces/gameObject";

export class GameArea implements IGameArea{  
    score={hero:0,enemy:0};
    size = {x:1040,y:500};
    NPCsBad:IGameObject[] 
    NPCsGood:IGameObject[]
    NPCsDanger:IGameObject[]
    hero :IGameObject 
    enemy :IGameObject
    context:CanvasRenderingContext2D;
    constructor(){}
    loadBoard() {
      let canvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("mainCanvas");
      this.context = canvas.getContext("2d");     
      canvas.width = this.size.x;
      canvas.height = this.size.y;
    };
    clear() {
      this.context.clearRect(0, 0, 1040, 500)
    };
    draw(){
      document.getElementById("scoreHero").children[1].innerHTML=this.score.hero.toString()
      document.getElementById("scoreEnemy").children[1].innerHTML=this.score.enemy.toString()
      this.context.fillStyle = 'rgba(204, 196, 196, 0.938)';
      
      this.context.beginPath();
      this.context.moveTo(3, 3);
      this.context.lineTo(1037,9);
      this.context.lineTo(1037, 497);
      this.context.lineTo(3, 497);
      this.context.lineTo(3, 3);
      this.context.stroke();
  
      for(let x=0;x<11;x++)
        for(let y=0;y<5;y++)
          this.context.fillRect(50+90*x,50+90*y, 40, 40)
    };
    endGame(winner:number) {
      let text
      if(winner == 1)
        text = "Hero win"
      else
        text = "Enemy win"
      this.context.font = "900 70px Arial";
      this.context.fillText(text, 450, 250);
      document.getElementById("newGame").hidden=false; //TODO
    }
  }
  