import {
    BorderRadius,
    Bounds,
    Btn,
    Fill,
    fillParentBounds, generateV4UUID,
    isDefined, NUConvertToPixel,
    Slider, View,
    ViewController
} from "mentatjs";
import {ActionBarController} from "./ActionBarController";
import {Session} from "../Session/Session";


export class ActionBarOpacity extends ViewController {

    actionBarControllerRef: ActionBarController;

    btn: Btn;
    slider: Slider;

    viewForViewController(): View {
        let v = new View();
        v.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        v.viewWasAttached = () => {
            let btn = new Btn();
            btn.boundsForView = function (parentBounds) {
                return new Bounds(10, 5, 20, 20)
            }
            btn.styles = Session.instance.theme.buttonStyle;
            btn.fontFamily = "FontAwesome5ProSolid";
            btn.text = "&#xf867;";
            btn.initView(generateV4UUID());
            v.attach(btn);
            btn.setActionDelegate(this, "onBack");
            this.btn = btn;

            let sl = new Slider();
            sl.boundsForView = function (parentBounds) {
                return new Bounds(40, 10, NUConvertToPixel(parentBounds.width).amount - 40 - 10, 10);
            }
            sl.thinBar = true;
            sl.min = 0;
            sl.max = 100;
            sl.initView(generateV4UUID());
            v.attach(sl);
            this.slider = sl;
            this.slider.setActionDelegate(this, "onOpacityChanged");

        }
        v.getDefaultStyle().fills = [new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.5)")];
        v.getDefaultStyle().borderRadius = new BorderRadius(15, 15, 15, 15);
        return v;
    }

    viewWasPresented() {
        let value = this.actionBarControllerRef.viewCanvasRef?.getPropertyValue("view.opacity");
        if (isDefined(value)) {
            this.slider.setValue(value)
        }
    }

    onOpacityChanged(sender) {
        this.actionBarControllerRef.viewCanvasRef?.setPropertyValue("view.opacity", this.slider.value);
    }

    onBack() {
        this.actionBarControllerRef.action("");
    }


}