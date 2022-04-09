import {Bounds, generateV4UUID, LayerProperty, Menu} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerMenu extends Menu implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerMenu";
    exportClassName: "Menu";
    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 200, 40);
    }

    exportProperties(layoutVersion: string): LayerProperty[] {

        return [
            ...viewStyleProperties(false),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "dataSource",
                property_id: "dropdown.datasource",
                group: "property",
                type: "dataSource",
                value: [{id: "menu", text: "Menu"}]
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Selected",
                property_id: "dropdown.selected",
                group: "property",
                type: "string",
                value: 'menu'
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Tint",
                property_id: "view.tint",
                group: "property",
                type: "dropdown",
                dataSource: { dsID: "view.tints" },
                value: "kGreyTint"
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        if (property_id === "dropdown.datasource") {
            this.dataSource = value;
        }
        if (property_id === "dropdown.selected") {
            this.selectedId = value.toString();
        }
        if (property_id === "view.enabled") {
            this.isEnabled = value;
        }
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        let eq = " = ";

        if (exporterID === "Skelet/MentatJS") {
            switch (property.property_id) {
                case "dropdown.datasource":
                    return [{setterName: "dataSource", stringValue: JSON.stringify(this.dataSource) }];
                case "dropdown.selected":
                    return [{setterName: "selectedID", stringValue: `'${this.selectedId}'`}];
            }
        }
        return undefined;
    }




}