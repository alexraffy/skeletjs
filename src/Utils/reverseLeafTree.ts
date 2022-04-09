import {
    Bounds,
    View
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Layer} from "../Layer/Layer";




export interface ReverseLeafTree {
    view: ILayoutEditorView & View;
    layer: Layer;
    layerBounds: Bounds;
    prev?: ReverseLeafTree;
}




