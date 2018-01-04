import {IBomb} from "./bomb"
import {IStorage} from "./storage"
import { ICoord } from "./coord";
import { IExplodedBomb } from "./explodedBomb";
import { IGameArea } from "./gameArea";

export interface IGameObject {
    area:IGameArea,
    symbol:string,
    coord:ICoord 
    timeToMove :number,
    bombs: IBomb[],
    storage: IStorage,
    explodedBombs:IExplodedBomb[],
    update(a:boolean,b:boolean):void,
    draw():void,
    manageBombs():void,
    plantBomb():void
}