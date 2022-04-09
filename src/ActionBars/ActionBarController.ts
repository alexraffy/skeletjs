import {ActionBarOpacity} from "./ActionBarOpacity";
import {ActionBarViewController} from "./ActionBarViewController";
import {
    Application,
    assert,
    Bounds,
    generateV4UUID,
    isDefined,
    NavigationController, NUConvertToPixel,
    px,
    Size,
    View,
    ViewController
} from "mentatjs";
import {ViewCanvas} from "../Canvas/ViewCanvas";
import {EditorMode} from "../Canvas/modes/EditorMode";
import {kNotifications} from "../Session/kNotifications";


export class ActionBarController {

    private view: View;
    private nav: NavigationController;
    private editorRef: EditorMode;
    viewCanvasRef: ViewCanvas;

    private currentAction: string = "";

    init(viewCanvas: ViewCanvas, editor: EditorMode) {
        assert(isDefined(viewCanvas) && isDefined(editor), "ActionBarController.init expects a ViewCanvas and a EditorMode parameter");
        this.viewCanvasRef = viewCanvas;
        this.editorRef = editor;

        let v = new View();
        v.keyValues["editorRef"] = this.editorRef;
        v.keyValues["actionBarControllerRef"] = this;
        v.boundsForView = function (parentBounds) {
            let ref: EditorMode = this.keyValues["editorRef"];
            let selectionBounds = ref.selectionView.view.getBounds("");
            let size = (this.keyValues["actionBarControllerRef"] as ActionBarController).viewSize();
            let x = (NUConvertToPixel(selectionBounds.x).amount + 4800 +
                NUConvertToPixel(selectionBounds.width).amount / 2) -
                (NUConvertToPixel(size.width).amount / 2);
            let y = NUConvertToPixel(selectionBounds.y).amount + 4800 + NUConvertToPixel(selectionBounds.height).amount + 20;

            return new Bounds(x, y, NUConvertToPixel(size.width).amount,NUConvertToPixel(size.height).amount);
        }
        v.dontCacheStyle = true;
        v.getDefaultStyle().zIndex = "8999";
        v.initView(generateV4UUID());
        this.viewCanvasRef.canvasViewRef.parentView.attach(v);
        this.view = v;


        this.nav = new NavigationController();
        this.nav.initNavigationControllerWithRootView(generateV4UUID(), this.view);
        this.update();
    }

    hide() {
        this.view.setVisible(false);
    }
    show() {
        this.view.setVisible(true);
        this.update();
    }

    update() {
        this.view.processStyleAndRender("", []);
        let actions = this.viewCanvasRef.getSelectionActions();
        if (this.currentAction === "") {
            this.nav.clear();
            this.nav.instantiateViewController(generateV4UUID(), ActionBarViewController, {
                viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                    (viewController as ActionBarViewController).actions = actions;
                    (viewController as ActionBarViewController).actionBarControllerRef = this;
                    this.nav.present(viewController, {animated: false});
                }
            })
        } else {
            this.nav.clear();
            switch (this.currentAction) {
                case "opacity":
                    this.nav.instantiateViewController(generateV4UUID(), ActionBarOpacity, {
                        viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                            (viewController as ActionBarOpacity).actionBarControllerRef = this;
                            this.nav.present(viewController, {animated: false});
                        }
                    });
                    break;
                case "code":
                    this.currentAction = "";
                    Application.instance.notifyAll(this, kNotifications.noticeOpenCodeEditor,this.viewCanvasRef.selectedLayersInfo[0].layer );
                    break;
                default:
                    this.currentAction = "";

            }
        }
    }

    viewSize(): Size {
        let actions = this.viewCanvasRef.getSelectionActions();
        if (this.currentAction === "") {
            return new Size(px(actions.length * 20 + 20), px(30));
        } else {
            return new Size(px(200), px(30));
        }
    }

    action(target: string) {
        this.currentAction = target;
        this.update();
    }

}