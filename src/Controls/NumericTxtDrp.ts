import {
    Application,
    BorderRadius,
    Bounds,
    Btn,
    Drp,
    Fill,
    generateV4UUID, isDefined, LayerProperty, NumberWithUnit,
    PropertyTextStyle,
    px, SessionEvent,
    TextField,
    ViewStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {getEnvironment} from "../Environment/getEnvironment";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {FontInfo} from "../Loader/Font/FontInfo";
import {Session} from "../Session/Session";


export class NumericTxtDrp extends TextField {

    isTextArea = false;
    isNumeric = true;
    isPassword = false;
    isSearch = false;

    protected up: Btn;
    protected down: Btn;
    protected drp : Drp;
    lastValue: number = 0;
    allowsFloat: boolean = true;
    drpDataSource: {id:string, text: string, [key:string]: any}[] = [];
    selectedID: string = "";




    dropdownWidth: number = 50;


    constructor() {
        super();
        this.fills = [new Fill(true, "color", "normal", "rgba(38, 38, 38, 1.0)")];
        this.fontColor = 'rgba(255,255,255,1.0)';
    }


    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
    }


    getValueWithUnit(): { unit: string, amount: number|undefined} {
        let value: number = 0;
        if (this.allowsFloat) {
            value = parseFloat(this.value);
        } else {
            value = parseInt(this.value);
        }
        let selected = this.drp.getSelectedItem();
        if (selected) {
            if (selected.noValue === true) {
                return {
                    unit: selected.id,
                    amount: undefined
                };
            } else {
                return {
                    unit: selected.id,
                    amount: value
                };
            }
        }
        return {
            unit: '',
            amount: value
        };
    }


    viewWasAttached(): void {
        super.viewWasAttached();


        let drp = new Drp();
        drp.keyValues["NumericTxtDrp"] = this;
        drp.boundsForView = function (parentBounds: Bounds): Bounds {
            let selected = this.getSelectedItem();
            if (isDefined(selected)) {
                if (selected.noValue === true) {
                    let ntd = this.keyValues["NumericTxtDrp"];
                    let b = ntd.getBounds("");
                    return {
                        kind: "Bounds",
                        x: px(0),
                        y: px(0),
                        width: b.width,
                        height: parentBounds.height,
                        unit: 'px',
                        position: 'absolute',
                        rotation: new NumberWithUnit(0, "deg"),
                        elevation: new NumberWithUnit(0, "auto")
                    };
                } else {
                    return {
                        kind: "Bounds",
                        x: px(0),
                        y: px(0),
                        width: px(this.keyValues["NumericTxtDrp"].dropdownWidth),
                        height: parentBounds.height,
                        unit: 'px',
                        position: 'absolute',
                        rotation: new NumberWithUnit(0, "deg"),
                        elevation: new NumberWithUnit(0, "auto")
                    };
                }
            }
            return {
                kind: "Bounds",
                x: px(0),
                y: px(0),
                width: px(this.keyValues["NumericTxtDrp"].dropdownWidth),
                height: parentBounds.height,
                unit: 'px',
                position: "absolute",
                rotation: new NumberWithUnit(0, "deg"),
                elevation: new NumberWithUnit(0, "auto")
            };
        };
        drp.glyphString = "&#xf0d7;";

        drp.styles = Session.instance.theme.dropdownStyle;
        drp.dataSource = this.drpDataSource;
        drp.borderRadius = new BorderRadius(0, 0, 0, 0);
        drp.selectedID = "auto";
        drp.initView(this.id + ".drp");
        this.setRightView(drp);
        this.drp = drp;


        this.drp.setActionDelegate(this, "onUnitChangedByUser");

        this.onUnitChanged();

    }

    onUp() {
        let sValue = this.value;
        if (sValue === "") {
            return;
        }
        let iValue = 0;
        if (this.allowsFloat) {
            iValue = parseFloat(sValue);
            iValue = iValue + 1.0;
        } else {
            iValue = parseInt(sValue);
            iValue = iValue + 1;
        }

        this.setText(iValue.toString());

        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this,this.getValueWithUnit());
        }
    }
    onDown() {
        let sValue = this.value;
        if (sValue === "") {
            return;
        }
        let iValue = 0;
        if (this.allowsFloat) {
            iValue = parseFloat(sValue);
            iValue = iValue - 1.0;
        } else {
            iValue = parseInt(sValue);
            iValue = iValue - 1;
        }
        this.setText(iValue.toString());

        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this,this.getValueWithUnit());
        }
    }
    onUnitChangedByUser() {
        this.onUnitChanged();
        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this,this.getValueWithUnit());
        }
    }

    onUnitChanged() {
        let item = this.drp.getSelectedItem();
        if (isDefined(item) && item.noValue === true) {
            this.setTextValue("");
            this.container.setVisible(false);
            this.leftView.setVisible(false);
            this.doResize();
            this.container.doResize();
            this.leftView.doResize();
            this.rightView.doResize();
            this.drp.doResize();
        } else {
            this.setTextValue(this.lastValue.toString());
            this.container.setVisible(true);
            this.leftView.setVisible(true);
            this.container.doResize();
            this.leftView.doResize();
            this.rightView.doResize();
            this.drp.doResize();
        }
    }


    set(unit: string, size: number | undefined) {
        this.drp.setSelectedItem(unit);

        if (size === undefined) {
            //this.setTextValue("");
        } else {
            //this.setTextValue(size.toString());
            this.lastValue = size;
        }
        this.onUnitChanged();
    }


    onTimeout () {
        clearTimeout(this.timeoutHandle);
        this.value = this.textbox.value;
        if (this.allowsFloat) {
            this.lastValue = parseFloat(this.value);
        } else {
            this.lastValue = parseInt(this.value);
        }
        this.textWasChanged(this.lastValue.toString());

        const event_param = {
            viewController_id: (this.viewController) ? this.viewController.id : "",
            textField_id: this.id
        };
        Application.instance.session_event(SessionEvent.kEvent_User,'TextField.Input', event_param);

        if (this.shouldDisplayAutoComplete) {
            let ds = undefined;
            if (this.delegate === undefined) {
                ds = this.textViewAutoCompleteDataSource(this);
                ds.reindex();
                this.autoCompletePane!.keyValues["lst"].reloadData();
            } else {
                ds = this.delegate.textViewAutoCompleteDataSource(this);
                this.delegate.search = this.value;
                if (this.delegate.dataSourcePayloadForRequest !== undefined) {
                    this.autoCompletePane!.keyValues["lst"].setVisible(false);
                    this.autoCompletePane!.keyValues["pager"].setVisible(false);
                    this.autoCompletePane!.keyValues["loading"].setVisible(true);
                    ds.firstPage();
                }
            }
        }

        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this,this.getValueWithUnit());
        }
    }




}

