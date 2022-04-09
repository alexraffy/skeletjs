import {Application, generateV4UUID, isDefined, Popover, PXBounds, View} from "mentatjs";
import {Session} from "../Session/Session";


export function colorPickerWell(backgroundColor: string, width: number, delegate: any, delegateEventName: string): View {
    const id = generateV4UUID();
    const v = new View();
    v.keyValues["required_width"] = width;
    //v.keyValues["colorPickerDelegate"] = delegate;
    //v.keyValues["popover"] = null;
    //v.keyValues["color"] = backgroundColor;
    //v.keyValues["popoverDelegate"] = null;
    //v.keyValues["colorPickerDelegateFunctionName"] = delegateEventName;
    v.fills=[{active: true, blendMode: 'normal', type: 'color', value: backgroundColor}];
    v.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: this.keyValues["required_width"],
            height: parentBounds.height!,
            unit: "px",
            position: "absolute"
        };
    };
    v.viewWasAttached = function () {
        this.setClickDelegate(this.keyValues["privDelegate"], "onColorClicked");
    };
    v.initView(id);

    let privDelegate = {
        viewRef: v,
        colorPickerDelegate: delegate,
        colorPickerDelegateFunctionName: delegateEventName,
        popoverDelegate: undefined,
        popover: undefined,
        color: backgroundColor,

        onColorPicked : function (sender, color) {
            "use strict";
            this.viewRef.fills = [{active: true, blendMode: 'normal', type: 'color', value: color.value}];
            this.viewRef.color = color.value;
            this.viewRef.render();

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

        },
        onPopoverClosed : function (sender, status) {
            this.popover = undefined;
            this.popoverDelegate = undefined;
        },
        onColorClicked : function () {
            if (this.popover) {
                this.popover.closeWithStatus({ });
                this.popover = null;
                this.popoverDelegate = null;
                return;
            }
            this.popover = new Popover();
            this.popover.styles = Session.instance.theme.popoverStyle;
            this.popover.width = 316; // 210;
            this.popover.height = 246 + 40; // 246;
            let delegate = {
                vc: null,
                color: this.color,
                colorWell: this.viewRef,
                popoverRef: this.popover,
                colorWasPicked: function (sender, value) {
                    "use strict";
                    if (isDefined(this.colorWell)) {
                        this.colorWell.onColorPicked(this, value);
                    }
                },
                viewControllerWasLoadedSuccessfully: function (vc) {
                    "use strict";
                    vc.popoverRef = this.popoverRef;
                    this.vc = vc;

                    if (this.color.startsWith('rgb')) {
                        let bracketStart = this.color.indexOf('(');
                        let bracketEnd = this.color.indexOf(')',bracketStart);
                        let commaString = this.color.substr(bracketStart +1, bracketEnd - bracketStart - 1);
                        let commaArray = commaString.split(',');
                        let r = 255;
                        let g = 255;
                        let b = 255;
                        let a = 1.0;
                        if ([3,4].includes(commaArray.length)) {
                            r = commaArray[0].trim();
                            g = commaArray[1].trim();
                            b = commaArray[2].trim();
                            a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;
                        }
                        vc.mode = 'rgb';
                        vc.red = r;
                        vc.green = g;
                        vc.blue = b;
                        vc.alpha = a;
                    } else if (this.color.startsWith('hsl')) {
                        let bracketStart = this.color.indexOf('(');
                        let bracketEnd = this.color.indexOf(')',bracketStart);
                        let commaString = this.color.substr(bracketStart +1, bracketEnd - bracketStart - 1);
                        let commaArray = commaString.split(',');
                        let h = 0;
                        let s = 0;
                        let l = 100;
                        let a = 1.0;
                        if ([3,4].includes(commaArray.length)) {
                            h = parseInt(commaArray[0]);
                            s = parseInt(commaArray[1].trim().replace('%', ''));
                            l = parseInt(commaArray[2].trim().replace('%', ''));
                            a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;
                        }
                        vc.mode = 'hsl';
                        vc.alpha = a;
                        vc.hue = h;
                        vc.saturation = s;
                        vc.brightness = l;
                    } else {
                        vc.mode = 'rgb';
                        vc.red = 255;
                        vc.green = 255;
                        vc.blue = 255;
                        vc.alpha = 1.0;
                    }


                    this.popoverRef.navigationController.present(vc, { animated: false });
                },


            };
            this.popover.setActionDelegate(this, "onPopoverClosed");
            this.popover.colorPickerDelegate = delegate;
            this.popover.colorPickerDelegateFunctionName = "colorWasPicked";
            this.popover.initPopover("colorPopover", Application.instance.rootView, this.viewRef);

            this.popoverDelegate = delegate;

            this.popover.navigationController.loadViewController({class: "FillSelectorViewController", id: "FillSelectorViewController"},
                [],
                delegate
            );
        }
    };




    return v;

}