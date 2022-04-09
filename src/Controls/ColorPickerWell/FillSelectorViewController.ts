import {GradientPane} from "./GradientPane";
import {ASE_CMYK} from "../../Loader/ColorPalette/ASE_CMYK";
import {
    Application, Border,
    Bounds,
    cmyk2rgb, CollectionItem, CollectionView,
    CollectionViewDelegate, Color, DataSource,
    Fill, fillParentBounds,
    generateV4UUID,
    GradientData, isDefined,
    lab2rgb, Menu, Popover, PXBounds, rgb2hex,
    safeCopy, TextField, View, ViewController
} from "mentatjs";
import {GradientColor, GradientColorDelegate} from "./GradientColor";
import {SolidColorPane} from "./SolidColorPane";
import {ASE_LAB} from "../../Loader/ColorPalette/ASE_LAB";
import {ASE_RGB} from "../../Loader/ColorPalette/ASE_RGB";
import {SkLogger} from "../../Logging/SkLogger";
import {kNotifications} from "../../Session/kNotifications";
import {ASE_GRAY} from "../../Loader/ColorPalette/ASE_GRAY";
import {ColorBookPane} from "./ColorBookPane";
import {Drp} from "mentatjs";
import {ColorBookInfo} from "../../Loader/ColorPalette/ColorBookInfo";
import {getEnvironment} from "../../Environment/getEnvironment";
import {Layer} from "../../Layer/Layer";
import {ASE_GRADIENT} from "../../Loader/ColorPalette/ASE_GRADIENT";
import {Session} from "../../Session/Session";


export class FillSelectorViewController extends ViewController implements GradientColorDelegate, CollectionViewDelegate {

    popoverRef: Popover;

    view: View & { menu: Menu; colorBookPane: ColorBookPane, solidPane: SolidColorPane, gradientPane: GradientPane };

    colorPickerDelegate: any;
    colorPickerDelegateFunctionName: string;

    allowColorBook: boolean = false;
    allowSolidColors: boolean = true;
    allowGradients: boolean = true;
    allowAddToPalette: boolean = true;

    currentColor: Color;
    lastColor: Color;

    gradientCurrentStep: number = 0;

    selectedBook: ColorBookInfo = undefined;


    viewForViewController() {
        let v: View & { menu: Menu; colorBookPane: ColorBookPane, solidPane: SolidColorPane, gradientPane: GradientPane } = Object.assign(new View(), { menu: undefined, colorBookPane: undefined, solidPane: undefined, gradientPane: undefined });
        v.boundsForView = function (parentBounds: Bounds): Bounds {
            return fillParentBounds(parentBounds);
        };
        v.viewWasAttached = () => {
            let menu = new Menu();
            menu.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    y: 0,
                    width: parentBounds.width,
                    height: 40,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            menu.dataSource = [{"id":"book", text: "Book"},{id: "solid", text: "Solid"}, {id: "gradient", text: "Gradient"}];
            menu.selectedId = "solid";
            //menu.fills = [{active: true, type: 'color', blendMode: 'normal', value: '#F5F3F3'}];
            menu.initView(v.id + ".menu");
            v.attach(menu);
            v.menu = menu;
            menu.setActionDelegate(this, "onFillTypeChanged");

            let colorBookPane = new ColorBookPane();
            colorBookPane.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    y: 40,
                    width: parentBounds.width,
                    height: parentBounds.height - 40,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            colorBookPane.initView(v.id + ".colorBook");
            v.attach(colorBookPane);
            v.colorBookPane = colorBookPane;


            let solidPane = new SolidColorPane();
            solidPane.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    y: 40,
                    width: parentBounds.width,
                    height: parentBounds.height - 40,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            solidPane.initView(v.id + ".solid");
            v.attach(solidPane);
            v.solidPane = solidPane;

            let gradientPane = new GradientPane();
            gradientPane.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    y: 40,
                    width: parentBounds.width,
                    height: parentBounds.height - 40,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            gradientPane.initView(v.id + ".gradientPane");
            v.attach(gradientPane);
            v.gradientPane = gradientPane;
            v.gradientPane.setVisible(false);

        };
        return v;
        // return new MentatJS.LayoutEditor.View.SolidColorPane();
    }

    viewControllerWillBeDestroyed(): void {
        Application.instance.deregisterForNotification(kNotifications.noticeListSwatchesResult, this.id);
        Application.instance.deregisterForNotification(kNotifications.noticeSwatchInfo, this.id);
        Application.instance.deregisterForNotification(kNotifications.noticeSwatchColorSelected, this.id);

    }

