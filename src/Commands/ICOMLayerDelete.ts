import {ICommandPayload} from "./ICommandPayload";
import {LayerData} from "../Layer/LayerData";
import {kCommand} from "./kCommand";
import {Session} from "../Session/Session";
import {isDefined, safeCopy} from "mentatjs";
import {Workspace} from "../Document/Workspace";


export class ICOMLayerDelete extends ICommandPayload {

    resource_id: string;
    layer_id: string;
    parent_layer_id: string;
    layer_data: LayerData;

    constructor(resource_id: string, layer_id: string) {
        super();
        this.command = kCommand.COMLayerDelete;
        this.layer_id = layer_id;
        this.resource_id = resource_id;
        let workspace = Session.instance.currentDocument.currentWorkspace;
        if (!isDefined(workspace) || workspace.workspace_guid !== this.resource_id) {
            workspace = Session.instance.currentDocument.findResourceWithId(this.resource_id).data as Workspace;
        }
        let layer = workspace.layersTree.find(layer_id);
        if (layer) {
            this.parent_layer_id = layer.parent_id;
            this.layer_data = safeCopy(layer.data);
        }
    }
}
