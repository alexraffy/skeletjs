import {boundsWithPixels, generateV4UUID, LayerProperty, Slider} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerSlider extends Slider implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerSlider";
    exportClassName: "Slider";
    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "slider.min":
                return [{setterName: "min", stringValue: `${property.value as number}`}];
            case "slider.max":
                return [{setterName: "max", stringValue: `${property.value as number}`}];
            case "slider.value":
                return [{setterName: "value", stringValue: `${property.value as number}`}];
            case "slider.thumbtint":
                return [{setterName: "thumbTint", stringValue: `MentatJS.alltints.${property.value as string}`}];
        }

        return undefined;
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 100, height: 20});
    }

    exportProperties(layoutEditorVersion: string): LayerProperty[] {

        return [
            ...viewStyleProperties(false),
            {kind: "LayerProperty",
                id: generateV4UUID(),title: "Min", property_id: 'slider.min', group: "property", type: "number", value: 0},
            {kind: "LayerProperty",
                id: generateV4UUID(),title: "Max", property_id: 'slider.max', group: "property", type: "number", value: 100},
            {kind: "LayerProperty",
                id: generateV4UUID(),title: "Value", property_id: 'slider.value', group: "property", type: "number", value: 50},
            {kind: "LayerProperty",
                id: generateV4UUID(),title: "Thin", property_id: 'slider.thin', group: "property", type: "boolean", value: false},
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Tint",
                property_id: 'view.tint',
                group: "property",
                type: "dropdown",
                dataSource: { dsID: "view.tints"},
                value: "kGreyTint"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Thumb Tint",
                property_id: 'slider.thumbtint',
                group: "property",
                type: "dropdown",
                dataSource: { dsID: "view.tints" },
                value: "kGreyTint"
            },
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);

        if (property_id === "slider.min") {
            this.min = value;
        }
        if (property_id === "slider.max") {
            this.max = value;
        }
        if (property_id === "slider.value") {
            this.value = value;
        }
        if (property_id === "slider.thin") {
            this.thinBar = value;
        }
    }

}