import {
    Application, Border, BorderRadius, Bounds, boundsWithPixels, Color, Fill,
    fillParentBounds, generateV4UUID, isDefined, LayerProperty, NUConvertToPixel,
    Popover, px, PXBounds, safeCopy,
    TextField,
    View, ViewStyle
} from "mentatjs";
import {FillSelectorViewController} from "./FillSelectorViewController";
import {ILayoutEditorView} from "../../Layer/ILayoutEditorView";
import {Layer} from "../../Layer/Layer";
import {SkLogger} from "../../Logging/SkLogger";
import {Session} from "../../Session/Session";

export class ColorPickerWell extends View implements ILayoutEditorView {

    nodeId: string;
    nodeRef: Layer;
    isNodeTitle: boolean = false;
    isLayoutEditor: boolean = false;
    isSymbol: boolean = false;

    pageLayerRef?: Layer;
    layerProperties: LayerProperty[];

    selectedColor: Color = new Color('color', "rgba(255,255,255,1.0)");
    showTextField: boolean = true;
    allowSolidColors: boolean = true;
    allowGradients: boolean = true;

    private textBox: TextField;
    private well: View &
        {
            required_width: number;
            colorPickerDelegate: any;
            popover: Popover;
            color: Color;
            popoverDelegate: any;
            colorPickerDelegateFunctionName: string;
            onColorPicked: (sender, color)=> void;
            onPopoverClosed: (sender, status) => void;
            onColorClicked: () => void;

        };

