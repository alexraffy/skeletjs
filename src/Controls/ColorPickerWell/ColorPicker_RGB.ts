import {Label, PXBounds, Slider, TextField, View} from "mentatjs";
import {Session} from "../../Session/Session";


export class ColorPicker_RGB extends View {

    labelRed: Label;
    txtRed: TextField;
    sliderRed: Slider;
    labelGreen: Label;
    txtGreen: TextField;
    sliderGreen: Slider;
    labelBlue: Label;
    txtBlue: TextField;
    sliderBlue: Slider;
    currentColor: View;
    lastColor: View;
    txtString: TextField;

    //fills: Fill[] = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(253,253,253)'}];

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

        this.labelRed = new Label();
        this.labelRed.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 7,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelRed.anchor('top', false, "", "leading", 0);
        this.labelRed.anchor('left', false, "", "leading", 0);
        this.labelRed.anchor('right', false, "", "trailing", 0);
        this.labelRed.anchor('bottom', false, "", "trailing", 0);
        this.labelRed.anchor('width', false, "", "leading", 0);
        this.labelRed.anchor('height', false, "", "leading", 0);
        this.labelRed.styles = Session.instance.theme.labelStyleSmall;
        this.labelRed.text = "Red";
        this.labelRed.fillLineHeight = true;
        this.labelRed.textAlignment = "left";
        this.labelRed.initView("labelRed");
        this.attach(this.labelRed);

        this.txtRed = new TextField();
        this.txtRed.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 7,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtRed.isNumeric = true;
        this.txtRed.numericMin = 0;
        this.txtRed.numericMax = 255;
        this.txtRed.anchor('top', false, "", "leading", 0);
        this.txtRed.anchor('left', false, "", "leading", 0);
        this.txtRed.anchor('right', false, "", "trailing", 0);
        this.txtRed.anchor('bottom', false, "", "trailing", 0);
        this.txtRed.anchor('width', false, "", "leading", 0);
        this.txtRed.anchor('height', false, "", "leading", 0);
        this.txtRed.initView("txtRed");
        this.attach(this.txtRed);

        this.sliderRed = new Slider();
        this.sliderRed.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 34,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderRed.anchor('top', false, "", "leading", 0);
        this.sliderRed.anchor('left', false, "", "leading", 0);
        this.sliderRed.anchor('right', false, "", "trailing", 0);
        this.sliderRed.anchor('bottom', false, "", "trailing", 0);
        this.sliderRed.anchor('width', false, "", "leading", 0);
        this.sliderRed.anchor('height', false, "", "leading", 0);
        this.sliderRed.fills = [];
        this.sliderRed.max = 255;
        this.sliderRed.initView("sliderRed");
        this.attach(this.sliderRed);

        this.labelGreen = new Label();
        this.labelGreen.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 57,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelGreen.anchor('top', false, "", "leading", 0);
        this.labelGreen.anchor('left', false, "", "leading", 0);
        this.labelGreen.anchor('right', false, "", "trailing", 0);
        this.labelGreen.anchor('bottom', false, "", "trailing", 0);
        this.labelGreen.anchor('width', false, "", "leading", 0);
        this.labelGreen.anchor('height', false, "", "leading", 0);
        this.labelGreen.styles = Session.instance.theme.labelStyleSmall;
        this.labelGreen.text = "Green";
        this.labelGreen.fillLineHeight = true;
        this.labelGreen.textAlignment = "left";
        this.labelGreen.initView("labelGreen");
        this.attach(this.labelGreen);

        this.txtGreen = new TextField();
        this.txtGreen.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 57,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtGreen.isNumeric = true;
        this.txtGreen.numericMin = 0;
        this.txtGreen.numericMax = 255;
        this.txtGreen.anchor('top', false, "", "leading", 0);
        this.txtGreen.anchor('left', false, "", "leading", 0);
        this.txtGreen.anchor('right', false, "", "trailing", 0);
        this.txtGreen.anchor('bottom', false, "", "trailing", 0);
        this.txtGreen.anchor('width', false, "", "leading", 0);
        this.txtGreen.anchor('height', false, "", "leading", 0);
        this.txtGreen.initView("txtGreen");
        this.attach(this.txtGreen);

        this.sliderGreen = new Slider();
        this.sliderGreen.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 83,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderGreen.anchor('top', false, "", "leading", 0);
        this.sliderGreen.anchor('left', false, "", "leading", 0);
        this.sliderGreen.anchor('right', false, "", "trailing", 0);
        this.sliderGreen.anchor('bottom', false, "", "trailing", 0);
        this.sliderGreen.anchor('width', false, "", "leading", 0);
        this.sliderGreen.anchor('height', false, "", "leading", 0);
        this.sliderGreen.fills = [];
        this.sliderGreen.max = 255;
        this.sliderGreen.initView("sliderGreen");
        this.attach(this.sliderGreen);

        this.labelBlue = new Label();
        this.labelBlue.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 107,
                "width": 62,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.labelBlue.anchor('top', false, "", "leading", 0);
        this.labelBlue.anchor('left', false, "", "leading", 0);
        this.labelBlue.anchor('right', false, "", "trailing", 0);
        this.labelBlue.anchor('bottom', false, "", "trailing", 0);
        this.labelBlue.anchor('width', false, "", "leading", 0);
        this.labelBlue.anchor('height', false, "", "leading", 0);
        this.labelBlue.styles = Session.instance.theme.labelStyleSmall;
        this.labelBlue.text = "Blue";
        this.labelBlue.fillLineHeight = true;
        this.labelBlue.textAlignment = "left";
        this.labelBlue.initView("labelBlue");
        this.attach(this.labelBlue);

        this.txtBlue = new TextField();
        this.txtBlue.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 144,
                "y": 107,
                "width": 59,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtBlue.isNumeric = true;
        this.txtBlue.numericMin = 0;
        this.txtBlue.numericMax = 255;
        this.txtBlue.anchor('top', false, "", "leading", 0);
        this.txtBlue.anchor('left', false, "", "leading", 0);
        this.txtBlue.anchor('right', false, "", "trailing", 0);
        this.txtBlue.anchor('bottom', false, "", "trailing", 0);
        this.txtBlue.anchor('width', false, "", "leading", 0);
        this.txtBlue.anchor('height', false, "", "leading", 0);
        this.txtBlue.initView("txtBlue");
        this.attach(this.txtBlue);

        this.sliderBlue = new Slider();
        this.sliderBlue.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 134,
                "width": 200,
                "height": 16,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.sliderBlue.anchor('top', false, "", "leading", 0);
        this.sliderBlue.anchor('left', false, "", "leading", 0);
        this.sliderBlue.anchor('right', false, "", "trailing", 0);
        this.sliderBlue.anchor('bottom', false, "", "trailing", 0);
        this.sliderBlue.anchor('width', false, "", "leading", 0);
        this.sliderBlue.anchor('height', false, "", "leading", 0);
        this.sliderBlue.fills = [];
        this.sliderBlue.max = 255;
        this.sliderBlue.initView("sliderBlue");
        this.attach(this.sliderBlue);


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