import {
    View,
    Btn,
    Drp, PXBounds
} from "mentatjs";
import {ColorPicker_CSS} from "./ColorPicker_CSS";
import {ColorPicker_RGB} from "./ColorPicker_RGB";
import {ColorPicker_HSL} from "./ColorPicker_HSL";
import {ColorPicker_CMYK} from "./ColorPicker_CMYK";


export class SolidColorPane extends View {

    mode: Drp;
    solidPicker_HSL: ColorPicker_HSL;
    solidPicker_RGB: ColorPicker_RGB;
    solidPicker_CMYK: ColorPicker_CMYK;
    solidPicker_CSS: ColorPicker_CSS;

    btnAddToPalette: Btn;

    //labelOpacity: Label;
    //sliderOpacity: Slider;
    //txtOpacity: TextField;

    //fills: Fill[] = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(253,253,253)'}];

    pxBoundsForView(parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: 210,
            height: 206,
            unit: "px",
            position: "absolute"
        };
    }


    viewWasAttached() {


        this.mode = new Drp();
        this.mode.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 5,
                "width": 100,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        //this.mode.clear();
        this.mode.dataSource = [
            {id: 'hsl', text: 'HSL'}, {id: 'rgb', text: 'RGB'}, {id: 'cmyk', text: "CMYK"}
        ];
        //this.mode.addButtons([{id: 'hsl', text: 'HSL'}, {id: 'rgb', text: 'RGB'}, {id: 'cmyk', text: "CMYK"}]); //, {id: 'cssText', text: 'CSS', paneId: 'solidPicker_CSS'}]);
        this.mode.selectedID = 'hsl';
        this.mode.anchor('top', false, "", "leading", 0);
        this.mode.anchor('left', false, "", "leading", 0);
        this.mode.anchor('right', false, "", "trailing", 0);
        this.mode.anchor('bottom', false, "", "trailing", 0);
        this.mode.anchor('width', false, "", "leading", 0);
        this.mode.anchor('height', false, "", "leading", 0);
        this.mode.initView("mode");
        this.attach(this.mode);

        let toggleLove = new Btn();
        toggleLove.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": parentBounds.width - 30,
                "y": 5,
                "width": 20,
                "height": 20,
                "unit": "px",
                "position": "absolute"
            };
        };
        toggleLove.text = '&#xf004;';
        toggleLove.visible = true;
        toggleLove.isToggle = false;
        toggleLove.isEnabled = true;
        toggleLove.buttonGroup = '';
        toggleLove.isToggled = false;
        toggleLove.fontFamily = 'FontAwesome5ProSolid';
        toggleLove.textAlignment = 'center';
        toggleLove.initView("toggleLove");
        this.attach(toggleLove);
        this.btnAddToPalette = toggleLove;

        this.solidPicker_HSL = new ColorPicker_HSL();
        this.solidPicker_HSL.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 0,
                "y": 31,
                "width": parentBounds.width,
                "height": parentBounds.height - 31,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.solidPicker_HSL.anchor('top', false, "", "leading", 0);
        this.solidPicker_HSL.anchor('left', false, "", "leading", 0);
        this.solidPicker_HSL.anchor('right', false, "", "trailing", 0);
        this.solidPicker_HSL.anchor('bottom', false, "", "trailing", 0);
        this.solidPicker_HSL.anchor('width', false, "", "leading", 0);
        this.solidPicker_HSL.anchor('height', false, "", "leading", 0);
        this.solidPicker_HSL.initView("solidPicker_HSL");
        this.attach(this.solidPicker_HSL);

        this.solidPicker_RGB = new ColorPicker_RGB();
        this.solidPicker_RGB.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 0,
                "y": 31,
                "width": parentBounds.width,
                "height": parentBounds.height - 31,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.solidPicker_RGB.anchor('top', false, "", "leading", 0);
        this.solidPicker_RGB.anchor('left', false, "", "leading", 0);
        this.solidPicker_RGB.anchor('right', false, "", "trailing", 0);
        this.solidPicker_RGB.anchor('bottom', false, "", "trailing", 0);
        this.solidPicker_RGB.anchor('width', false, "", "leading", 0);
        this.solidPicker_RGB.anchor('height', false, "", "leading", 0);
        this.solidPicker_RGB.initView("solidPicker_RGB");
        this.attach(this.solidPicker_RGB);

        this.solidPicker_CMYK = new ColorPicker_CMYK();
        this.solidPicker_CMYK.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 0,
                "y": 31,
                "width": parentBounds.width,
                "height": parentBounds.height - 31,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.solidPicker_CMYK.anchor('top', false, "", "leading", 0);
        this.solidPicker_CMYK.anchor('left', false, "", "leading", 0);
        this.solidPicker_CMYK.anchor('right', false, "", "trailing", 0);
        this.solidPicker_CMYK.anchor('bottom', false, "", "trailing", 0);
        this.solidPicker_CMYK.anchor('width', false, "", "leading", 0);
        this.solidPicker_CMYK.anchor('height', false, "", "leading", 0);
        this.solidPicker_CMYK.initView("solidPicker_CMYK");
        this.attach(this.solidPicker_CMYK);




        this.solidPicker_CSS = new ColorPicker_CSS();
        this.solidPicker_CSS.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": parentBounds.width / 2 - 210 / 2,
                "y": 41,
                "width": 210,
                "height": 160,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.solidPicker_CSS.anchor('top', false, "", "leading", 0);
        this.solidPicker_CSS.anchor('left', false, "", "leading", 0);
        this.solidPicker_CSS.anchor('right', false, "", "trailing", 0);
        this.solidPicker_CSS.anchor('bottom', false, "", "trailing", 0);
        this.solidPicker_CSS.anchor('width', false, "", "leading", 0);
        this.solidPicker_CSS.anchor('height', false, "", "leading", 0);
        this.solidPicker_CSS.initView("solidPicker_CSS");
        this.attach(this.solidPicker_CSS);
        this.solidPicker_CSS.setVisible(false);


        this.mode.setSelectedItem('hsl');

    }

}