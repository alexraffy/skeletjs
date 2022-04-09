import {ISkeletWebSocketResponse} from "./ISkeletWebSocketResponse";


export interface ISkeletWebSocketDelegate {
    on(msg: ISkeletWebSocketResponse);
    connectionLost?();
}

