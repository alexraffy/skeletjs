import {ICommandPayload} from "./ICommandPayload";
import {kCommand} from "./kCommand";


export class ICOMMouseMoved extends ICommandPayload {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        super();
        this.command = kCommand.COMMouseMoved;
        this.save = false;
        this.x = x;
        this.y = y;
    }
}