export class LayerNumericTxtDrp extends NumericTxtDrp implements ILayoutEditorView {
    nodeId: string;
    nodeRef?: Layer;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerNumericTxtDrp";
    exportClassName: "NumericTxtDrp";

    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x, y): Bounds {
        return new Bounds(x, y, 100, 30);

    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Text",
                property_id: 'textField.text',
                group: "property",
                type: "string",
                value: ''
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Placeholder",
                property_id: "textField.placeholder",
                group: "property",
                type: "string",
                value: ''
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Options",
                property_id: "dropdown.datasource",
                group: "property",
                type: "dataSource",
                value: [ { id: "auto", text: "auto", noValue: true },{id:"none", text: "none", noValue: true}, {id:"sep", text: "sep"},{id:"pt",text:"pt"},{id:"px",text:"px"},{id:"%",text:"%"}]
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Default",
                property_id: "dropdown.default",
                group: "property",
                type: "string",
                value: "auto"
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
                title: "Enabled",
                property_id: 'view.enabled',
                group: "property",
                type: "boolean",
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Visible",
                property_id: 'view.visible',
                group: 'property',
                type: 'boolean',
                value: true
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {

        this.viewStyleApplyProperties(property_id, value);

        switch (property_id) {
            case "view.enabled":
                this.isEnabled = value;
                this.setEnabled(value);
                break;
            case "textField.text":
                this.value = value;
                break;
            case "textField.placeholder":
                this.placeholderValue = value;
                break;
            case  "label.textStyle":
                this.getDefaultStyle().textStyle = value;
                let font: FontInfo = getEnvironment().Fonts.rows.find((elem) => {
                    return elem.postscriptName === this.getDefaultStyle().textStyle.weight;
                });
                if (font) {
                    this.fontFamily = font.postscriptName;
                    this.fontWeight = font.weight.toString();
                }
                this.fontSize = this.getDefaultStyle().textStyle.size.amount;
                this.fontColor = this.getDefaultStyle().textStyle.color.value;
                this.textAlignment = this.getDefaultStyle().textStyle.textAlignment;
                this.underline = this.getDefaultStyle().textStyle.decorations.understrike;
                this.strike = this.getDefaultStyle().textStyle.decorations.strike;
                this.kerning = this.getDefaultStyle().textStyle.kerning;

                break;
        }
        // this.render();
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        if (this.isLayoutEditor === true) {
            if (this.textContainer) {
                this.textContainer.keyValues["textbox"].style.pointerEvents = 'none';
            }
        }
    }


}