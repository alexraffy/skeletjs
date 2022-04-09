import {Bounds, FileUpload, LayerProperty, ViewStyle} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerFileUpload extends FileUpload implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerFileUpload";
    exportClassName: "FileUpload";

    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 100, 30);
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id, value) {
        this.viewStyleApplyProperties(property_id, value);

    }


    exportProperties(layoutEditorVersion: string) {

        let ret = [
            ...viewStyleProperties(true)
        ];
        return ret;
    }

    render(parentBounds?: Bounds, style?: ViewStyle): void {
        super.render(parentBounds, style);
        if (this.isLayoutEditor === true) {
            this.fileUpload.style.pointerEvents = 'none';
        }
    }

}