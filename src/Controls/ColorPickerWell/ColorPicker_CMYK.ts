import {Label, PXBounds, Slider, TextField, View} from "mentatjs";
import {Session} from "../../Session/Session";


export class ColorPicker_CMYK extends View {

    labelCyan: Label;
    txtCyan: TextField;
    sliderCyan: Slider;
    labelMagenta: Label;
    txtMagenta: TextField;
    sliderMagenta: Slider;
    labelYellow: Label;
    txtYellow: TextField;
    sliderYellow: Slider;
    labelKey: Label;
    txtKey: TextField;
    sliderKey: Slider;


    currentColor: View;
    lastColor: View;
    txtString: TextField;


    pxBoundsForView(parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: 210,
            height: 160,
            unit: "px",
            position: "absolute"
        };
    }

    viewWasAttached() {

        this.labelCyan = new Label();
        this.labelCyan.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 7,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelCyan.anchor('top', false, "", "leading", 0);
        this.labelCyan.anchor('left', false, "", "leading", 0);
        this.labelCyan.anchor('right', false, "", "trailing", 0);
        this.labelCyan.anchor('bottom', false, "", "trailing", 0);
        this.labelCyan.anchor('width', false, "", "leading", 0);
        this.labelCyan.anchor('height', false, "", "leading", 0);
        this.labelCyan.styles = Session.instance.theme.labelStyleSmall;
        this.labelCyan.text = "Cyan";
        this.labelCyan.fillLineHeight = true;
        this.labelCyan.textAlignment = "left";
        this.labelCyan.initView("labelCyan");
        this.attach(this.labelCyan);

        this.txtCyan = new TextField();
        this.txtCyan.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 7,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtCyan.isNumeric = true;
        this.txtCyan.numericMin = 0;
        this.txtCyan.numericMax = 100;
        this.txtCyan.anchor('top', false, "", "leading", 0);
        this.txtCyan.anchor('left', false, "", "leading", 0);
        this.txtCyan.anchor('right', false, "", "trailing", 0);
        this.txtCyan.anchor('bottom', false, "", "trailing", 0);
        this.txtCyan.anchor('width', false, "", "leading", 0);
        this.txtCyan.anchor('height', false, "", "leading", 0);
        this.txtCyan.initView("txtCyan");
        this.attach(this.txtCyan);

        this.sliderCyan = new Slider();
        this.sliderCyan.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 34,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderCyan.anchor('top', false, "", "leading", 0);
        this.sliderCyan.anchor('left', false, "", "leading", 0);
        this.sliderCyan.anchor('right', false, "", "trailing", 0);
        this.sliderCyan.anchor('bottom', false, "", "trailing", 0);
        this.sliderCyan.anchor('width', false, "", "leading", 0);
        this.sliderCyan.anchor('height', false, "", "leading", 0);
        this.sliderCyan.fills = [];
        this.sliderCyan.max = 100;
        this.sliderCyan.initView("sliderCyan");
        this.attach(this.sliderCyan);

        this.labelMagenta = new Label();
        this.labelMagenta.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 57,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelMagenta.anchor('top', false, "", "leading", 0);
        this.labelMagenta.anchor('left', false, "", "leading", 0);
        this.labelMagenta.anchor('right', false, "", "trailing", 0);
        this.labelMagenta.anchor('bottom', false, "", "trailing", 0);
        this.labelMagenta.anchor('width', false, "", "leading", 0);
        this.labelMagenta.anchor('height', false, "", "leading", 0);
        this.labelMagenta.styles = Session.instance.theme.labelStyleSmall;
        this.labelMagenta.text = "Magenta";
        this.labelMagenta.fillLineHeight = true;
        this.labelMagenta.textAlignment = "left";
        this.labelMagenta.initView("labelMagenta");
        this.attach(this.labelMagenta);

        this.txtMagenta = new TextField();
        this.txtMagenta.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 57,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtMagenta.isNumeric = true;
        this.txtMagenta.numericMin = 0;
        this.txtMagenta.numericMax = 100;
        this.txtMagenta.anchor('top', false, "", "leading", 0);
        this.txtMagenta.anchor('left', false, "", "leading", 0);
        this.txtMagenta.anchor('right', false, "", "trailing", 0);
        this.txtMagenta.anchor('bottom', false, "", "trailing", 0);
        this.txtMagenta.anchor('width', false, "", "leading", 0);
        this.txtMagenta.anchor('height', false, "", "leading", 0);
        this.txtMagenta.initView("txtMagenta");
        this.attach(this.txtMagenta);

        this.sliderMagenta = new Slider();
        this.sliderMagenta.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 83,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderMagenta.anchor('top', false, "", "leading", 0);
        this.sliderMagenta.anchor('left', false, "", "leading", 0);
        this.sliderMagenta.anchor('right', false, "", "trailing", 0);
        this.sliderMagenta.anchor('bottom', false, "", "trailing", 0);
        this.sliderMagenta.anchor('width', false, "", "leading", 0);
        this.sliderMagenta.anchor('height', false, "", "leading", 0);
        this.sliderMagenta.fills = [];
        this.sliderMagenta.max = 100;
        this.sliderMagenta.initView("sliderMagenta");
        this.attach(this.sliderMagenta);

        this.labelYellow = new Label();
        this.labelYellow.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 107,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelYellow.anchor('top', false, "", "leading", 0);
        this.labelYellow.anchor('left', false, "", "leading", 0);
        this.labelYellow.anchor('right', false, "", "trailing", 0);
        this.labelYellow.anchor('bottom', false, "", "trailing", 0);
        this.labelYellow.anchor('width', false, "", "leading", 0);
        this.labelYellow.anchor('height', false, "", "leading", 0);
        this.labelYellow.styles = Session.instance.theme.labelStyleSmall;
        this.labelYellow.text = "Yellow";
        this.labelYellow.fillLineHeight = true;
        this.labelYellow.textAlignment = "left";
        this.labelYellow.initView("labelYellow");
        this.attach(this.labelYellow);

        this.txtYellow = new TextField();
        this.txtYellow.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 107,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtYellow.isNumeric = true;
        this.txtYellow.numericMin = 0;
        this.txtYellow.numericMax = 100;
        this.txtYellow.anchor('top', false, "", "leading", 0);
        this.txtYellow.anchor('left', false, "", "leading", 0);
        this.txtYellow.anchor('right', false, "", "trailing", 0);
        this.txtYellow.anchor('bottom', false, "", "trailing", 0);
        this.txtYellow.anchor('width', false, "", "leading", 0);
        this.txtYellow.anchor('height', false, "", "leading", 0);
        this.txtYellow.initView("txtYellow");
        this.attach(this.txtYellow);

        this.sliderYellow = new Slider();
        this.sliderYellow.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 134,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderYellow.anchor('top', false, "", "leading", 0);
        this.sliderYellow.anchor('left', false, "", "leading", 0);
        this.sliderYellow.anchor('right', false, "", "trailing", 0);
        this.sliderYellow.anchor('bottom', false, "", "trailing", 0);
        this.sliderYellow.anchor('width', false, "", "leading", 0);
        this.sliderYellow.anchor('height', false, "", "leading", 0);
        this.sliderYellow.fills = [];
        this.sliderYellow.max = 100;
        this.sliderYellow.initView("sliderYellow");
        this.attach(this.sliderYellow);




        this.labelKey = new Label();
        this.labelKey.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 157,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelKey.anchor('top', false, "", "leading", 0);
        this.labelKey.anchor('left', false, "", "leading", 0);
        this.labelKey.anchor('right', false, "", "trailing", 0);
        this.labelKey.anchor('bottom', false, "", "trailing", 0);
        this.labelKey.anchor('width', false, "", "leading", 0);
        this.labelKey.anchor('height', false, "", "leading", 0);
        this.labelKey.styles = Session.instance.theme.labelStyleSmall;
        this.labelKey.text = "Key";
        this.labelKey.fillLineHeight = true;
        this.labelKey.textAlignment = "left";
        this.labelKey.initView("labelKey");
        this.attach(this.labelKey);

        this.txtKey = new TextField();
        this.txtKey.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 157,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtKey.isNumeric = true;
        this.txtKey.numericMin = 0;
        this.txtKey.numericMax = 100;
        this.txtKey.anchor('top', false, "", "leading", 0);
        this.txtKey.anchor('left', false, "", "leading", 0);
        this.txtKey.anchor('right', false, "", "trailing", 0);
        this.txtKey.anchor('bottom', false, "", "trailing", 0);
        this.txtKey.anchor('width', false, "", "leading", 0);
        this.txtKey.anchor('height', false, "", "leading", 0);
        this.txtKey.initView("txtKey");
        this.attach(this.txtKey);

        this.sliderKey = new Slider();
        this.sliderKey.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 187,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderKey.anchor('top', false, "", "leading", 0);
        this.sliderKey.anchor('left', false, "", "leading", 0);
        this.sliderKey.anchor('right', false, "", "trailing", 0);
        this.sliderKey.anchor('bottom', false, "", "trailing", 0);
        this.sliderKey.anchor('width', false, "", "leading", 0);
        this.sliderKey.anchor('height', false, "", "leading", 0);
        this.sliderKey.fills = [];
        this.sliderKey.max = 100;
        this.sliderKey.initView("sliderKey");
        this.attach(this.sliderKey);
        
        
        
        
        
        


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