import {Label, PXBounds, Slider, TextField, View} from "mentatjs";
import {Session} from "../../Session/Session";


export class ColorPicker_HSL extends View {

        sliderSpectrum: Slider;
        labelHue: Label;
        labelSaturation: Label;
        sliderSaturation: Slider;
        labelBrightness: Label;
        sliderBrightness: Slider;
        txtHue: TextField;
        txtSaturation: TextField;
        txtBrightness: TextField;
        currentColor: View;
        lastColor: View;
        txtString: TextField;


    pxBoundsForView(parentBounds: PXBounds): PXBounds
    {
        return {
            x: 0,
            y: 0,
            width: 210,
            height: 160,
            unit: "px",
            position: "absolute"
        };
    }


    viewWasAttached()
    {



        this.sliderSpectrum = new Slider();
        this.sliderSpectrum.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 34,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderSpectrum.max = 360;
        this.sliderSpectrum.anchor('top', false, "", "leading", 0);
        this.sliderSpectrum.anchor('left', false, "", "leading", 0);
        this.sliderSpectrum.anchor('right', false, "", "trailing", 0);
        this.sliderSpectrum.anchor('bottom', false, "", "trailing", 0);
        this.sliderSpectrum.anchor('width', false, "", "leading", 0);
        this.sliderSpectrum.anchor('height', false, "", "leading", 0);
        this.sliderSpectrum.fills = [];
        this.sliderSpectrum.initView("sliderSpectrum");
        this.attach(this.sliderSpectrum);

        this.labelHue = new Label();
        this.labelHue.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 7,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelHue.anchor('top', false, "", "leading", 0);
        this.labelHue.anchor('left', false, "", "leading", 0);
        this.labelHue.anchor('right', false, "", "trailing", 0);
        this.labelHue.anchor('bottom', false, "", "trailing", 0);
        this.labelHue.anchor('width', false, "", "leading", 0);
        this.labelHue.anchor('height', false, "", "leading", 0);
        this.labelHue.styles = Session.instance.theme.labelStyleSmall;
        this.labelHue.text = "Hue";
        this.labelHue.fillLineHeight = true;
        this.labelHue.textAlignment = "left";
        this.labelHue.initView("labelHue");
        this.attach(this.labelHue);

        this.labelSaturation = new Label();
        this.labelSaturation.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 57,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelSaturation.anchor('top', false, "", "leading", 0);
        this.labelSaturation.anchor('left', false, "", "leading", 0);
        this.labelSaturation.anchor('right', false, "", "trailing", 0);
        this.labelSaturation.anchor('bottom', false, "", "trailing", 0);
        this.labelSaturation.anchor('width', false, "", "leading", 0);
        this.labelSaturation.anchor('height', false, "", "leading", 0);
        this.labelSaturation.styles = Session.instance.theme.labelStyleSmall;
        this.labelSaturation.text = "Saturation";
        this.labelSaturation.fillLineHeight = true;
        this.labelSaturation.textAlignment = "left";
        this.labelSaturation.initView("labelSaturation");
        this.attach(this.labelSaturation);

        this.sliderSaturation = new Slider();
        this.sliderSaturation.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 83,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderSaturation.anchor('top', false, "", "leading", 0);
        this.sliderSaturation.anchor('left', false, "", "leading", 0);
        this.sliderSaturation.anchor('right', false, "", "trailing", 0);
        this.sliderSaturation.anchor('bottom', false, "", "trailing", 0);
        this.sliderSaturation.anchor('width', false, "", "leading", 0);
        this.sliderSaturation.anchor('height', false, "", "leading", 0);
        this.sliderSaturation.fills = [];
        this.sliderSaturation.initView("sliderSaturation");
        this.attach(this.sliderSaturation);

        this.labelBrightness = new Label();
        this.labelBrightness.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 107,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelBrightness.anchor('top', false, "", "leading", 0);
        this.labelBrightness.anchor('left', false, "", "leading", 0);
        this.labelBrightness.anchor('right', false, "", "trailing", 0);
        this.labelBrightness.anchor('bottom', false, "", "trailing", 0);
        this.labelBrightness.anchor('width', false, "", "leading", 0);
        this.labelBrightness.anchor('height', false, "", "leading", 0);
        this.labelBrightness.styles = Session.instance.theme.labelStyleSmall;
        this.labelBrightness.text = "Lightness";
        this.labelBrightness.fillLineHeight = true;
        this.labelBrightness.textAlignment = "left";
        this.labelBrightness.initView("labelBrightness");
        this.attach(this.labelBrightness);

        this.sliderBrightness = new Slider();
        this.sliderBrightness.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 134,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderBrightness.anchor('top', false, "", "leading", 0);
        this.sliderBrightness.anchor('left', false, "", "leading", 0);
        this.sliderBrightness.anchor('right', false, "", "trailing", 0);
        this.sliderBrightness.anchor('bottom', false, "", "trailing", 0);
        this.sliderBrightness.anchor('width', false, "", "leading", 0);
        this.sliderBrightness.anchor('height', false, "", "leading", 0);
        this.sliderBrightness.fills = [];
        this.sliderBrightness.initView("sliderBrightness");
        this.attach(this.sliderBrightness);






        this.txtHue = new TextField();
        this.txtHue.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 7,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtHue.isNumeric = true;
        this.txtHue.numericMin = 0;
        this.txtHue.numericMax = 360;
        this.txtHue.anchor('top', false, "", "leading", 0);
        this.txtHue.anchor('left', false, "", "leading", 0);
        this.txtHue.anchor('right', false, "", "trailing", 0);
        this.txtHue.anchor('bottom', false, "", "trailing", 0);
        this.txtHue.anchor('width', false, "", "leading", 0);
        this.txtHue.anchor('height', false, "", "leading", 0);
        this.txtHue.initView("txtHue");
        this.attach(this.txtHue);

        this.txtSaturation = new TextField();
        this.txtSaturation.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 57,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtSaturation.isNumeric = true;
        this.txtSaturation.numericMin = 0;
        this.txtSaturation.numericMax = 100;
        this.txtSaturation.anchor('top', false, "", "leading", 0);
        this.txtSaturation.anchor('left', false, "", "leading", 0);
        this.txtSaturation.anchor('right', false, "", "trailing", 0);
        this.txtSaturation.anchor('bottom', false, "", "trailing", 0);
        this.txtSaturation.anchor('width', false, "", "leading", 0);
        this.txtSaturation.anchor('height', false, "", "leading", 0);
        this.txtSaturation.initView("txtSaturation");
        this.attach(this.txtSaturation);

        this.txtBrightness = new TextField();
        this.txtBrightness.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 107,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtBrightness.isNumeric = true;
        this.txtBrightness.numericMin = 0;
        this.txtBrightness.numericMax = 100;
        this.txtBrightness.anchor('top', false, "", "leading", 0);
        this.txtBrightness.anchor('left', false, "", "leading", 0);
        this.txtBrightness.anchor('right', false, "", "trailing", 0);
        this.txtBrightness.anchor('bottom', false, "", "trailing", 0);
        this.txtBrightness.anchor('width', false, "", "leading", 0);
        this.txtBrightness.anchor('height', false, "", "leading", 0);
        this.txtBrightness.initView("txtBrightness");
        this.attach(this.txtBrightness);


        let currentColor = new View();
        currentColor.pxBoundsForView = function (parentBounds: PXBounds) : PXBounds {
            return {
                x: 210,
                y: 7,
                width: parentBounds.width - 210 - 5,
                height: 40,
                unit: 'px',
                position: "absolute"
            };
        };
        currentColor.fills = [];
        currentColor.initView(this.id + ".currentColor");
        this.attach(currentColor);
        this.currentColor = currentColor;

        let lastColor = new View();
        lastColor.pxBoundsForView = function (parentBounds: PXBounds) : PXBounds {
            return {
                x: 210,
                y: 47,
                width: parentBounds.width - 210 - 5,
                height: 40,
                unit: 'px',
                position: "absolute"
            };
        };
        lastColor.fills = [];
        lastColor.initView(this.id + ".lastColor");
        this.attach(lastColor);
        this.lastColor = lastColor;

        this.txtString = new TextField();
        this.txtString.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 210,
                y: 107,
                width: parentBounds.width - 210 - 5,
                height: 46,
                unit: 'px',
                position: 'absolute'
            };
        };
        this.txtString.isTextArea = true;
        this.txtString.fontSize = 12;
        this.txtString.isEnabled = false;
        this.txtString.initView(this.id + ".txtString");
        this.attach(this.txtString);


    }

}