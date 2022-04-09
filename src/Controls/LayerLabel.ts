import {
    Application,
    Bounds,
    Fill,
    generateV4UUID, isDefined,
    Label,
    LayerProperty,
    Logging,
    PropertyTextStyle,
    px,
    View
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {SkLogger} from "../Logging/SkLogger";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {applyTextStyleProperties} from "../Layer/applyTextStyleProperties";


export class LayerLabel extends Label implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerLabel";
    exportClassName: "Label";
    isSymbol: boolean = false;

    propertyBindings: any[] = [];

    constructor() {
        super();
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        if (property.property_id === "view.enabled") {
            return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
        }
        if (property.property_id === "label.text") {
            return [{setterName: "text", stringValue: `'${property.value as string}'`}];
        }
        if (property.property_id === "label.fillLineHeight") {
            return [{setterName: "fillLineHeight", stringValue: ((property.value as boolean) === true) ? "true" : "false"}];
        }

        return undefined;
    }




    layoutEditorSupportsDoubleClick(node: Layer) {
        return true;
    }


    layoutEditorEnterEditMode(node: Layer) {
        this.internalLabelEditMode(node, true);
    }

    layoutEditorExitEditMode(node: Layer) {
        this.internalLabelEditMode(node, false);
    }

    internalLabelEditMode(node: Layer, toggle: boolean) {

        // input event
        var keep: any = {
            node: node,
            ptr: this,
        };

        function fn(event) {
            // sanitize the input as it might contain HTML
            let value = event.target.innerText;

            // update the view text
            keep.ptr.text = value;

            // update the node value
            node.setPropertyValue("label.text", value);

            Application.instance.notifyAll(keep.ptr, "noticeUpdatedProperty", {
                node: keep.node,
                property_id: "label.text",
                value: value
            });
        }


        if (toggle === true) {
            // set the label editable and catch input event to update the properties panel
            this.getDiv().contentEditable = true;
            this.getDiv().style.border = '1px dotted rgb(150,150,150)';
            this.getDiv().addEventListener("input", fn);
            this.getDiv().focus();

            // select all the text
            if (window.getSelection && document.createRange) {
                var sel = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(this.getDiv());
                sel.removeAllRanges();
                sel.addRange(range);
            } else if ((document as any).selection && (document.body as any).createTextRange) {
                var textRange = (document.body as any).createTextRange();
                textRange.moveToElementText(this.getDiv());
                textRange.select();
            }

        } else {
            // we're done editing the text
            this.getDiv().style.border = '';
            this.getDiv().contentEditable = false;
            this.getDiv().removeEventListener("input", fn);
        }


    }


    layoutEditorViewWasSelected(node: Layer, isSelected: boolean) {
        if (Logging.enableLogging === true) {
            SkLogger.write("Label.layoutEditorViewWasSelected");
        }
    }

    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 100, 20);
    }

    layoutEditorLibraryLayer(layer: Layer) {
        let propTextStyle = layer.property("label.textStyle");
        if (propTextStyle) {
            (propTextStyle.value as PropertyTextStyle).textAlignment = "center";
            (propTextStyle.value as PropertyTextStyle).size = px(24);
            (propTextStyle.value as PropertyTextStyle).color = new Fill(true, "color", "normal", "rgba(255,255,255,1)");
            layer.setPropertyValue("label.textStyle", (propTextStyle.value));
        }
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);

        if (property_id === "label.text") {
            this.text = value;
        }
        if (property_id === 'label.textStyle') {
            applyTextStyleProperties(this, property_id, value);
        }
        if (property_id === "label.fillLineHeight") {
            let style = this.getDefaultStyle();
            style.textStyle.fillLineHeight = value;
            //this.fillLineHeight = value;
        }
    }

    exportBindableProperties(layoutEditorVersion: string) {
        return [{
            property_id: "label.text",
            dataSource_id: ''
        }];
    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {

        let ret: any[] = [
            ...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Label",
                property_id: "label.text",
                group: "property",
                type: "string",
                value: "Label"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "TextStyle",
                property_id: 'label.textStyle',
                group: "property",
                type: "TextStyle",
                value: new PropertyTextStyle()
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Fill Line Height",
                property_id: "label.fillLineHeight",
                group: "property",
                type: "boolean",
                value: false
            }

        ];
        return ret;
    };

    applyBindings(dataSourceItem: any) {
        for (let i = 0; i < this.propertyBindings.length; i += 1) {
            if (isDefined(this.propertyBindings[i].dataSource_id) && this.propertyBindings[i].dataSource_id.length > 0) {
                let value = "";
                this.applyLayoutProperty(this.propertyBindings[i].property_id, value);
            }
        }
    };



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
            v.text = "&#xf031;";

            v.initView(generateV4UUID() + ".listIcon");
            return v;
        }
        return ret;
    }


}