    viewWasPresented() {

        this.view.menu.dataSource = [];

        if (this.allowColorBook) {
            this.view.menu.dataSource.push({id: "book", text: "Book"});
        }

        if (this.allowSolidColors) {
            this.view.menu.dataSource.push({id: "solid", text: "Solid"});
        }
        if (this.allowGradients) {
            this.view.menu.dataSource.push({id: "gradient", text: "Gradient"});
        }

        if (this.allowAddToPalette === false) {
            this.view.solidPane.btnAddToPalette.setVisible(false);
            this.view.gradientPane.btnAddToPalette.setVisible(false);
        } else {
            this.view.solidPane.btnAddToPalette.setActionDelegate({
                onClick: () => {
                    let c = this.currentColor;
                    if (c.type === "color") {
                        switch (c.colorData.mode) {
                            case "hsla":
                            case "rgba": {
                                let crgb = Color.rgba(c);
                                let ret_rgb: ASE_RGB = {
                                    name: crgb.stringValue,
                                    type: "RGB",
                                    color: {
                                        model: "RGB",
                                        type: "normal",
                                        r: crgb.r / 255.0,
                                        g: crgb.g / 255.0,
                                        b: crgb.b / 255.0,
                                        alpha: crgb.a,
                                        hex: rgb2hex(crgb.stringValue)
                                    }
                                }
                                let swatches = Session.instance.currentDocument.swatches;
                                if (swatches.length > 0) {
                                    (swatches[0].data as ColorBookInfo).records.push(ret_rgb);
                                }
                            }
                                break;
                            case "cmyka": {
                                let ccmyka = Color.cmyka(c);
                                let ret_cmyk: ASE_CMYK = {
                                    name: ccmyka.stringValue,
                                    type: "CMYK",
                                    color: {
                                        model: "CMYK",
                                        type: "normal",
                                        c: ccmyka.c / 100.0,
                                        m: ccmyka.m / 100.0,
                                        y: ccmyka.y / 100.0,
                                        k: ccmyka.k / 100.0,
                                        alpha: ccmyka.a,
                                    }
                                }
                                let swatches = Session.instance.currentDocument.swatches;
                                if (swatches.length > 0) {
                                    (swatches[0].data as ColorBookInfo).records.push(ret_cmyk);
                                }
                            }
                                break;
                        }

                    }
                    Application.instance.notifyAll(this, kNotifications.noticeSwatchColorAdded);
                }
            }, "onClick");

            this.view.gradientPane.btnAddToPalette.setActionDelegate({
                onClick: () => {
                    let ret: ASE_GRADIENT = {
                        type: "gradient",
                        name: "gradient",
                        gradient: this.currentColor.value
                    };
                    let swatches = Session.instance.currentDocument.swatches;
                    if (swatches.length > 0) {
                        (swatches[0].data as ColorBookInfo).records.push(ret);
                    }
                    Application.instance.notifyAll(this, kNotifications.noticeSwatchColorAdded);
                }
            }, "onClick");
        }


        this.view.menu.render();

        let bk = "background: linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%);" +
            "background: linear-gradient(to bottom, transparent 0%, #000 100%);" +
            "background-color:red;";

        let spectrumbk = "background: -moz-linear-gradient(left, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);" +
            "background: -ms-linear-gradient(left, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);" +
            "background: -o-linear-gradient(left, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);" +
            "background: -webkit-gradient(linear, left top, right top, from(#ff0000), color-stop(0.17, #ffff00), color-stop(0.33, #00ff00), color-stop(0.5, #00ffff), color-stop(0.67, #0000ff), color-stop(0.83, #ff00ff), to(#ff0000));" +
            "background: -webkit-linear-gradient(left, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);" +
            "background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);";


        this.view.solidPane.solidPicker_HSL.sliderSpectrum.fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: spectrumbk
        }];


       // this.view.solidPane.sliderOpacity.setActionDelegate(this, "onOpacityChanged");
       // this.view.solidPane.txtOpacity.setActionDelegate(this, "onOpacityTextValueChanged");

        this.view.solidPane.solidPicker_HSL.sliderSpectrum.render();
        this.view.solidPane.solidPicker_HSL.sliderSpectrum.setActionDelegate(this, "onSpectrumChanged");
        this.view.solidPane.solidPicker_HSL.sliderSaturation.setActionDelegate(this, "onSaturationChanged");
        this.view.solidPane.solidPicker_HSL.sliderBrightness.setActionDelegate(this, "onBrightnessChanged");

        this.view.solidPane.solidPicker_HSL.txtHue.setActionDelegate(this, "onSpectrumTextValueChanged");
        this.view.solidPane.solidPicker_HSL.txtSaturation.setActionDelegate(this, "onSaturationTextValueChanged");
        this.view.solidPane.solidPicker_HSL.txtBrightness.setActionDelegate(this, "onBrightnessTextValueChanged");


        this.view.solidPane.solidPicker_RGB.sliderRed.setActionDelegate(this, "onRedChanged");
        this.view.solidPane.solidPicker_RGB.sliderGreen.setActionDelegate(this, "onGreenChanged");
        this.view.solidPane.solidPicker_RGB.sliderBlue.setActionDelegate(this, "onBlueChanged");

        this.view.solidPane.solidPicker_RGB.txtRed.setActionDelegate(this, "onRedTextValueChanged");
        this.view.solidPane.solidPicker_RGB.txtGreen.setActionDelegate(this, "onGreenTextValueChanged");
        this.view.solidPane.solidPicker_RGB.txtBlue.setActionDelegate(this, "onBlueTextValueChanged");


        this.view.solidPane.solidPicker_CMYK.sliderCyan.setActionDelegate(this, "onCyanChanged");
        this.view.solidPane.solidPicker_CMYK.sliderMagenta.setActionDelegate(this, "onMagentaChanged");
        this.view.solidPane.solidPicker_CMYK.sliderYellow.setActionDelegate(this, "onYellowChanged");
        this.view.solidPane.solidPicker_CMYK.sliderKey.setActionDelegate(this, "onKeyChanged");

        this.view.solidPane.solidPicker_CMYK.txtCyan.setActionDelegate(this, "onCyanTextValueChanged");
        this.view.solidPane.solidPicker_CMYK.txtMagenta.setActionDelegate(this, "onMagentaTextValueChanged");
        this.view.solidPane.solidPicker_CMYK.txtYellow.setActionDelegate(this, "onYellowTextValueChanged");
        this.view.solidPane.solidPicker_CMYK.txtKey.setActionDelegate(this, "onKeyTextValueChanged");

        this.view.solidPane.mode.setActionDelegate(this, "onModeChanged");

        this.view.solidPane.solidPicker_HSL.currentColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.rgba(this.currentColor).stringValue)];
        this.view.solidPane.solidPicker_HSL.lastColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.rgba(this.lastColor).stringValue)];
        this.view.solidPane.solidPicker_RGB.currentColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.rgba(this.currentColor).stringValue)];
        this.view.solidPane.solidPicker_RGB.lastColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.rgba(this.lastColor).stringValue)];
        this.view.solidPane.solidPicker_CMYK.currentColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.cmyka(this.currentColor).stringValue)];
        this.view.solidPane.solidPicker_CMYK.lastColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.cmyka(this.lastColor).stringValue)];

        this.view.solidPane.solidPicker_HSL.currentColor.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_HSL.lastColor.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_RGB.currentColor.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_RGB.lastColor.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_CMYK.currentColor.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_CMYK.lastColor.processStyleAndRender("", []);

        this.view.solidPane.solidPicker_HSL.currentColor.setClickDelegate(this, "sendCurrentColor");
        this.view.solidPane.solidPicker_RGB.currentColor.setClickDelegate(this, "sendCurrentColor");
        this.view.solidPane.solidPicker_CMYK.currentColor.setClickDelegate(this, "sendCurrentColor");
        this.view.solidPane.solidPicker_HSL.lastColor.setClickDelegate(this, 'sendPreviousColor');
        this.view.solidPane.solidPicker_RGB.lastColor.setClickDelegate(this, "sendPreviousColor");
        this.view.solidPane.solidPicker_CMYK.lastColor.setClickDelegate(this, "sendPreviousColor");

        this.view.solidPane.solidPicker_HSL.txtString.setActionDelegate(this, "onUserPastedAColor");
        this.view.solidPane.solidPicker_RGB.txtString.setActionDelegate(this, "onUserPastedAColor");
        this.view.solidPane.solidPicker_CMYK.txtString.setActionDelegate(this, "onUserPastedAColor");


        this.view.gradientPane.gradDirection.angle = this.currentColor.gradientData.directionAngle;
        this.view.gradientPane.gradDirection.processStyleAndRender("", []);
        this.view.gradientPane.txtAngle.setText(this.currentColor.gradientData.directionAngle.toString());
        this.view.gradientPane.gradDirection.setActionDelegate(this, "onGradientAngleChanged");
        this.view.gradientPane.txtAngle.setActionDelegate(this, "onGradientAngleTextValueChanged");
        this.view.gradientPane.txtColor.setActionDelegate(this, "onGradientStepColorChanged");
        this.view.gradientPane.frmGradientEditor.delegate = this;
        this.view.gradientPane.txtOffsetX.setActionDelegate(this, "onGradientStepPercentageChanged");
        this.view.gradientPane.gradMode.setActionDelegate(this, "onGradientModeChanged");
        this.view.gradientPane.drpShape.setActionDelegate(this, "onGradientShapeChanged");
        this.view.gradientPane.txtOriginX.setActionDelegate(this, "onGradientOriginChanged");
        this.view.gradientPane.txtOriginY.setActionDelegate(this, "onGradientOriginChanged");

        if (this.currentColor.type === 'color') {
            if (this.currentColor.colorData.mode === 'hsla') {
                this.view.solidPane.mode.setSelectedItem('hsl');
                this.view.solidPane.solidPicker_HSL.setVisible(true);
                this.view.solidPane.solidPicker_RGB.setVisible(false);
                this.view.solidPane.solidPicker_CMYK.setVisible(false);
                this.view.solidPane.solidPicker_CSS.setVisible(false);
            }
            if (this.currentColor.colorData.mode === "rgba") {
                this.view.solidPane.mode.setSelectedItem('rgb');
                this.view.solidPane.solidPicker_HSL.setVisible(false);
                this.view.solidPane.solidPicker_RGB.setVisible(true);
                this.view.solidPane.solidPicker_CMYK.setVisible(false);
                this.view.solidPane.solidPicker_CSS.setVisible(false);
            }
            if (this.currentColor.colorData.mode === "cmyka") {
                this.view.solidPane.mode.setSelectedItem('cmyk');
                this.view.solidPane.solidPicker_HSL.setVisible(false);
                this.view.solidPane.solidPicker_RGB.setVisible(false);
                this.view.solidPane.solidPicker_CMYK.setVisible(true);
                this.view.solidPane.solidPicker_CSS.setVisible(false);
            }
            this.updateRGB();
            this.updateHSL();
            this.updateCMYK();




        }

        if (this.currentColor.type === 'gradient') {
            this.view.gradientPane.drpShape.setSelectedItem(this.currentColor.gradientData.shape);
            this.view.gradientPane.txtOriginX.setText(this.currentColor.gradientData.originX.toString());
            this.view.gradientPane.txtOriginY.setText(this.currentColor.gradientData.originY.toString());
            this.view.menu.selectedId = 'gradient';
            this.view.menu.processStyleAndRender("", []);
            this.onFillTypeChanged(this, 'gradient');

        }


        Application.instance.registerForNotification(kNotifications.noticeListSwatchesResult, this);
        Application.instance.registerForNotification(kNotifications.noticeSwatchInfoResult, this);
        Application.instance.registerForNotification(kNotifications.noticeSwatchColorSelected, this);

        Application.instance.notifyAll(this, kNotifications.noticeListSwatches);
    }

    noticeSwatchColorSelected(sender, color: Color) {
        this.currentColor = color;
        if (color.type === "color") {
            this.onFillTypeChanged(this, 'solid');
            this.updateRGB();
            this.updateHSL();
            this.updateCMYK();
            if (this.currentColor.colorData.mode === 'hsla') {
                this.view.solidPane.mode.setSelectedItem('hsl');
            } else if (this.currentColor.colorData.mode === "rgba") {
                this.view.solidPane.mode.setSelectedItem('rgb');
            } else if (this.currentColor.colorData.mode === "cmyka") {
                this.view.solidPane.mode.setSelectedItem('cmyk');
            }

            this.onModeChanged(this);
            this.sendColor();
        } else {
            this.onFillTypeChanged(this, 'gradient');
            this.sendColor();
        }
    }


    onUserPastedAColor(sender: View) {
        let value = (<TextField>sender).value;
        let newColor = new Color('color', '');
        if (value.startsWith('hsl') || value.startsWith('rgb') || value.startsWith('cmyk')) {
            if (Color.processColor(newColor, value)) {
                this.currentColor = newColor;
                this.currentColor.value = value;
                this.onFillTypeChanged(this, 'solid');
                this.updateRGB();
                this.updateHSL();
                this.updateCMYK();
                if (this.currentColor.colorData.mode === 'hsla') {
                    this.view.solidPane.mode.setSelectedItem('hsl');
                } else if (this.currentColor.colorData.mode === "rgba") {
                    this.view.solidPane.mode.setSelectedItem('rgb');
                } else if (this.currentColor.colorData.mode === "cmyka") {
                    this.view.solidPane.mode.setSelectedItem('cmyk');
                }
                this.onModeChanged(this);
            }
        } else if (value.startsWith('linear') || value.startsWith('radial')) {
            if (Color.processGradient(newColor, value)) {
                this.currentColor = newColor;
                this.currentColor.value = value;
                this.onFillTypeChanged(this, 'gradient');
            }
        }



    }

    onFillTypeChanged(sender, selectedId) {
        if (selectedId === "book") {
            this.view.colorBookPane.setVisible(true);
            this.view.solidPane.setVisible(false);
            this.view.gradientPane.setVisible(false);

            this.view.colorBookPane.drp.dataSource = [{id: "document", text: "Document"}];
            for (let i = 0; i < getEnvironment().SwatchesList.length; i += 1) {
                this.view.colorBookPane.drp.dataSource.push({ id: getEnvironment().SwatchesList[i].id, text: getEnvironment().SwatchesList[i].text});
            }

            this.view.colorBookPane.drp.processStyleAndRender("", []);
            this.view.colorBookPane.drp.setActionDelegate(this, "onColorBookSelectionChanged");
            this.view.colorBookPane.drp.setSelectedItem("document");

            this.view.colorBookPane.collection.delegate = this;
            this.view.colorBookPane.collection.dataSource = new DataSource();
            this.view.colorBookPane.collection.dataSource.initWithData({rows: []});
            this.view.colorBookPane.collection.reloadData();

            this.onColorBookSelectionChanged(this.view.colorBookPane.drp);



        }

        if (selectedId === 'solid') {
            this.view.colorBookPane.setVisible(false);
            this.view.solidPane.setVisible(true);
            this.view.gradientPane.setVisible(false);
            if (this.currentColor.type === 'gradient') {
                // rebuild the color
                Color.updateColor(this.currentColor, 'alpha');
                if (this.currentColor.colorData.mode === "hsla") {
                    this.view.solidPane.mode.setSelectedItem('hsl');
                }
                if (this.currentColor.colorData.mode === "rgba") {
                    this.view.solidPane.mode.setSelectedItem('rgb');
                }
                if (this.currentColor.colorData.mode === "cmyka") {
                    this.view.solidPane.mode.setSelectedItem('cmyk');
                }

                // this.view.solidPane.mode.setCurrent(this.currentColor.colorData.mode === 'hsla' ? 'hsl' : 'rgb');
                this.onModeChanged(this);
            }

            this.currentColor.type = 'color';
            if (this.currentColor.colorData.mode === "hsla") {
                this.updateHSL();
            } else if (this.currentColor.colorData.mode === "rgba") {
                this.updateRGB();
            } else if (this.currentColor.colorData.mode === "cmyka") {
                this.updateCMYK();
            }
            this.sendColor();
        }
        if (selectedId === 'gradient') {
            this.currentColor.type = 'gradient';
            let secondColor = 'rgba(0,0,0,1.0)';
            if (this.currentColor.colorData.mode === 'hsla') {
                secondColor = 'hsla(0, 0%, 0%, 1.0)';
            } else if (this.currentColor.colorData.mode === 'rgba') {
                secondColor = 'rgba(0,0,0,1)';
            } else if (this.currentColor.colorData.mode === 'cmyka') {
                secondColor = 'cmyka(0,0,0,0,1)';
            }

            if (this.currentColor.gradientData.steps.length === 0) {
                this.currentColor.gradientData.directionAngle = 0;
                this.currentColor.gradientData.steps.push({
                    id: generateV4UUID(),
                    color: new Color("color", secondColor), percentage: 0
                });
                this.currentColor.gradientData.steps.push({
                    id: generateV4UUID(),
                    color: new Color("color", Color.rgba(this.currentColor).stringValue), percentage: 100
                })
                this.currentColor.gradientData.shape = 'ellipse';
                this.currentColor.gradientData.originX = 50;
                this.currentColor.gradientData.originY = 50;
            }
            this.gradientCurrentStep = 0;
            this.view.gradientPane.frmGradientEditor.gradientData = this.currentColor.gradientData;
            this.view.colorBookPane.setVisible(false);
            this.view.solidPane.setVisible(false);
            this.view.gradientPane.setVisible(true);
            this.view.gradientPane.gradMode.setCurrent(this.currentColor.gradientData.type);
            this.view.gradientPane.frmGradientEditor.processStyleAndRender("", []);
            this.onGradientModeChanged();
            this.onGradientStepChanged();
            this.sendGradient();
        }
    }


        onOpacityChanged() {
            //this.currentColor.colorData.alpha = this.view.solidPane.sliderOpacity.value / 100.0;
            Color.updateColor(this.currentColor, 'alpha');
            //this.view.solidPane.txtOpacity.setText(this.view.solidPane.sliderOpacity.value.toString());
            this.redrawRGB();
            this.redrawHSL();
            this.redrawCMYK();
            this.sendColor();
        }
