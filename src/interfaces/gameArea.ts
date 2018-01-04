import { ICoord } from "./coord";
import { IGameObject } from "./gameObject";

export interface IGameArea{
    size:ICoord,
    context:CanvasRenderingContext2D,
    score:{hero:number,enemy:number},
    NPCsBad:IGameObject[] ,
    NPCsGood:IGameObject[],
    NPCsDanger:IGameObject[],
    hero :IGameObject ,
    enemy :IGameObject,
    loadBoard():void,
    clear():void,
    draw():void,
    endGame(a:number):void
}