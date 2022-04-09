import {ILayoutEditorView} from "../../Layer/ILayoutEditorView";
import {Bounds, View} from "mentatjs";
import {Layer} from "../../Layer/Layer";


export interface CanvasEventInfo {
    view: ILayoutEditorView & View;
    layer: Layer;
    layerCalculatedBounds: Bounds;
    parentLayer: Layer;
    parentLayerCalculatedBounds: Bounds;
    canvasViewRef: View;
    mouseEvent: MouseEvent;
}
