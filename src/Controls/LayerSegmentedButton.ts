import {
    boundsWithPixels,
    generateV4UUID,
    LayerProperty,
    PropertyTextStyle,
    SegmentedButton
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {applyTextStyleProperties} from "../Layer/applyTextStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerSegmentedButton extends SegmentedButton implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerSegmentedButton";
    exportClassName: "SegmentedButton";
    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 160, height: 30});
    }

    layoutEditorLibraryLayer(layer: Layer) {
        layer.setPropertyValue("view.tint", "kGreyBlueTint");
    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {

        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Segments",
                property_id: 'segmentedButton.segments',
                group: "property",
                type: "dataSource",
                value: [
                    {id: "segment1", text: "Segment 1", isEnabled: true}, {
                        id: "segment2",
                        text: "Segment 2",
                        isEnabled: true
                    }
                ]
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Selected",
                property_id: 'segmentedButton.selected',
                group: "property",
                type: "string",
                value: "segment1"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Tint",
                property_id: 'view.tint',
                group: "property",
                type: "dropdown",
                dataSource: { dsID: "view.tints" },
                value: "kGreyTint"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "TextStyle",
                property_id: "label.textStyle",
                group: "property",
                type: "TextStyle",
                value: new PropertyTextStyle()
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Borderless",
                property_id: 'button.borderless',
                group: "style",
                type: "boolean",
                value: false
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        switch (property_id) {
            case "segmentedButton.segments":
                this.clear();
                this.addButtons(value);
                break;
            case "segmentedButton.selected":
                this.setCurrent(value);
                break;
            case "button.borderless":
                this.noBorder = value;
                break;

            case "label.textStyle":
                applyTextStyleProperties(this, property_id, value);
                break;
        }
    }

}