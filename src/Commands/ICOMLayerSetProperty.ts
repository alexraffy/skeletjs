import {ICommandPayload} from "./ICommandPayload";
import {kCommand} from "./kCommand";
import {Session} from "../Session/Session";
import {isDefined} from "mentatjs";
import {Workspace} from "../Document/Workspace";


export class ICOMLayerSetProperty extends ICommandPayload {

    resource_id: string;
    layer_id: string;
    property_id: string;
    old_property_value: any;
    new_property_value: any;

    constructor(resource_id: string, layer_id: string, property_id: string, value: any) {
        super();
        this.command = kCommand.COMLayerSetProperty;
        this.resource_id = resource_id;
        this.layer_id = layer_id;
        this.property_id = property_id;
        this.new_property_value = value;
        let workspace = Session.instance.currentDocument.currentWorkspace;
        if (!isDefined(workspace)) {
            workspace = Session.instance.currentDocument.findResourceWithId(this.resource_id)?.data as Workspace;
        }
        let layer = workspace?.layersTree.find(this.layer_id);
        let prop = layer?.property(this.property_id);
        this.new_property_value = (prop) ? prop.value : undefined;

    }

}
