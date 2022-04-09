import {Bounds, Drp, generateV4UUID, isDefined, LayerProperty} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerDropdown extends Drp implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerDropdown";
    exportClassName: "Dropdown";

    isSymbol: boolean = false;

    constructor() {
        super();
    }

    exportProperties(layoutVersion: string): LayerProperty[] {

        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Enabled",
                property_id: "view.enabled",
                group: "property",
                type: "boolean",
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "dataSource",
                property_id: "dropdown.datasource",
                group: "property",
                type: "dataSource",
                value: [ { id: "value1", text: "Option1" }]
            },

        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);

        if (property_id === "dropdown.datasource") {
            this.dataSource = value;
        }
        if (property_id === "view.enabled") {
            this.isEnabled = value;
            if (isDefined(this.dd)) {
                this.dd.disabled = !value;
            }
        }

    }

    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 100, 30);
    }
    layoutEditorLibraryLayer(layer: Layer) {

        let propTint = layer.property("view.tint");
        if (propTint) {
            propTint.value = "kBlueTint";
            layer.setPropertyValue("view.tint", propTint.value);
        }
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        if (exporterID === "Skelet/MentatJS") {
            switch (property.property_id) {
                case "dropdown.datasource":
                    return [{setterName: "dataSource", stringValue: JSON.stringify(this.dataSource) }];
                case "dropdown.selected":
                    return [{setterName: "selectedID", stringValue: `'${this.selectedID}'`}];
            }
        }
        return undefined;
    }


}