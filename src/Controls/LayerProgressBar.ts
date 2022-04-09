import {Bounds, LayerProperty, ProgressBar} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerProgressBar extends ProgressBar implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerProgressBar";
    exportClassName: "ProgressBar";
    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 100, 20);
    }

    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [...viewStyleProperties(true),
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
    }

}