    exportProperties(layoutVersion: string): LayerProperty[] {
        return [{
            kind: "LayerProperty",
            id: generateV4UUID(),
            title: "Color",
            property_id: "colorpickwell.selectedColor",
            group: "property",
            type: "color",
            value: 'rgba(255,255,255,1)'
        },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Show Textfield",
                property_id: "colorpickwell.showTextfield",
                group: "property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Allow Colors",
                property_id: "colorpickwell.allowSolidColors",
                group: "property",
                type: "boolean",
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Allow Gradients",
                property_id: "colorpickwell.allowGradients",
                group: "property",
                type: "boolean",
                value: true
            },
        ];
    }

    setSelectedColor(color: Color) {
        this.selectedColor = color;
        this.processStyleAndRender("", []);
    }

    applyLayoutProperty(property_id: string, value: any) {
        if (property_id === "colorpickwell.selectedColor") {
            this.selectedColor = value;
        }
        if (property_id === "colorpickwell.showTextfield") {
            this.showTextField = value;
        }
        if (property_id === "colorpickwell.allowSolidColors") {
            this.allowSolidColors = value;
        }
        if (property_id === "colorpickwell.allowGradients") {
            this.allowGradients = value;
        }
    }

    layoutEditorPositioning(container: Layer, x: number, y: number): Bounds {
        return boundsWithPixels({
            x: x,
            y: y,
            width: 30,
            height: 30,
            unit: 'px',
            position: "absolute"
        });
    }


    _colorChanged(sender: any, color: Color) {
        this.selectedColor = color;
        if (this.showTextField === true) {
            this.textBox.setText(color.value);
        }
        if (isDefined(this.actionDelegate)) {
            if (isDefined(this.actionDelegateEventName)) {
                this.actionDelegate[this.actionDelegateEventName](this, color);
            }
        }
    }

    _valueEntered(sender: any) {
        let newVal = sender.value;
        this.well.onColorPicked(sender, {value: newVal});
        if (isDefined(this.actionDelegate)) {
            if (isDefined(this.actionDelegateEventName)) {
                this.actionDelegate[this.actionDelegateEventName](this, newVal);
            }
        }
    }
    render(parentBounds?: Bounds, style?: ViewStyle): void {


       if (!isDefined(this.getDiv())) {
            return;
        }

        this.detachAllChildren();

        super.render(parentBounds, style);

        let textBox = null;
        if (this.showTextField === true) {
            textBox = new TextField();
            textBox.boundsForView = function (parentBounds: Bounds): Bounds {
                return fillParentBounds(parentBounds);
            };
            textBox.value = this.selectedColor.value;
            textBox.initView(this.id + ".textBox");
            this.attach(textBox);
            textBox.setText(this.selectedColor.value);
            if (this.isLayoutEditor !== true) {
                textBox.setActionDelegate(this, "_valueEntered");
            }
        }

        let v : View &
            {
                required_width: number;
                colorPickerDelegate: any;
                popover: Popover;
                color: Color;
                popoverDelegate: any;
                colorPickerDelegateFunctionName: string;
                onColorPicked: (sender, color)=> void;
                onPopoverClosed: (sender, status) => void;
                onColorClicked: () => void;
                allowSolidColors: boolean;
                allowGradients: boolean;

            } = Object.assign(new View(), {
            required_width: 30,
            colorPickerDelegate: this,
            popover: undefined,
            color: this.selectedColor,
            popoverDelegate: undefined,
            colorPickerDelegateFunctionName: '_colorChanged',
            onColorPicked: function (sender, color) {},
            onPopoverClosed: function (sender, status) {},
            onColorClicked: function () {},
            allowSolidColors: this.allowSolidColors,
            allowGradients: this.allowGradients
        });

        //v.fills = [{active: true, blendMode: 'normal', type: this.selectedColor.type, value: this.selectedColor.value}];
        if (this.showTextField === true) {
            v.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    y: 0,
                    width: this.keyValues["required_width"],
                    height: parentBounds.height,
                    unit: "px",
                    position: "absolute"
                };
            };
        } else {
            v.boundsForView = function (parentBounds: Bounds): Bounds {
                return fillParentBounds(parentBounds);
            };
        }
        v.onColorPicked = function (sender, color: Color) {
            "use strict";
            this.getDefaultStyle().fills = [{active: true, blendMode: 'normal', type: color.type, value: color.value}];

            let newFill: Fill;

            if (color.type === 'color') {
                newFill = new Fill(true, "color", 'normal', Color.rgba(color).stringValue);
            }
            if (color.type === 'gradient') {
                SkLogger.write('received gradient ' + Color.gradient(color.gradientData));
                newFill = new Fill(true, 'color', 'normal', Color.gradient(color.gradientData) )
            }


            //this.fills = [{active: true, type: 'cssText', blendMode: 'normal', value: 'background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%);' +
  //                  'background-size: 8px 8px;\n' +
//                    'background-position: 0 0, 0 4px, 4px -4px, -4px 0px;'}, newFill];


            this.getDefaultStyle().fills = [newFill];
            this.color = safeCopy(color);
            this.processStyleAndRender("", []);

            if (isDefined(this.colorPickerDelegate) && isDefined(this.colorPickerDelegateFunctionName)) {
                this.colorPickerDelegate[this.colorPickerDelegateFunctionName](sender, color);
            }

            if (isDefined(this.popoverDelegate)) {
                if (sender !== this.popoverDelegate) {
                    if (isDefined(this.popoverDelegate.vc)) {
                        this.popoverDelegate.vc.colorChangedOutsidePopover(color);
                    }
                }
            }

        };
        v.onPopoverClosed = function (sender, status) {
            this.popover = null;
            this.popoverDelegate = null;
        };
        v.onColorClicked = function () {
            if (isDefined(this.popover)) {
                this.popover.closeWithStatus({});
                this.popover = null;
                this.popoverDelegate = null;
                return;
            }
            this.popover = new Popover();
            this.popover.styles = Session.instance.theme.popoverStyle;
            this.popover.width = px(316); // 210;
            this.popover.height = px(246 + 40); // 246;
            let delegate = {
                vc: null,
                color: this.color,
                colorWell: v,
                popoverRef: this.popover,
                type: this.color.type,
                allowSolidColors: this.allowSolidColors,
                allowGradients: this.allowGradients,
                colorWasPicked: function (sender, value) {
                    "use strict";
                    if (isDefined(this.colorWell)) {
                        this.colorWell.onColorPicked(this, value);
                    }
                },
                viewControllerWasLoadedSuccessfully: function (vc: FillSelectorViewController) {
                    "use strict";
                    vc.popoverRef = this.popoverRef;
                    this.vc = vc;
                    vc.allowSolidColors = this.allowSolidColors;
                    vc.allowGradients = this.allowGradients;
                    vc.currentColor = safeCopy(this.color);
                    vc.lastColor = safeCopy(this.color);


                    this.popoverRef.navigationController.present(vc, {animated: false});
                },


            };
            this.popover.setActionDelegate(this, "onPopoverClosed");
            this.popover.colorPickerDelegate = delegate;
            this.popover.colorPickerDelegateFunctionName = "colorWasPicked";
            this.popover.initPopover("colorPopover", Application.instance.rootView, this);

            this.popoverDelegate = delegate;
            this.popover.navigationController.instantiateViewController("FillSelectorViewController", FillSelectorViewController, delegate);

        };

       //v.fills = [{active: true, type: 'cssText', blendMode: 'normal', value: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)' +
       //         'background-size: 8px 8px;\n' +
       //         'background-position: 0 0, 0 4px, 4px -4px, -4px 0px;'}, new Fill( true, "color", "normal", this.selectedColor.value)];
        v.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', this.selectedColor.value)];
        v.initView(this.id + ".colorPick");
        if (this.showTextField === true) {
            textBox.setLeftView(v);
            this.textBox = textBox;
        } else {
            let bounds = this.getBounds("");
            let w = 10;
            if (isDefined(bounds)) {
                w = NUConvertToPixel(bounds.width).amount / 2;
            }
            v.getDefaultStyle().borderRadius = new BorderRadius(w,w,w,w);
            this.attach(v);
        }
        if (this.isLayoutEditor !== true) {
            v.setClickDelegate(v, "onColorClicked");
        }
        this.well = v;

    }

}