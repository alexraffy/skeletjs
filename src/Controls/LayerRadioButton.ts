import {Bounds, generateV4UUID, LayerProperty, RadioButton} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerRadioButton extends RadioButton implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerRadioButton";
    exportClassName: "RadioButton";
    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "radio.group":
                return [{setterName: "checked", stringValue: `'${property.value as string}'`}];
            case "radio.selected":
                return [{setterName: "isSelected", stringValue: `${property.value}`}];
        }

        return undefined;
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 20, 20);
    }

    layoutEditorLibraryLayer(layer: Layer) {
        layer.setPropertyValue("radio.selected", true);
        layer.setPropertyValue("view.tint", "kBlueTint");
    }

    exportProperties(layoutEditorVersion: string): LayerProperty[] {

        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Enabled",
                property_id: 'view.enabled',
                group: "property",
                type: "boolean",
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Radio Group",
                property_id: 'radio.group',
                group: "property",
                type: "string",
                value: "Group1"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Selected",
                property_id: 'radio.selected',
                group: "property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Tint",
                property_id: 'view.tint',
                group: "property",
                type: "dropdown",
                dataSource: { dsID: "view.tints"},
                value: "kGreyBlueTint"
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;


    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        if (property_id === "radio.selected") {
            this.isSelected = value;
        }
        if (property_id === "radio.group") {
            this.radioGroup = value;
        }
        if (property_id === "view.enabled") {
            this.isEnabled = value;
        }
    }



}


