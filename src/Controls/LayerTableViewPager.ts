import {boundsWithPixels, generateV4UUID, LayerProperty, TableViewPager} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerTableViewPager extends TableViewPager implements ILayoutEditorView {

    nodeId: string;
    nodeRef?: Layer;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerTableViewPager";
    exportClassName: "TableViewPager";

    isSymbol: boolean = false;

    constructor() {
        super();
    }



    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 300, height: 40});
    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [
            ...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Delegate",
                property_id: "tableViewPager.delegate",
                group: "delegate",
                type: "string",
                value: ""
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Datasource",
                property_id: "tableViewPager.datasource",
                group: "delegate",
                type: "dataSource",
                value: null
            }
        ];
    }


    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        switch (property_id) {
            case "tableViewPager.datasource":
                this.bindDataSource(value);
                break;
        }
    }


}