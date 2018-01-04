import {ICoord} from './coord'
export interface IExplodedBomb {
    explosion:ICoord[],
    endTime:number
}