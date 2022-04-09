import {Bounds, LayerProperty, View} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Layer} from "../Layer/Layer";


export interface SelectedLayerInfo {
    view: ILayoutEditorView & View;
    layer: Layer;
    layerCalculatedBounds: Bounds;
    layerAbsoluteBounds: Bounds;
    parentLayer: Layer;
    parentLayerCalculatedBounds: Bounds;
    pageLayer: Layer;
    pageLayerView: ILayoutEditorView & View;
    properties: LayerProperty[]
}

