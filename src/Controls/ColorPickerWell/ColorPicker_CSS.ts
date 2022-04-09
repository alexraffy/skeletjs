import {PXBounds, TextField, View} from "mentatjs";


export class ColorPicker_CSS extends View {

    txtValue: TextField;


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


        this.txtValue = new TextField();
        this.txtValue.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                "x": 5,
                "y": 7,
                "width": 200,
                "height": 140,
                "unit": "px",
                "position": "absolute"
            };
        };
        this.txtValue.anchor('top', false, "", "leading", 0);
        this.txtValue.anchor('left', false, "", "leading", 0);
        this.txtValue.anchor('right', false, "", "trailing", -10);
        this.txtValue.anchor('bottom', false, "", "trailing", 0);
        this.txtValue.anchor('width', false, "", "leading", 0);
        this.txtValue.anchor('height', false, "", "leading", 0);
        this.txtValue.isTextArea = true;
        this.txtValue.initView("txtValue");
        this.attach(this.txtValue);

    }

}