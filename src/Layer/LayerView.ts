import {Bounds, generateV4UUID, isDefined, Label, LayerProperty, View} from "mentatjs";
import {ILayoutEditorView} from "./ILayoutEditorView";
import {Layer} from "./Layer";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import { viewStyleApplyProperties } from "./viewStyleApplyProperties";


export class LayerView extends View implements ILayoutEditorView {
    nodeId: string = "";
    nodeRef: Layer;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    nodeType: string;
    isNodeTitle: boolean = false;
    isLayoutEditor: boolean = false;
    isSymbol: boolean = false;

    className: "LayerView";
    exportClassName: "View";

    layoutEditorSupportsDoubleClick(node: any):boolean {
        return false;
    }

    layoutEditorPositioning(containerNode: any, x: number, y: number): Bounds {
        return new Bounds(x,y,100,100);
    }

    exportProperties(layoutEditorVersion: string) {
        return JSON.parse(JSON.stringify([...viewStyleProperties(false)]));
    }

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        if (property.property_id === "view.enabled") {
            return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
        }
        return undefined;
    }


    layoutEditorViewWasSelected(node: Layer, isSelected: boolean) {

    }

    layoutEditorViewForSubNode(node: Layer, subNode: Layer): ILayoutEditorView & View | undefined {
        return undefined;
    }

    layoutEditorListIcon(): (layer: Layer, bounds: Bounds)=>View {
        let ret = (layer: Layer, bounds: Bounds): View => {
            let v = new Label();
            v.boundsForView = function (parentBounds: Bounds): Bounds {
                return this.keyValues["Bounds"];
            }
            v.keyValues["Layer"] = layer;
            v.keyValues["Bounds"] = bounds;
            v.fillLineHeight = true;
            v.textAlignment = 'center';
            v.fontSize = 12;
            v.fontWeight = '300';
            v.fontColor = "rgb(160,160,170)";
            v.fontFamily = 'FontAwesome5ProRegular, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            v.fills = [];
            if (!isDefined(layer)) {
                v.text = "&#xf5cb;";
            } else {
                if (layer.isPage === true) {
                    v.text = "&#xf5fd;";
                } else {
                    v.text = "&#xf5cb;";
                }
            }
            v.initView(generateV4UUID() + ".listIcon");
            return v;
        }
        return ret;
    }

    layoutEditorIsDropTarget(): boolean {
        return true;
    }

    layoutEditorCanHaveChildren(): boolean {
        return true;
    }

}