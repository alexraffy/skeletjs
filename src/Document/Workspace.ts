
import {LayerData} from "../Layer/LayerData";
import {assert, IPoint, isDefined, Point, px} from "mentatjs";
import {WorkspaceData} from "./WorkspaceData";
import {Layer} from "../Layer/Layer";
import {instanceOfWorkspaceData} from "../Guards/instanceOfWorkspaceData";
import {generateLayerTree} from "../Session/history";


export class Workspace {

    get workspace_guid(): string {
        return this.data.workspace_guid;
    }
    get title(): string {
        return this.data.title;
    }
    set title(value: string) {
        this.data.title = value;
    }
    get layers(): LayerData[] {
        return this.data.layers;
    }

    get viewportOrigin(): Point {
        if (!isDefined(this.data.viewport_origin)) {
            this.data.viewport_origin = { x: px(0), y: px(0)} as IPoint;
        }
        return Point.fromStruct(this.data.viewport_origin);
    }


    set viewportOrigin(point: Point) {
        this.data.viewport_origin = point.toJSON();
    }


    private data: WorkspaceData;
    layersTree: Layer;


    constructor(w: WorkspaceData) {
        assert(instanceOfWorkspaceData(w), "Workspace.constructor expects a WorkspaceData as parameter.");
        this.data = w;
        this.layersTree = generateLayerTree(this.layers);
    }

    addPage(title: string, type: string, className: string) {
        let l = Layer.create(title, type, className);
        this.layersTree.adopt(l);
    }

    toJSON(): WorkspaceData {
        let layers = this.layersTree.flatten();
        return {
            workspace_guid: this.workspace_guid,
            title: this.title,
            layers: layers
        } as WorkspaceData;
    }

}