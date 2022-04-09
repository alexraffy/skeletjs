import {boundsWithPixels, CanvasView, generateV4UUID, LayerProperty} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerCanvas extends CanvasView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];

    className: "LayerCanvas";
    exportClassName: "CanvasView";


    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 100, height: 100});
    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [
            ...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Shapes",
                property_id: "canvas.shapes",
                group: "hidden_property",
                type: "shapes",
                value: JSON.parse(JSON.stringify([]))
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);

        if (property_id === "canvas.shapes") {
            this.shapes = JSON.parse(JSON.stringify(value));
        }
    }
}