import {ICommandPayload} from "./ICommandPayload";
import {kCommand} from "./kCommand";


export class ICOMLayerDraw extends ICommandPayload {

    resource_id: string;
    layer_id: string;
    constructor(resource_id: string, layer_id: string) {
        super();
        this.command = kCommand.COMLayerDraw;
        this.save = false;
        this.publish = false;
        this.resource_id = resource_id;
        this.layer_id = layer_id;
    }
}