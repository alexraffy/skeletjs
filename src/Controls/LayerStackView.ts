import {isDefined, LayerProperty, PXBounds, StackView} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {stretchNodeBoundsToAvailableSpace} from "../Layer/stretchNodeBoundsToAvailableSpace";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {LayerView} from "../Layer/LayerView";
import {Layer} from "../Layer/Layer";


export class LayerStackView extends StackView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerStackView";
    exportClassName: "StackView";
    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number, node?: Layer) {
        return stretchNodeBoundsToAvailableSpace(containerNode, node, false);
    }

    exportProperties(layoutVersion): LayerProperty[] {
        return [
            ...viewStyleProperties(false)];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
    }

    render() {
        let i = 0;
        this.detachAllChildren();

        let nbCells = -1;
        if (isDefined(this.delegate)) {
            if (isDefined(this.delegate["stackViewNumberOfRows"])) {
                nbCells = this.delegate["stackViewNumberOfRows"](this);
            }
        }
        if (nbCells === -1) {
            nbCells = this.stackViewNumberOfRows(this);
        }
        for (i = 0; i < nbCells; i += 1) {
            let cell = new LayerView();
            cell.isLayoutEditor = this.isLayoutEditor;
            cell.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    width: parentBounds.width,
                    unit: 'px'
                };
            };
            cell.initView(this.id + ".stackRow" + i);
            this.attach(cell);
        }
    }

}