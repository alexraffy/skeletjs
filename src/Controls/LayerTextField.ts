import {
    Border,
    Bounds, boundsWithPixels,
    Fill,
    generateV4UUID, isDefined,
    LayerProperty,
    PropertyTextStyle,
    TextField, TextFieldFormatters,
    ViewStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {getEnvironment} from "../Environment/getEnvironment";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {FontInfo} from "../Loader/Font/FontInfo";


export class LayerTextField extends TextField implements ILayoutEditorView {

    nodeId: string;
    nodeRef?: Layer;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerTextField";
    exportClassName: "TextField";

    isSymbol: boolean = false;



    constructor() {
        super();
        this.fills = [new Fill(true, "color", "normal", "rgba(38, 38, 38, 1.0)")];
        this.borders = [new Border(true, 2, "solid", "rgba(180, 180, 180, 1.0")];
        this.fontColor = 'rgba(255,255,255,1.0)';
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "view.tint":
                return [{setterName: "tint", stringValue: `MentatJS.alltints.${property.value as string}`}];
            case "textField.text":
                return [{setterName: "value", stringValue: `'${property.value as string}'`}];
            case "textField.placeholder":
                return [{setterName: "placeholderValue", stringValue: `'${property.value as string}'`}];
            case "textField.mode":
                let isTextArea = false;
                let isNumeric = false;
                let isPassword = false;
                let isSearch = false;
                if (property.value === "password") {
                    isPassword = true;
                }
                if (property.value === "numeric") {
                    isNumeric = true;
                }
                if (property.value === "multi") {
                    isTextArea = true;
                }
                if (property.value === "search") {
                    isSearch = true;
                }
                return [
                    {setterName: "isTextArea", stringValue: `${isTextArea}`},
                    {setterName: "isNumeric", stringValue: `${isNumeric}`},
                    {setterName: "isPassword", stringValue: `${isPassword}`},
                    {setterName: "isSearch", stringValue: `${isSearch}`}
                ];
            case "textField.formatter":
                return [{setterName: "formatter", stringValue: (property.value === "") ? 'null' : `MentatJS.alltints.${property.value as string}`}];
            case "textField.flatStyle":
                return [{setterName: "flatStyle", stringValue: `${property.value}`}];

        }

        return undefined;
    }




    layoutEditorPositioning(containerNode: Layer, x, y) {
        return boundsWithPixels({x: x, y: y, width: 100, height: 30});
    }


    layoutEditorLibraryLayer(layer: Layer) {
        let prop = layer.property("textField.text");
        if (isDefined(prop)) {
            prop.value = "Textfield";
        }


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
                title: "Mode",
                property_id: "textField.mode",
                group: "property",
                type: "dropdown",
                dataSource: [
                    {id: "normal", text: "Normal"},
                    {id: "password", text: "Password"},
                    {id: "numeric", text: "Numeric"},
                    {id: "multi", text: "Multilines"},
                    {id: "search", text: "Search"}
                ],
                value: 'normal'
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Formatter",
                property_id: "textField.formatter",
                group: "property",
                type: "dropdown",
                dataSource: {dsID: "textField.formatters"},
                value: ''
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
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Flat Style",
                property_id: "textField.flatStyle",
                group: "style",
                type: "boolean",
                value: false
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
            case "textField.mode":
                this.isTextArea = false;
                this.isNumeric = false;
                this.isPassword = false;
                this.isSearch = false;
                if (value === "password") {
                    this.isPassword = true;
                }
                if (value === "numeric") {
                    this.isNumeric = true;
                }
                if (value === "multi") {
                    this.isTextArea = true;
                }
                if (value === "search") {
                    this.isSearch = true;
                }
                break;
            case "textField.formatter":
                if (value === "") {
                    this.formatter = null;
                } else {
                    this.formatter = TextFieldFormatters[value];
                }
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
            case "textField.flatStyle":
                this.flatStyle = value;
                break;
        }
        //this.render();
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