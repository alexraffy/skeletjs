import {Bounds, CollectionView, generateV4UUID, LayerProperty} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerCollectionView extends CollectionView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerCollectionView";
    exportClassName: "CollectionView";
    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPositioning(containerNode: any, x: number, y: number): Bounds {
        return new Bounds(x, y, 100, 100);
    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [
            ...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Selection",
                property_id: "listView.selection",
                group: "property",
                type: "dropdown",
                dataSource: [
                    {id: "singleSelection", text: "Single item"},
                    {id: "multiSelection", text: "Multiple items"},
                    {id: "noSelection", text: "No selection"}
                ],
                value: "singleSelection"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Direction",
                property_id: "collectionView.direction",
                group: "property",
                type: "dropdown",
                dataSource: [
                    {id: "vertical", text: "Vertical"},
                    {id: "horizontal", text: "Horizontal"}
                ],
                value: "vertical"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Delegate",
                property_id: 'view.delegate',
                group: "delegate",
                type: "string",
                value: ""
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Datasource",
                property_id: 'listView.datasource',
                group: "property",
                type: "dataSource",
                value: null
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Cell",
                property_id: 'listView.cell',
                group: 'property',
                type: 'symbolSelector',
                value: null,
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Default cell size",
                property_id: 'collectionView.defaultSize',
                group: "delegate",
                type: "function",
                value: function (collectionView, index) {
                    return [64, 64];
                }
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        switch (property_id) {
            case "listView.selection":
                this.singleSelection = false;
                this.noSelection = false;
                if (value === "singleSelection") {
                    this.singleSelection = true;
                }
                if (value === "noSelection") {
                    this.noSelection = true;
                }
                break;
            case "collectionView.direction":
                this.direction = value;
                break;
            case "listView.cell":
                this.itemCellSymbolName = value;
                break;
        }
    }

}