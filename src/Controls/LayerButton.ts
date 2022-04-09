import { viewStyleApplyProperties } from "../Layer/viewStyleApplyProperties";
import {
    Application,
    boundsWithPixels,
    Btn,
    generateV4UUID, isDefined,
    LayerProperty, Logging,
    PropertyTextStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Layer} from "../Layer/Layer";
import { SkLogger } from "../Logging/SkLogger";
import {applyTextStyleProperties} from "../Layer/applyTextStyleProperties";




export class LayerButton extends Btn implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerButton";
    exportClassName: "Button";

    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "view.tint":
                return [{setterName: "tint", stringValue: `MentatJS.allTints.${property.value as string}`}];
            case "button.text":
                return [{setterName: "text", stringValue: `'${property.value as string}'`}];
            case "button.style":
                return [{setterName: "isToggle", stringValue: (property.value === 'toggle') ? "true" : "false"}];
            case "button.group":
                return [{setterName: "buttonGroup", stringValue: `'${property.value as string}'`}];
            case "button.toggled":
                return [{setterName: "isToggled", stringValue: (property.value === true) ? "true" : "false"}];
            case "button.isFullyRound":
                return [{setterName: "isFullyRound", stringValue: (property.value === true) ? "true" : "false"}];
        }

        return undefined;
    }



    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 100, height: 30});
    }

    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        let txtStyle = new PropertyTextStyle();
        txtStyle.textAlignment = 'center';

        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Text",
                property_id: "button.text",
                group: "property",
                type: "string",
                value: "button"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Visible",
                property_id: "view.visible",
                group: "property",
                type: "boolean",
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Style",
                property_id: "button.style",
                group: "property",
                type: "dropdown",
                dataSource: [
                    {
                        id: "push",
                        text: "Push Button"
                    },
                    {
                        id: "toggle",
                        text: "Toggle Button"
                    }
                ],
                value: 'push'
            },
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
                title: "Group",
                property_id: "button.group",
                group: "property",
                type: "string",
                value: ""
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Toggled",
                property_id: "button.toggled",
                group: "property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "TextStyle",
                property_id: "label.textStyle",
                group: "property",
                type: "TextStyle",
                value: txtStyle
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Round",
                property_id: "button.isFullyRound",
                group: "property",
                value: false,
                type: "boolean"
            }

        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        if (property_id === "button.text") {
            this.text = value;
        }
        if (property_id === "view.enabled") {
            this.isEnabled = value;
        }
        if (property_id === "button.style") {
            this.isToggle = (value === "toggle");
            if (this.isToggle === true) {
                Application.instance.registerForNotification("kButtonToggleGroup", this);
            } else {
                Application.instance.deregisterForNotification("kButtonToggleGroup", this.id);
            }
        }
        if (property_id === "button.group") {
            this.buttonGroup = value;
        }
        if (property_id === "button.toggled") {
            this.isToggled = value;
            if (value === true) {
                Application.instance.notifyAll(this, "kButtonToggleGroup", this.buttonGroup);
            }
        }


        if (property_id === "label.textStyle") {
            applyTextStyleProperties(this, property_id, value);
        }

        if (property_id === "button.isFullyRound") {
            this.isFullyRound = value;
        }


    }

    layoutEditorSupportsDoubleClick(node: Layer) {
        return true;
    }

    layoutEditorEnterEditMode(node: Layer) {
        this.internalButtonEditMode(node, true);
    }

    layoutEditorExitEditMode(node: Layer) {
        this.internalButtonEditMode(node, false);
    }

    internalButtonEditMode(node: Layer, toggle: boolean) {

        // input event
        var keep = {
            node: node,
            ptr: this,
        };
        function fn (event) {
            let value = event.target.innerText;
            let textProperty = node.property("button.text");
            textProperty.value = value;
            keep.ptr.text = textProperty.value;
            node.setPropertyValue("button.text", textProperty.value);
            Application.instance.notifyAll(keep.ptr, "noticeUpdatedProperty", { node: keep.node, property_id: "button.text", value: value});
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
            this.getDiv().contentEditable = false;
            this.getDiv().removeEventListener("input", fn);
            this.render();
        }


    }


    protected kButtonToggleGroup(sender: any, buttonGroup: string) {
        if (this.buttonGroup === "") {
            return;
        }
        if (this.id !== sender.id) {
            if ((sender.isToggled === true) && (buttonGroup === this.buttonGroup)) {
                if (this.isToggled === true) {
                    this.setToggled(false);
                    if (this.isLayoutEditor === true) {
                        this.applyLayoutProperty("Toggled", false);
                        this.render();
                    }
                }
            }
        }
    }



    protected onEnableStatusChanged(e: boolean) {
        if (e === false) {
            this.isEnabled=false;
            if (isDefined(this._div)) {
                this._div.onclick = null;
            }
            this.render();
        } else {
            this.isEnabled = true;
            if (!isDefined(this.isLayoutEditor) || this.isLayoutEditor === false) {
                if (isDefined(this._div)) {
                    this._div.onclick = function (e) {
                        if (Logging.enableLogging === true) {
                            SkLogger.write('+CLICK ' + this.viewRef.id);
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        if (isDefined(this.viewRef)) {
                            this.viewRef._onClick();
                        }
                        return false;
                    };
                }
            }
            this.render();
        }
    }


    viewWasAttached() {
        this.isHovering = false;

        // this.setToggled(this.isToggled);

        this.getDiv().viewRef = this;
        if (this.isLayoutEditor === false) {
            if (this.isEnabled === true) {
                this._div.onclick = function (e) {
                    if (Logging.enableLogging === true) {
                        SkLogger.write('+CLICK ' + this.viewRef.id);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    if (isDefined(this.viewRef)) {
                        this.viewRef._onClick();
                    }
                    e.cancelBubble = true;
                    return false;
                };
                this._div.onmouseover = function (e) {
                    this.style.cursor = 'pointer';
                    if (isDefined(this.viewRef)) {
                        this.viewRef.isHovering = true;
                        this.viewRef.render();
                    }
                };
                this._div.onmouseout = function (e) {
                    this.style.cursor = '';
                    if (isDefined(this.viewRef)) {
                        this.viewRef.isHovering = false;
                        this.viewRef.render();
                    }
                };
            }
        }
    }







}



