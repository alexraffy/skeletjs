import {ICommandPayload} from "./ICommandPayload";
import {LayerData} from "../Layer/LayerData";
import {kCommand} from "./kCommand";
import {safeCopy} from "mentatjs";


export class ICOMLayerCreate extends ICommandPayload {


    resource_id: string;
    layer_data: LayerData;
    parent_layer_id: string;

    constructor(resource_id: string, layer_data_ref: LayerData, parent_layer_id: string) {
        super();
        this.command = kCommand.COMLayerCreate;
        this.resource_id = resource_id;
        this.layer_data = safeCopy(layer_data_ref);
        this.parent_layer_id = parent_layer_id;
    }

}