/*
        onOpacityTextValueChanged() {
            let str = this.view.solidPane.txtOpacity.value;
            let val: number = parseInt(str);
            if (val < 0) {
                val = 0;
            }
            if (val > 100) {
                val = 100;
            }
            this.view.solidPane.txtOpacity.setText(val.toString());
            this.currentColor.colorData.alpha = val / 100.00;
            this.view.solidPane.sliderOpacity.setValue(val);
            Color.updateColor(this.currentColor, "alpha");

            this.redrawRGB();
            this.redrawHSL();
            this.sendColor();
        }

     */

    colorChangedOutsidePopover(color) {
        this.currentColor = safeCopy(color);
        if (this.currentColor.colorData.mode === 'hsla') {
            this.view.solidPane.mode.setSelectedItem('hsl');
            this.updateHSL();
            this.view.solidPane.solidPicker_HSL.setVisible(true);
            this.view.solidPane.solidPicker_RGB.setVisible(false);
            this.view.solidPane.solidPicker_CMYK.setVisible(false);
            this.view.solidPane.solidPicker_CSS.setVisible(false);
        }
        if (this.currentColor.colorData.mode === "rgba") {
            this.view.solidPane.mode.setSelectedItem('rgb');
            this.updateRGB();
            this.view.solidPane.solidPicker_HSL.setVisible(false);
            this.view.solidPane.solidPicker_RGB.setVisible(true);
            this.view.solidPane.solidPicker_CMYK.setVisible(false);
            this.view.solidPane.solidPicker_CSS.setVisible(false);
        }
        if (this.currentColor.colorData.mode === "cmyka") {
            this.view.solidPane.mode.setSelectedItem('cmyk');
            this.updateCMYK();
            this.view.solidPane.solidPicker_HSL.setVisible(false);
            this.view.solidPane.solidPicker_RGB.setVisible(false);
            this.view.solidPane.solidPicker_CMYK.setVisible(true);
            this.view.solidPane.solidPicker_CSS.setVisible(false);
        }
    }


    onModeChanged(sender) {
        let value = this.view.solidPane.mode.selectedID;
        if (value === 'hsl') {
            if (this.currentColor.colorData.mode !== 'hsla') {
                this.updateHSL();
            }
            this.currentColor.colorData.mode = 'hsla';
            this.view.solidPane.solidPicker_HSL.setVisible(true);
            this.view.solidPane.solidPicker_RGB.setVisible(false);
            this.view.solidPane.solidPicker_CMYK.setVisible(false);
            this.view.solidPane.solidPicker_CSS.setVisible(false);
            this.redrawHSL();
        }
        if (value === 'rgb') {
            if (this.currentColor.colorData.mode !== 'rgba') {
                this.updateRGB();
            }
            this.currentColor.colorData.mode = 'rgba';
            this.view.solidPane.solidPicker_HSL.setVisible(false);
            this.view.solidPane.solidPicker_RGB.setVisible(true);
            this.view.solidPane.solidPicker_CMYK.setVisible(false);
            this.view.solidPane.solidPicker_CSS.setVisible(false);
            this.redrawRGB();
        }
        if (value === 'cmyk') {
            if (this.currentColor.colorData.mode !== 'cmyka') {
                this.updateCMYK();
            }
            this.currentColor.colorData.mode = 'cmyka';
            this.view.solidPane.solidPicker_HSL.setVisible(false);
            this.view.solidPane.solidPicker_RGB.setVisible(false);
            this.view.solidPane.solidPicker_CMYK.setVisible(true);
            this.view.solidPane.solidPicker_CSS.setVisible(false);
            this.redrawCMYK();
        }

    }

    onGradientChanged(sender, gradientInfo) {
        this.currentColor.gradientData = gradientInfo;
        this.sendGradient();
    }


    onGradientModeChanged() {
        if (this.view.gradientPane.gradMode.selectedID === 'linear') {
            this.currentColor.gradientData.type = 'linear';
            this.view.gradientPane.gradDirection.setVisible(true);
            this.view.gradientPane.txtAngle.setVisible(true);
            this.view.gradientPane.drpShape.setVisible(false);
            this.view.gradientPane.txtOriginX.setVisible(false);
            this.view.gradientPane.txtOriginY.setVisible(false);
            this.view.gradientPane.lblAngle.setText('Angle');

        } else {
            this.currentColor.gradientData.type = 'radial';
            this.view.gradientPane.gradDirection.setVisible(false);
            this.view.gradientPane.txtAngle.setVisible(false);
            this.view.gradientPane.drpShape.setVisible(true);
            this.view.gradientPane.txtOriginX.setVisible(true);
            this.view.gradientPane.txtOriginY.setVisible(true);
            this.view.gradientPane.lblAngle.setText('Shape');
            if (['circle', 'ellipse'].includes(this.currentColor.gradientData.shape)) {
                this.view.gradientPane.txtOriginX.setEnabled(false);
                this.view.gradientPane.txtOriginY.setEnabled(false);
            } else {
                this.view.gradientPane.txtOriginX.setEnabled(true);
                this.view.gradientPane.txtOriginY.setEnabled(true);
            }
        }
        this.view.gradientPane.drpShape.setSelectedItem(this.currentColor.gradientData.shape);
        this.view.gradientPane.txtOriginX.setText(this.currentColor.gradientData.originX.toString());
        this.view.gradientPane.txtOriginY.setText(this.currentColor.gradientData.originY.toString());
        Color.updateColor(this.currentColor, 'type');
        this.sendGradient();
    }

    onGradientShapeChanged() {
        this.currentColor.gradientData.shape = this.view.gradientPane.drpShape.getSelectedItem().id;
        if (['circle', 'ellipse'].includes(this.currentColor.gradientData.shape)) {
            this.view.gradientPane.txtOriginX.setEnabled(false);
            this.view.gradientPane.txtOriginY.setEnabled(false);
        } else {
            this.view.gradientPane.txtOriginX.setEnabled(true);
            this.view.gradientPane.txtOriginY.setEnabled(true);
        }

        Color.updateColor(this.currentColor, 'type');
        this.sendGradient();
    }

    onGradientOriginChanged() {
        try {
            this.currentColor.gradientData.originX = parseInt(this.view.gradientPane.txtOriginX.value);
            this.currentColor.gradientData.originY = parseInt(this.view.gradientPane.txtOriginY.value);
            this.view.gradientPane.txtOriginX.setText(this.currentColor.gradientData.originX.toString());
            this.view.gradientPane.txtOriginY.setText(this.currentColor.gradientData.originY.toString());

        } catch (_) {

        }
        Color.updateColor(this.currentColor, 'type');
        this.sendGradient();
    }


    onGradientStepChanged() {
        this.view.gradientPane.txtColor.setSelectedColor(this.currentColor.gradientData.steps[this.gradientCurrentStep].color);
        this.view.gradientPane.txtOffsetX.setText(this.currentColor.gradientData.steps[this.gradientCurrentStep].percentage.toString());
        Color.updateColor(this.currentColor, 'type');
        this.sendGradient();
    }

    onGradientStepColorChanged(sender, color: Color) {
        this.currentColor.gradientData.steps[this.gradientCurrentStep].color = color;
        this.onGradientStepChanged();
        this.view.gradientPane.frmGradientEditor.gradientData = this.currentColor.gradientData;
        this.view.gradientPane.frmGradientEditor.render();
        this.sendGradient();
    }

    gradientColorStepHasChanged(gradientColor: GradientColor, gradientData: GradientData, stepIndex: number) {
        this.currentColor.gradientData = gradientData;
        this.gradientCurrentStep = stepIndex;
        this.onGradientStepChanged();
        this.sendGradient();
    }
    gradientColorStepWasSelected(gradientColor: GradientColor, gradientData: GradientData, stepIndex: number) {
        this.currentColor.gradientData = gradientData;
        this.gradientCurrentStep = stepIndex;
        this.onGradientStepChanged();
        this.sendGradient();
    }
    onGradientAngleChanged(sender, angle) {
        this.currentColor.gradientData.directionAngle = angle;
        this.view.gradientPane.txtAngle.setText(angle.toString());
        this.sendGradient();
    }
    onGradientAngleTextValueChanged(sender) {
        let sAngle = this.view.gradientPane.txtAngle.value;
        let angle = parseInt(sAngle);
        this.view.gradientPane.gradDirection.angle = angle;
        this.view.gradientPane.gradDirection.processStyleAndRender("", []);
        this.currentColor.gradientData.directionAngle = angle;
        Color.updateColor(this.currentColor, 'type');
        this.sendGradient();
    }
    onGradientStepPercentageChanged(sender) {
        let val = this.view.gradientPane.txtOffsetX.value;
        let perc = parseInt(val);
        this.currentColor.gradientData.steps[this.gradientCurrentStep].percentage = perc;
        this.onGradientStepChanged();
        this.view.gradientPane.frmGradientEditor.gradientData = this.currentColor.gradientData;
        this.view.gradientPane.frmGradientEditor.processStyleAndRender("", []);
        this.sendGradient();


    }


    sendGradient() {
        if (isDefined(this.popoverRef)) {
            if (isDefined((this.popoverRef as any).colorPickerDelegate)) {
                (this.popoverRef as any).colorPickerDelegate[(this.popoverRef as any).colorPickerDelegateFunctionName](this, safeCopy(this.currentColor));
            }
        }
    }

    sendColor() {
        if (isDefined(this.popoverRef)) {
            if (isDefined((this.popoverRef as any).colorPickerDelegate)) {
                (this.popoverRef as any).colorPickerDelegate[(this.popoverRef as any).colorPickerDelegateFunctionName](this, safeCopy(this.currentColor));
            }
        }
    }

    sendCurrentColor() {
        if (isDefined(this.popoverRef)) {
            if (isDefined((this.popoverRef as any).colorPickerDelegate)) {
                (this.popoverRef as any).colorPickerDelegate[(this.popoverRef as any).colorPickerDelegateFunctionName](this, safeCopy(this.currentColor));
            }
            this.popoverRef.closeWithStatus({valid: true});
        }
    }
    sendPreviousColor() {
        if (isDefined(this.popoverRef)) {
            if (isDefined((this.popoverRef as any).colorPickerDelegate)) {
                (this.popoverRef as any).colorPickerDelegate[(this.popoverRef as any).colorPickerDelegateFunctionName](this, safeCopy(this.lastColor));
            }
            this.popoverRef.closeWithStatus({valid: true});
        }
    }



    updateHSL() {
        this.view.solidPane.solidPicker_HSL.sliderSpectrum.setValue(this.currentColor.colorData.hue);
        this.view.solidPane.solidPicker_HSL.sliderSaturation.setValue(this.currentColor.colorData.saturation);
        this.view.solidPane.solidPicker_HSL.sliderBrightness.setValue(this.currentColor.colorData.lightness);
        this.view.solidPane.solidPicker_HSL.txtHue.setText(this.currentColor.colorData.hue.toString());
        this.view.solidPane.solidPicker_HSL.txtSaturation.setText(this.currentColor.colorData.saturation.toString());
        this.view.solidPane.solidPicker_HSL.txtBrightness.setText(this.currentColor.colorData.lightness.toString());
        //this.view.solidPane.sliderOpacity.setValue(this.currentColor.colorData.alpha * 100);
        //this.view.solidPane.txtOpacity.setText((this.currentColor.colorData.alpha*100).toString());
        this.redrawHSL();
    }

    redrawHSL() {
        let saturation = "background: linear-gradient(to right, hsl(" + this.currentColor.colorData.hue + ", 0%, " + this.currentColor.colorData.lightness + "%) 0%, hsl(" + this.currentColor.colorData.hue + ", 100%, " + this.currentColor.colorData.lightness + "%) 100%);";
        let lightness = "background: linear-gradient(to right, hsl(" + this.currentColor.colorData.hue + ", " + this.currentColor.colorData.saturation + "%, 0%) 0%, hsl(" + this.currentColor.colorData.hue + ", " + this.currentColor.colorData.saturation + "%, 100%) 100%);";

        let alpha = 'background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%);' +
            'background-size: 8px 8px;\n' +
            'background-position: 0 0, 0 4px, 4px -4px, -4px 0px;';
        alpha += "background: linear-gradient(to right, hsla(" + this.currentColor.colorData.hue + ", " + this.currentColor.colorData.saturation + "%, " + this.currentColor.colorData.lightness + "%, 0.0) 0%, hsla(" + this.currentColor.colorData.hue + ", "+ this.currentColor.colorData.saturation +"%, " + this.currentColor.colorData.lightness + "%, 1.0) 100%);";
        this.view.solidPane.solidPicker_HSL.sliderSaturation.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: saturation
        }];
        this.view.solidPane.solidPicker_HSL.sliderBrightness.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: lightness
        }];
        /*
        this.view.solidPane.sliderOpacity.fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: alpha
        }];
         */

        this.view.solidPane.solidPicker_HSL.sliderSaturation.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_HSL.sliderBrightness.processStyleAndRender("", []);
        // this.view.solidPane.sliderOpacity.render();

        this.view.solidPane.solidPicker_HSL.currentColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', this.currentColor.value)];
        this.view.solidPane.solidPicker_HSL.currentColor.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_HSL.txtString.setText(this.currentColor.value);
    }


    updateCMYK() {
        this.view.solidPane.solidPicker_CMYK.sliderCyan.setValue(this.currentColor.colorData.cyan);
        this.view.solidPane.solidPicker_CMYK.sliderMagenta.setValue(this.currentColor.colorData.magenta);
        this.view.solidPane.solidPicker_CMYK.sliderYellow.setValue(this.currentColor.colorData.yellow);
        this.view.solidPane.solidPicker_CMYK.sliderKey.setValue(this.currentColor.colorData.key);
        this.view.solidPane.solidPicker_CMYK.txtCyan.setText(this.currentColor.colorData.cyan.toString());
        this.view.solidPane.solidPicker_CMYK.txtMagenta.setText(this.currentColor.colorData.magenta.toString());
        this.view.solidPane.solidPicker_CMYK.txtYellow.setText(this.currentColor.colorData.yellow.toString());
        this.view.solidPane.solidPicker_CMYK.txtKey.setText(this.currentColor.colorData.key.toString());
        this.redrawCMYK();
    }
    redrawCMYK() {
        let c = this.currentColor.colorData.cyan;
        let m = this.currentColor.colorData.magenta;
        let y = this.currentColor.colorData.yellow;
        let k = this.currentColor.colorData.key;

        let cyanStart = Color.rgba(Color.fromString(`device-cmyk(0%, ${m}%, ${y}%, ${k}%)`));
        let cyanEnd = Color.rgba(Color.fromString(`device-cmyk(100%, ${m}%, ${y}%, ${k}%)`));

        let magentaStart = Color.rgba(Color.fromString(`device-cmyk(${c}%, 0%, ${y}%, ${k}%)`));
        let magentaEnd = Color.rgba(Color.fromString(`device-cmyk(${c}%, 100%, ${y}%, ${k}%)`));

        let yellowStart = Color.rgba(Color.fromString(`device-cmyk(${c}%, ${m}%, 0%, ${k}%)`));
        let yellowEnd = Color.rgba(Color.fromString(`device-cmyk(${c}%, ${m}%, 100%, ${k}%)`));

        let keyStart = Color.rgba(Color.fromString(`device-cmyk(${c}%, ${m}%, ${y}%, 0%)`));
        let keyEnd = Color.rgba(Color.fromString(`device-cmyk(${c}%, ${m}%, ${y}%, 100%)`));

        let cyan = `background: linear-gradient(to right, ${cyanStart.stringValue} 0%, ${cyanEnd.stringValue} 100%);`;
        let magenta = `background: linear-gradient(to right, ${magentaStart.stringValue} 0%, ${magentaEnd.stringValue} 100%);`;
        let yellow = `background: linear-gradient(to right, ${yellowStart.stringValue} 0%, ${yellowEnd.stringValue} 100%);`;
        let key = `background: linear-gradient(to right, ${keyStart.stringValue} 0%, ${keyEnd.stringValue} 100%);`;

        this.view.solidPane.solidPicker_CMYK.sliderCyan.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: cyan
        }];
        this.view.solidPane.solidPicker_CMYK.sliderMagenta.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: magenta
        }];
        this.view.solidPane.solidPicker_CMYK.sliderYellow.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: yellow
        }];
        this.view.solidPane.solidPicker_CMYK.sliderKey.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: key
        }];

        this.view.solidPane.solidPicker_CMYK.sliderCyan.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_CMYK.sliderMagenta.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_CMYK.sliderYellow.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_CMYK.sliderKey.processStyleAndRender("", []);
        //this.view.solidPane.sliderOpacity.render();

        this.view.solidPane.solidPicker_CMYK.currentColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', Color.rgba(this.currentColor).stringValue)];
        this.view.solidPane.solidPicker_CMYK.currentColor.processStyleAndRender("", []);

        this.view.solidPane.solidPicker_CMYK.txtString.setText(this.currentColor.value);

    }



    updateRGB() {
        this.view.solidPane.solidPicker_RGB.sliderRed.setValue(this.currentColor.colorData.red);
        this.view.solidPane.solidPicker_RGB.sliderGreen.setValue(this.currentColor.colorData.green);
        this.view.solidPane.solidPicker_RGB.sliderBlue.setValue(this.currentColor.colorData.blue);
        this.view.solidPane.solidPicker_RGB.txtRed.setText(this.currentColor.colorData.red.toString());
        this.view.solidPane.solidPicker_RGB.txtGreen.setText(this.currentColor.colorData.green.toString());
        this.view.solidPane.solidPicker_RGB.txtBlue.setText(this.currentColor.colorData.blue.toString());
        //this.view.solidPane.sliderOpacity.setValue(this.currentColor.colorData.alpha * 100);
        //this.view.solidPane.txtOpacity.setText((this.currentColor.colorData.alpha*100).toString());
        this.redrawRGB();
    }

    redrawRGB() {
        let r = "background: linear-gradient(to right, rgb(0, " + this.currentColor.colorData.green + ", " + this.currentColor.colorData.blue + ") 0%, rgb(255, " + this.currentColor.colorData.green + ", " + this.currentColor.colorData.blue + ") 100%);";
        let g = "background: linear-gradient(to right, rgb(" + this.currentColor.colorData.red + ", 0, " + this.currentColor.colorData.blue + ") 0%, rgb(" + this.currentColor.colorData.red + ", 255, " + this.currentColor.colorData.blue + ") 100%);";
        let b = "background: linear-gradient(to right, rgb(" + this.currentColor.colorData.red + ", " + this.currentColor.colorData.green + ", 0) 0%, rgb(" + this.currentColor.colorData.red + ", " + this.currentColor.colorData.green + ", 255) 100%);";
        let a = 'background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%);' +
            'background-size: 8px 8px;\n' +
            'background-position: 0 0, 0 4px, 4px -4px, -4px 0px;';
        a += "background: linear-gradient(to right, rgba(" + this.currentColor.colorData.red + ", " + this.currentColor.colorData.green + ", " + this.currentColor.colorData.blue + ", 0.0) 0%, rgba(" + this.currentColor.colorData.red + ", " + this.currentColor.colorData.green + ", " + this.currentColor.colorData.blue + ", 1.0) 100%);";
        this.view.solidPane.solidPicker_RGB.sliderRed.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: r
        }];
        this.view.solidPane.solidPicker_RGB.sliderGreen.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: g
        }];
        this.view.solidPane.solidPicker_RGB.sliderBlue.getDefaultStyle().fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: b
        }];
        /*
        this.view.solidPane.sliderOpacity.fills = [{
            active: true,
            type: 'cssText',
            blendMode: 'normal',
            value: a
        }];
         */

        this.view.solidPane.solidPicker_RGB.sliderRed.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_RGB.sliderGreen.processStyleAndRender("", []);
        this.view.solidPane.solidPicker_RGB.sliderBlue.processStyleAndRender("", []);
        //this.view.solidPane.sliderOpacity.render();

        this.view.solidPane.solidPicker_RGB.currentColor.getDefaultStyle().fills = [new Fill(true, 'color', 'normal', this.currentColor.value)];
        this.view.solidPane.solidPicker_RGB.currentColor.processStyleAndRender("", []);

        this.view.solidPane.solidPicker_RGB.txtString.setText(this.currentColor.value);
    }


    onSpectrumChanged(sender) {
        let value = this.view.solidPane.solidPicker_HSL.sliderSpectrum.value;
        this.view.solidPane.solidPicker_HSL.txtHue.setText(value.toString());
        this.currentColor.colorData.hue = value;
        Color.updateColor(this.currentColor, 'hue');
        this.sendColor();
        this.redrawHSL();

    }
    onSpectrumTextValueChanged(sender) {
        let stringValue: string = this.view.solidPane.solidPicker_HSL.txtHue.value;

        this.currentColor.colorData.hue = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'hue');
        this.view.solidPane.solidPicker_HSL.sliderSpectrum.setValue(this.currentColor.colorData.hue);
        this.sendColor();
        this.redrawHSL();

    }

    onSaturationChanged(sender) {
        let value = this.view.solidPane.solidPicker_HSL.sliderSaturation.value;
        this.view.solidPane.solidPicker_HSL.txtSaturation.setText(value.toString());
        this.currentColor.colorData.saturation = value;
        Color.updateColor(this.currentColor, 'saturation');
        this.sendColor();
        this.redrawHSL();
    }
    onSaturationTextValueChanged(sender) {
        let stringValue: string = this.view.solidPane.solidPicker_HSL.txtSaturation.value;
        this.currentColor.colorData.saturation = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'saturation');
        this.view.solidPane.solidPicker_HSL.sliderSaturation.setValue(this.currentColor.colorData.saturation);
        this.sendColor();
        this.redrawHSL();
    }

    onBrightnessChanged(sender) {
        let value = this.view.solidPane.solidPicker_HSL.sliderBrightness.value;
        this.view.solidPane.solidPicker_HSL.txtBrightness.setText(value.toString());
        this.currentColor.colorData.lightness = value;
        Color.updateColor(this.currentColor, "lightness");
        this.sendColor();
        this.redrawHSL();
    }
    onBrightnessTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_HSL.txtBrightness.value;
        this.currentColor.colorData.lightness = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'lightness');
        this.view.solidPane.solidPicker_HSL.sliderBrightness.setValue(this.currentColor.colorData.lightness);
        this.sendColor();
        this.redrawHSL();
    }

    onCyanChanged(sender) {
        let value = this.view.solidPane.solidPicker_CMYK.sliderCyan.value;
        this.view.solidPane.solidPicker_CMYK.txtCyan.setText(value.toString());
        this.currentColor.colorData.cyan = value;
        Color.updateColor(this.currentColor, 'cyan');
        this.sendColor();
        this.redrawCMYK();
    }
    onCyanTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_CMYK.txtCyan.value;
        this.currentColor.colorData.cyan = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'cyan');
        this.view.solidPane.solidPicker_CMYK.sliderCyan.setValue(this.currentColor.colorData.cyan);
        this.sendColor();
        this.redrawCMYK();
    }

    onMagentaChanged(sender) {
        let value = this.view.solidPane.solidPicker_CMYK.sliderMagenta.value;
        this.view.solidPane.solidPicker_CMYK.txtMagenta.setText(value.toString());
        this.currentColor.colorData.magenta = value;
        Color.updateColor(this.currentColor, 'magenta');
        this.sendColor();
        this.redrawCMYK();
    }
    onMagentaTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_CMYK.txtMagenta.value;
        this.currentColor.colorData.magenta = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'magenta');
        this.view.solidPane.solidPicker_CMYK.sliderMagenta.setValue(this.currentColor.colorData.magenta);
        this.sendColor();
        this.redrawCMYK();
    }

    onYellowChanged(sender) {
        let value = this.view.solidPane.solidPicker_CMYK.sliderYellow.value;
        this.view.solidPane.solidPicker_CMYK.txtYellow.setText(value.toString());
        this.currentColor.colorData.yellow = value;
        Color.updateColor(this.currentColor, 'yellow');
        this.sendColor();
        this.redrawCMYK();
    }
    onYellowTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_CMYK.txtYellow.value;
        this.currentColor.colorData.yellow = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'yellow');
        this.view.solidPane.solidPicker_CMYK.sliderCyan.setValue(this.currentColor.colorData.yellow);
        this.sendColor();
        this.redrawCMYK();
    }

    onKeyChanged(sender) {
        let value = this.view.solidPane.solidPicker_CMYK.sliderKey.value;
        this.view.solidPane.solidPicker_CMYK.txtKey.setText(value.toString());
        this.currentColor.colorData.key = value;
        Color.updateColor(this.currentColor, 'key');
        this.sendColor();
        this.redrawCMYK();
    }
    onKeyTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_CMYK.txtKey.value;
        this.currentColor.colorData.key = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'key');
        this.view.solidPane.solidPicker_CMYK.sliderKey.setValue(this.currentColor.colorData.key);
        this.sendColor();
        this.redrawCMYK();
    }


    onRedChanged(sender) {
        let value = this.view.solidPane.solidPicker_RGB.sliderRed.value;
        this.view.solidPane.solidPicker_RGB.txtRed.setText(value.toString());
        this.currentColor.colorData.red = value;
        Color.updateColor(this.currentColor, 'red');
        this.sendColor();
        this.redrawRGB();
    }
    onRedTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_RGB.txtRed.value;
        this.currentColor.colorData.red = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'red');
        this.view.solidPane.solidPicker_RGB.sliderRed.setValue(this.currentColor.colorData.red);
        this.sendColor();
        this.redrawRGB();
    }

    onGreenChanged(sender) {
        let value = this.view.solidPane.solidPicker_RGB.sliderGreen.value;
        this.view.solidPane.solidPicker_RGB.txtGreen.setText(value.toString());
        this.currentColor.colorData.green = value;
        Color.updateColor(this.currentColor, 'green');
        this.sendColor();
        this.redrawRGB();
    }
    onGreenTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_RGB.txtGreen.value;
        this.currentColor.colorData.green = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'green');
        this.view.solidPane.solidPicker_RGB.sliderGreen.setValue(this.currentColor.colorData.green);
        this.sendColor();
        this.redrawRGB();
    }

    onBlueChanged(sender) {
        let value = this.view.solidPane.solidPicker_RGB.sliderBlue.value;
        this.view.solidPane.solidPicker_RGB.txtBlue.setText(value.toString());
        this.currentColor.colorData.blue = value;
        Color.updateColor(this.currentColor, 'blue');
        this.sendColor();
        this.redrawRGB();
    }
    onBlueTextValueChanged(sender) {
        let stringValue = this.view.solidPane.solidPicker_RGB.txtBlue.value;
        this.currentColor.colorData.blue = parseInt(stringValue);
        Color.updateColor(this.currentColor, 'blue');
        this.view.solidPane.solidPicker_RGB.sliderBlue.setValue(this.currentColor.colorData.blue);
        this.sendColor();
        this.redrawRGB();
    }

    onColorBookSelectionChanged(sender) {
        let data: string[] = [];
        let ds: (ASE_RGB | ASE_CMYK | ASE_GRAY | ASE_LAB)[] = [];
        if ( (sender as Drp).selectedID === "document") {

            let documentBook: ColorBookInfo = {
                id: 'document',
                filename: '',
                title: 'document',
                acbInfo: undefined,
                aseInfo: undefined,
                pageSize: 7,
                type: "ASE",
                records: []
            };

            function addFillColor(base: Layer, data: string[], documentBook: ColorBookInfo) {
                if (isDefined(base)) {
                    let fills = base.property("view.fills");
                    if (isDefined(fills) && isDefined(fills.value) && isDefined(fills.value.length)) {
                        for (let i = 0; i < fills.value.length; i += 1) {
                            if (data.indexOf((fills.value[i] as Fill).value) === -1) {
                                data.push((fills.value[i] as Fill).value);
                                let c = Color.fromString((fills.value[i] as Fill).value);
                                if (c.type === "color") {
                                    if (c.colorData.mode === "rgba") {
                                        ds.push({
                                            type: 'color',
                                            name: (fills.value[i] as Fill).value,
                                            color: {
                                                model: 'RGB',
                                                r: c.colorData.red / 255.00,
                                                g: c.colorData.green / 255.00,
                                                b: c.colorData.blue / 255.00,
                                                alpha: 1.0,
                                                hex: "",
                                                type: "normal"
                                            }
                                        });
                                        documentBook.records.push({
                                            type: "color",
                                            name: (fills.value[i] as Fill).value,
                                            color: {
                                                model: 'RGB',
                                                r: c.colorData.red / 255.00,
                                                g: c.colorData.green / 255.00,
                                                b: c.colorData.blue / 255.00,
                                                alpha: 1.0,
                                                hex: "",
                                                type: "normal"
                                            }
                                        });
                                    }
                                }

                            }
                        }
                    }
                    if (isDefined(base.children)) {
                        for (let x = 0; x < base.children.length; x += 1) {
                            addFillColor(base.children[x], data, documentBook);
                        }
                    }
                }
            }
            for (let i = 0; i < Session.instance.currentDocument.resources.length; i += 1) {
                let r = Session.instance.currentDocument.resources[i];
                if (r.id === Session.instance.currentDocument.currentOpenedFileID) {
                    let w = Session.instance.currentDocument.currentWorkspace;
                    for (let x = 0; x < w.layersTree.children.length; x += 1) {
                        addFillColor(w.layersTree.children[x], data, documentBook);
                    }
                }

            }

            this.selectedBook = documentBook;

            this.view.colorBookPane.collection.delegate = this;
            this.view.colorBookPane.collection.dataSource = new DataSource();
            this.view.colorBookPane.collection.dataSource.initWithData({rows: ds});
            this.view.colorBookPane.collection.reloadData();

        } else {

            this.view.colorBookPane.collection.delegate = this;
            this.view.colorBookPane.collection.dataSource = new DataSource();
            this.view.colorBookPane.collection.dataSource.initWithData({rows: []});
            this.view.colorBookPane.collection.reloadData();
            setTimeout(() => {
                Application.instance.notifyAll(this, kNotifications.noticeSwatchInfo, {filename: (sender as Drp).selectedID});
            }, 100);
        }



    }

    noticeListSwatchesResult(sender, swatchesList) {
        this.view.colorBookPane.drp.dataSource = [{id: "document", text: "Document"}];
        for (let i = 0; i < getEnvironment().SwatchesList.length; i += 1) {
            this.view.colorBookPane.drp.dataSource.push({ id: getEnvironment().SwatchesList[i].id, text: getEnvironment().SwatchesList[i].text});
        }
    }

    noticeSwatchInfoResult(sender, swatchInfo: { filename: string, info: ColorBookInfo}) {
        let ds: {id: string, name: string, color: string}[] = [];
        SkLogger.write("SWATCH INFO", swatchInfo.info);
        /*
        for (let i = 0; i < swatchInfo.info.records.length; i += 1) {
            // console.dir(record);
            if (swatchInfo.info.records[i].dummyRecord === false) {
                let color = "";
                let com = swatchInfo.info.records[i].components;
                SkLogger.write(swatchInfo.info.records[i].name);
                if (swatchInfo.info.colorSpace === 'RGB') {
                    color = `rgb(${swatchInfo.info.records[i].components[0]},${swatchInfo.info.records[i].components[1]},${swatchInfo.info.records[i].components[2]})`;
                }
                if (swatchInfo.info.colorSpace === 'CMYK') {
                    color = `device-cmyk(${parseInt(com[0].toString())}%,${parseInt(com[1].toString())}%,${parseInt(com[2].toString())}%,${parseInt(com[3].toString())}%)`;
                    let torgb = cmyk2rgb(color);
                    color = torgb.stringValue;
                    // color = `rgb(${torgb.red},${torgb.green},${torgb.blue})`;
                }
                //SkLogger.write(color);
                ds.push({
                    id: swatchInfo.info.records[i].code,
                    name: swatchInfo.info.records[i].name,
                    color: color
                });
            } else {
                SkLogger.write("ACB Dummy record");
            }
        }
         */
        //ds = ds.sort((c1: {id: string, name: string, color: string}, c2: {id: string, name: string, color: string}) => {
        //    return c1.name.localeCompare(c2.name);
        //});
        this.selectedBook = swatchInfo.info;
        this.view.colorBookPane.collection.delegate = this;
        this.view.colorBookPane.collection.dataSource = new DataSource();
        this.view.colorBookPane.collection.dataSource.initWithData({rows: swatchInfo.info.records});
        this.view.colorBookPane.collection.reloadData();
    }

    collectionViewCellSize(collectionView: CollectionView, index: number): number[] {
        let size = 8;
        if (isDefined(this.selectedBook)) {
            size = this.selectedBook.pageSize + 1;
        }
        let w = collectionView.bounds.width.amount / size;
        return [w,w];
    }


    collectionViewCellWasAttached(collectionView: CollectionView, cell: View, index: number): void {
        let item: (ASE_RGB | ASE_CMYK | ASE_LAB | ASE_GRAY) = collectionView.dataSource.objectForSortedIndex(index);
        cell.borders =[new Border(true, 1, "solid", "rgb(50,50,50)")];
        let color = "";
        if (item.type !== "group") {
            if (item.color.model === 'RGB') {
                color = `rgba(${item.color.r * 255},${item.color.g * 255},${item.color.b * 255},1.0)`;
            }
            if (item.color.model === 'CMYK') {
                color = `device-cmyk(${item.color.c * 100}%,${item.color.m * 100}%,${item.color.y * 100}%,${item.color.k * 100}%,1.0)`;
                color = cmyk2rgb(color).stringValue;
            }
            if (item.color.model === "LAB") {
                color = `lab(${item.color.lightness *100},${item.color.a * 100},${item.color.b * 100})`;
                color = lab2rgb(color).stringValue;
            }

        }
        cell.fills = [new Fill(true, "color", "normal", color)];

        cell.keyValues["color"] = color;

        cell.render();

    }

    collectionViewSelectionChangedForCellIndex(collectionView: CollectionView, index: number, selected: boolean): void {
        if (!selected) {
            collectionView.Items[index].cell.borders = [new Border(true, 1, "solid", "rgb(50,50,50)")];
        } else {
            collectionView.Items[index].cell.borders = [new Border(true, 1, "solid", "rgb(250,250,250)")];

        }
        collectionView.Items[index].cell.render();
    }

    collectionViewSelectionHasChanged(collectionView: CollectionView): void {
        let items = collectionView.getSelectedCollectionItem();
        let color = (items[0] as CollectionItem).cell.keyValues["color"];

        this.currentColor = Color.fromString(color);
        this.sendColor();

        this.updateCMYK();
        this.updateHSL();
        this.updateRGB();

    }


}