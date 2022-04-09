import {ICommandPayload} from "./ICommandPayload";
import {kCommand} from "./kCommand";


export class ICOMDrawAll extends ICommandPayload {

    constructor() {
        super();
        this.command = kCommand.COMDrawAll;
        this.save = false;
        this.publish = false;
    }
}
