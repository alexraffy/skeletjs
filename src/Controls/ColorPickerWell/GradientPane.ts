import {
    Drp,
    Label,
    SegmentedButton,
    TextField,
    View, Btn, Color, PXBounds
} from "mentatjs";
import {GradientColor} from "./GradientColor";
import {Angle} from "./Angle";
import {ColorPickerWell} from "./ColorPickerWell";
import {labelForText} from "../../Utils/labelForText";
import {Session} from "../../Session/Session";

export class GradientPane extends View {

    gradDirection: Angle;
    txtAngle: TextField;
    txtOffsetX: TextField;
    lblLocation: Label;
    lblColor: Label;
    txtColor: ColorPickerWell;
    frmGradientEditor: GradientColor;
    gradMode: SegmentedButton;
    txtOriginX: TextField;
    txtOriginY: TextField;
    drpShape: Drp;
    lblAngle: Label;

    btnAddToPalette: Btn;



    pxBoundsForView(parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: 316,
            height: 246,
            unit: "px",
            position: "absolute"
        };
    }

    viewWasAttached() {
        let gradMode = new SegmentedButton();
        gradMode.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 5,
                y: 5,
                width: 150,
                height: 20,
                position: 'absolute',
                unit: 'px'
            };
        };
        gradMode.clear();
        gradMode.addButtons([{"id": "linear", "text": "Linear", "isEnabled": true}, {
            "id": "radial",
            "text": "Radial",
            "isEnabled": true
        }]);
        gradMode.selectedID = "linear";
        gradMode.noBorder = false;
        gradMode.initView('gradMode');
        this.attach(gradMode);
        this.gradMode = gradMode;

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
        toggleLove.fontWeight = '400';
        toggleLove.fontSize = 14;

        toggleLove.fontColor = 'rgb(50,50,50)';
        toggleLove.textAlignment = 'center';

        toggleLove.initView("toggleLove");
        this.attach(toggleLove);

        this.btnAddToPalette = toggleLove;


        let frmGradientEditor = new GradientColor();
        frmGradientEditor.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 9,
                y: 40,
                width: 302,
                height: 33,
                position: 'absolute',
                unit: 'px'
            };
        };
        frmGradientEditor.visible = true;
        frmGradientEditor.opacity = 100;
        frmGradientEditor.blendingMode = 'normal';
        frmGradientEditor.initView('frmGradientEditor');
        this.attach(frmGradientEditor);
        this.frmGradientEditor = frmGradientEditor;

        let txtColor = new ColorPickerWell();
        txtColor.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 67,
                y: 80,
                width: 50,
                height: 30,
                position: 'absolute',
                unit: 'px'
            };
        };
        txtColor.showTextField = false;
        txtColor.selectedColor = new Color('color', 'rgba(50,50,50,1)');
        txtColor.allowGradients = false;
        txtColor.initView('txtColor');
        this.attach(txtColor);
        this.txtColor = txtColor;

        let lblColor = new Label();
        lblColor.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 10,
                y: 80,
                width: 51,
                height: 30,
                position: 'absolute',
                unit: 'px'
            };
        };

        lblColor.text = 'Color';
        lblColor.styles = Session.instance.theme.labelStyleSmall;
        lblColor.textAlignment = 'right';
        lblColor.fillLineHeight = true;
        lblColor.initView('lblColor');
        this.attach(lblColor);
        this.lblColor = lblColor;

        let lblLocation = new Label();
        lblLocation.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 141,
                y: 80,
                width: 61,
                height: 30,
                position: 'absolute',
                unit: 'px'
            };
        };

        lblLocation.text = 'Location';
        lblLocation.styles = Session.instance.theme.labelStyleSmall;
        lblLocation.textAlignment = 'right';

        lblLocation.fillLineHeight = true;
        lblLocation.initView('lblLocation');
        this.attach(lblLocation);
        this.lblLocation = lblLocation;

        let txtOffsetX = new TextField();
        txtOffsetX.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 207,
                y: 80,
                width: 63,
                height: 30,
                position: 'absolute',
                unit: 'px'
            };
        };
        txtOffsetX.value = '1';
        txtOffsetX.placeholderValue = '';
        txtOffsetX.isTextArea = false;
        txtOffsetX.isNumeric = true;
        txtOffsetX.isPassword = false;
        txtOffsetX.isSearch = false;
        txtOffsetX.formatter = null;
        txtOffsetX.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        txtOffsetX.fontWeight = '300';
        txtOffsetX.fontSize = 12;
        txtOffsetX.fontColor = 'rgb(50,50,50)';
        txtOffsetX.textAlignment = 'left';
        txtOffsetX.underline = false;
        txtOffsetX.strike = false;
        txtOffsetX.kerning = 'auto';
        txtOffsetX.isEnabled = true;
        txtOffsetX.visible = true;
        txtOffsetX.flatStyle = false;
        txtOffsetX.initView('txtOffsetX');
        this.attach(txtOffsetX);
        this.txtOffsetX = txtOffsetX;

        let lblAngle = new Label();
        lblAngle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 10,
                y: 144,
                width: 51,
                height: 30,
                position: 'absolute',
                unit: 'px'
            };
        };

        lblAngle.text = 'Angle';
        lblAngle.styles = Session.instance.theme.labelStyleSmall;
        lblAngle.textAlignment = 'right';

        lblAngle.fillLineHeight = true;
        lblAngle.initView('lblAngle');
        this.attach(lblAngle);
        this.lblAngle = lblAngle;
        
        
        
        

        let angle = new Angle();
        angle.angle = 0;
        angle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 67,
                y: 144,
                width: 30,
                height: 30,
                unit: 'px',
                position: "absolute"
            };
        };
        angle.initView(this.id + ".angle");
        this.attach(angle);
        this.gradDirection = angle;

        let txtAngle = new TextField();
        txtAngle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 67 + 30 + 10,
                y: 144,
                width: 50,
                height: 30,
                unit: 'px',
                position: 'absolute'
            };
        };
        txtAngle.isNumeric = true;
        txtAngle.initView(this.id + ".txtAngle");
        this.attach(txtAngle);
        txtAngle.setRightView(labelForText("&#176;", "rgb(50,50,50)", "white"));
        this.txtAngle = txtAngle;


        let txtOriginY = new TextField();
        txtOriginY.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 140,
                y: 180,
                width: 50,
                height: 30,
                unit: 'px',
                position: 'absolute'
            };
        };
        txtOriginY.placeholderValue = 'Y';
        txtOriginY.isNumeric = true;
        txtOriginY.initView(this.id + ".txtOriginY");
        this.attach(txtOriginY);
        txtOriginY.setRightView(labelForText("%", "rgb(50,50,50)", "white"));
        this.txtOriginY = txtOriginY;
        this.txtOriginY.setVisible(false);

        let txtOriginX = new TextField();
        txtOriginX.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 80,
                y: 180,
                width: 50,
                height: 30,
                unit: 'px',
                position: 'absolute'
            };
        };
        txtOriginX.placeholderValue = 'X';
        txtOriginX.isNumeric = true;
        txtOriginX.initView(this.id + ".txtOriginX");
        this.attach(txtOriginX);
        txtOriginX.setRightView(labelForText("%", "rgb(50,50,50)", "white"));
        this.txtOriginX = txtOriginX;
        this.txtOriginX.setVisible(false);

        let drpShape = new Drp();
        drpShape.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 67,
                y: 144,
                width: 100,
                height: 30,
                unit: 'px',
                position: 'absolute'
            };
        };
        // 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner';
        drpShape.dataSource = [
            {id: "circle", text: "circle"},
            {id: 'ellipse', text: "ellipse"},
            {id: "closest-side", text: "closest-side"},
            {id: "farthest-side", text: "farthest-side"},
            {id: "closest-corner", text: "closest-corner"},
            {id: "farthest-corner", text: "farthest-corner"}
        ];
        drpShape.initView(this.id + ".drpShape");
        this.attach(drpShape);
        this.drpShape = drpShape;
        this.drpShape.setVisible(false);


    }
}