import {boundsWithPixels, LayerProperty, TreeView} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerTreeView extends TreeView implements ILayoutEditorView {

    nodeId: string;
    nodeRef?: Layer;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerTreeView";
    exportClassName: "TreeView";

    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 100, height: 100});
    }

// Styling for LayoutEditor
    exportProperties(layoutEditorVersion): LayerProperty[] {
        return [...viewStyleProperties(false)];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id, value) {
        this.viewStyleApplyProperties(property_id, value);
    }



}