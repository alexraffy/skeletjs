import {IPoint} from "mentatjs";
import {LayerData} from "../Layer/LayerData";


export class WorkspaceData {
    kind: string = "WorkspaceData";
    workspace_guid: string;
    title: string;
    layers: LayerData[];
    viewport_origin: IPoint;

    constructor() {
        this.workspace_guid = "";
        this.title = "";
        this.layers = [];
    }
}
