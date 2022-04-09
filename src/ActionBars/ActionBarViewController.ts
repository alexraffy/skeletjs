import {BorderRadius, Bounds, Btn, Fill, fillParentBounds, isDefined, View, ViewController} from "mentatjs";
import {ActionBarController} from "./ActionBarController";
import {Session} from "../Session/Session";


export class ActionBarViewController extends ViewController {

    actions: {id: string}[];
    actionBarControllerRef: ActionBarController;

    viewForViewController(): View {
        let v = new View();
        v.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds)
        }
        v.viewWasAttached = () => {

        }
        v.dontCacheStyle = true;
        v.getDefaultStyle().fills = [new Fill(true, "color", "normal", "rgba(150, 150, 150, 1.0)")];
        v.getDefaultStyle().borderRadius = new BorderRadius(15, 15, 15, 15);

        return v;
    }

    viewWasPresented() {
        let x = 10;
        for (let i = 0; i < this.actions.length; i += 1) {
            if (this.actions[i].id === "delim") {
                x += 20;
                continue;
            }
            let btn = new Btn();
            btn.keyValues["x"] = x;
            btn.boundsForView = function (parentBounds) {
                return new Bounds(this.keyValues["x"], 5, 20, 20)
            }
            btn.styles = Session.instance.theme.buttonStyle;
            btn.fontFamily = "FontAwesome5ProSolid";
            switch (this.actions[i].id) {
                case "code":
                    btn.text = "&#xf121;";
                    btn.keyValues["target"] = "code";
                    break;
                case "text":
                    btn.text = "&#xf11c;";
                    btn.keyValues["target"] = "text";
                    break;
                case "typeface":
                    btn.text = "&#xf031;";
                    btn.keyValues["target"] = "typeface";
                    break;
                case "opacity":
                    btn.text = "&#xf867;";
                    btn.keyValues["target"] = "opacity";
                    break;
                case "fills":
                    btn.text = "&#xf575;";
                    btn.keyValues["target"] = "fills";
                    break;
                case "borders":
                    btn.text = "&#xf84c;";
                    btn.keyValues["target"] = "borders";
                    break;
                case "shadows":
                    btn.text = "&#xf185;";
                    btn.keyValues["target"] = "shadows";
                    break;
                case "lock":
                    btn.text = "&#xf023;";
                    btn.keyValues["target"] = "lock";
                    break;
                case "duplicate":
                    btn.text = "&#xf0fe;";
                    btn.keyValues["target"] = "duplicate";
                    break;
                case "delete":
                    btn.text = "&#xf1f8;";
                    btn.keyValues["target"] = "delete";
                    break;
            }
            btn.initView(this.actions[i].id);
            this.view.attach(btn);
            btn.setActionDelegate(this, "onAction");
            btn.setHoverDelegate(this, "onActionHint");
            x += 20;
        }

    }

    onAction(sender: Btn) {
        let target = sender.keyValues["target"];
        if (isDefined(target)) {
            this.actionBarControllerRef.action(target);
        }
    }

    onActionHint(sender: Btn, hover: boolean) {
        let target = sender.keyValues["target"];
        if (isDefined(target)) {
            if (hover) {
                let msg = [];
                switch (target) {
                    case "code":
                        msg = ["Set layer <b>Actions</b>"];
                        break;
                    case "text":
                        msg = ["<b>Edit</b> label"];
                        break;
                    case "typeface":
                        msg = ["Set layer <b>Typeface</b>"];
                        break;
                    case "opacity":
                        msg = ["Set layer <b>Opacity</b>"];
                        break;
                    case "fills":
                        msg = ["Set layer <b>Fill color</b>"];
                        break;
                    case "borders":
                        msg = ["Set layer <b>Border thickness</b>"];
                        break;
                    case "lock":
                        msg = ["<b>Lock</b> layer"];
                        break;
                    case "duplicate":
                        msg = ["<b>Duplicate</b> layer"];
                        break;
                    case "delete":
                        msg = ["<b>Delete</b> layer"];
                }
                this.actionBarControllerRef?.viewCanvasRef?.showHints(msg);
            } else  {
                this.actionBarControllerRef?.viewCanvasRef?.removeHints();
            }
        } else {
            this.actionBarControllerRef?.viewCanvasRef?.removeHints();
        }
    }

}