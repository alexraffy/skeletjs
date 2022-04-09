import {
    Base64,
    Bounds,
    boundsWithPixels,
    CheckBox,
    generateV4UUID, ImageView, isDefined,
    LayerProperty,
    PXBounds,
    ViewStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerCheckBox extends CheckBox implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerCheckBox";
    exportClassName: "CheckBox";
    isSymbol: boolean = false;


    img: ImageView;

    constructor() {
        super();
    }


    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "view.tint":
                return [{setterName: "tint", stringValue: `MentatJS.allTints.${property.value as string}`}];
            case "checkbox.checked":
                return [{setterName: "checked", stringValue: (property.value === true) ? "true" : "false"}];
        }

        return undefined;
    }

    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 20, height: 20});
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
                title: "Tint",
                property_id: "view.tint",
                group: "property",
                type: "dropdown",
                dataSource: { dsID: "view.tints"},
                value: "kGreyBlueTint"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Checked",
                property_id: "checkbox.checked",
                group: "property",
                type: "boolean",
                value: true
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);

        if (property_id === "checkbox.checked") {
            if (this._checkbox !== undefined) {
                this._checkbox.checked = value;
            }
            this.checked = value;
        }
        if (property_id === "view.enabled") {
            this.isEnabled = value;
        }
    }


    viewWasAttached_NO() {

        this._checkbox = document.createElement("input");
        this._checkbox.type = "checkbox";
        this._checkbox.id = this.id + ".chk";
        this._checkbox.style.display = "none";
        this._checkbox.viewRef = this;

        this._checkbox.checked = this.checked;

        this.img = new ImageView();
        this.img.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            let w = 14;
            return {
                x: parentBounds.width / 2 - 14 / 2,
                y: parentBounds.height / 2 - 14 / 2,
                width: 14,
                height: 14,
                unit: "px",
                position: "absolute"
            };
        };
        this.img.imageWidth = 14;
        this.img.imageHeight = 14;
        this.img.initView(this.id + ".img");
        this.attach(this.img);

        if (this.isLayoutEditor === false) {
            this.getDiv().onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.viewRef._checkbox.checked = !this.viewRef._checkbox.checked;
                this.viewRef.checked = this.viewRef._checkbox.checked;
                this.viewRef.isHovering = true;
                this.viewRef.render();
                if (isDefined(this.viewRef.actionDelegate)) {
                    if (isDefined(this.viewRef.actionDelegate[this.viewRef.actionDelegateEventName])) {
                        this.viewRef.actionDelegate[this.viewRef.actionDelegateEventName](this.viewRef, this.viewRef._checkbox.checked);
                    }
                }
            };
            this.getDiv().onmouseover = function (e) {
                e.preventDefault();
                this.viewRef.isHovering = true;
                this.viewRef.render();
            };
            this.getDiv().onmouseout = function (e) {
                e.preventDefault();
                this.viewRef.isHovering = false;
                this.viewRef.render();
            };
        }
        this.render();
    }


}