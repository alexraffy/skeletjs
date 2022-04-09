import {
    Application,
    Bounds,
    Direction,
    fillParentBounds,
    isDefined,
    NUConvertToPixel,
    PXBounds,
    View,
    ViewController
} from "mentatjs";
import {ICOMDrawAll} from "../Commands/ICOMDrawAll";
import {ViewCanvas} from "./ViewCanvas";
import {Ruler} from "../Controls/Ruler/Ruler";
import {Layer} from "../Layer/Layer";
import {round10} from "../Utils/decimals";
import {updateLayersFromUserComponent} from "../Plugin/updateLayersFromUserComponent";
import {queueCommand} from "../Commands/queueCommand";
import {Session} from "../Session/Session";


export class ViewsCanvasViewController extends ViewController {

    viewCanvasDelegate: ViewCanvas;

    horizontalRuler: Ruler;
    verticalRuler: Ruler;
    canvas: View;
    canvasBackground: View;
    canvasFront: View;




    viewForViewController(): View {
        let v = new View();
        v.boundsForView = function(parentBounds: Bounds): Bounds {
            return fillParentBounds(parentBounds);
        }
        v.viewWasAttached = () => {
            this.horizontalRuler = new Ruler();
            this.verticalRuler = new Ruler();
            this.canvas = new View();
            this.canvasBackground = new View();
            this.canvasFront = new View();
            this.canvasFront.elementName = "canvas";

            // get the background color setting
            let settingBackgroundColor = Session.instance.environment.SystemSettings.system.find((setting) => {
                return setting.id === "app.skelet.canvas.backgroundColor";
            });

            this.canvasBackground.boundsForView = function (parentBounds): Bounds {
                return new Bounds(
                    20,
                    20,
                    NUConvertToPixel(parentBounds.width).amount - 20,
                    NUConvertToPixel(parentBounds.height).amount - 20
                );
            }
            //this.canvasBackground.getDefaultStyle().fills = [{active: true, type: 'color', blendMode: 'normal', value: settingBackgroundColor.value}];
            this.canvasBackground.getDefaultStyle().extraCss =
                "background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAFJGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDYgNzkuMTY0NzUzLCAyMDIxLzAyLzE1LTExOjUyOjEzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMyAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA0LTEzVDEzOjU3OjUxKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wNC0xM1QxNjo1MzoxNCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wNC0xM1QxNjo1MzoxNCswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4ZmYzNGRlZS02YzcxLWYwNDQtODg4Ny0zZDNlMjY4ZDI5ODEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2MWE5NGY0Ny0zNTU5LWQzNDgtYjNkYy0yZDI4ZjUzYmE4MjkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4ZmYzNGRlZS02YzcxLWYwNDQtODg4Ny0zZDNlMjY4ZDI5ODEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjhmZjM0ZGVlLTZjNzEtZjA0NC04ODg3LTNkM2UyNjhkMjk4MSIgc3RFdnQ6d2hlbj0iMjAyMS0wNC0xM1QxMzo1Nzo1MSswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjMgKFdpbmRvd3MpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Po5xxJ8AAADESURBVFiF7ZKxCsJAEETfhqgpRET/VBsFrRJImuQX/QLBzgjiWlwiIbkIwsVqp1quuH0zs6KqVEU2A+5ADETACrgBC+ABsD+e6UpVCaGoKrI58GoABEj6y/sq81SCbMe5fQBPYNmAXIANLgVg6B4IYx8XeetGO3MC1CPLgyoeefdG3/YuIuwOpyAAny7LPG3HNe4GJju8riLPWx18yxcNrrnM0y1w9XU/RQIyxae/yFeBARiAARiAARiAARiAARiAAfxVb/7XNILRTywuAAAAAElFTkSuQmCC');" +
                "background-position: top left;" +
                "background-repeat: repeat;" +
                "background-size: 16px 16px;"

            this.canvasBackground.initView("canvasBackground");
            v.attach(this.canvasBackground);

            this.canvas.getDefaultStyle().bounds = new Bounds(-4800,-4800,9600,9600);
            this.canvas.fills = [];
            this.canvas.extraCss = "overflow: hidden;"
            this.canvas.initView(this.id + ".canvas");
            v.attach(this.canvas);

            this.canvasFront.boundsForView = function (parentBounds) {
                return new Bounds(
                    20,
                    20,
                    NUConvertToPixel(parentBounds.width).amount - 20,
                    NUConvertToPixel(parentBounds.height).amount - 20
                );
            }
            this.canvasFront.fills = [];
            this.canvasFront.extraCss = "overflow: hidden;";
            this.canvasFront.initView(this.id + ".canvasFront");
            v.attach(this.canvasFront);

            this.horizontalRuler.pxBoundsForView = function(parentBounds: PXBounds): PXBounds {
                return {
                    x: 20,
                    y: 0,
                    width: parentBounds.width - 20,
                    height: 20,
                    unit: "px",
                    position: "absolute"
                };
            };
            this.horizontalRuler.overflow = "hidden";
            this.horizontalRuler.initView("horizontalRuler");
            v.attach(this.horizontalRuler);

            this.verticalRuler.pxBoundsForView = function(parentBounds: PXBounds): PXBounds {
                return {
                    x: 0,
                    y: 20,
                    width: 20,
                    height: parentBounds.height - 20,
                    unit: "px",
                    position: "absolute"
                };
            };
            this.verticalRuler.direction = Direction.vertical;
            this.verticalRuler.initView("verticalRuler");
            v.attach(this.verticalRuler);

        }
        v.overflow = 'hidden';
        v.extracss = 'contain:strict;';
        let settingBackgroundColor = Session.instance.environment.SystemSettings.system.find((setting) => {
            return setting.id === "app.skelet.canvas.backgroundColor";
        });
        v.fills = [{active: true, type: 'color', blendMode: 'normal', value: settingBackgroundColor.value}];

        return v;
    }


    viewControllerWillBeDestroyed() {
        this.canvas.getDiv().vcRef = null;
        this.canvas.getDiv().onscroll = null;

        this.viewCanvasDelegate.canvasViewRef = undefined;
        this.viewCanvasDelegate.horizontalRulerRef = undefined;
        this.viewCanvasDelegate.verticalRulerRef = undefined;
        //Application.instance.deregisterForNotification("noticeWorkspaceLoaded", this.id);
        Application.instance.deregisterForNotification("kRedrawSubView", this.id);
        Application.instance.deregisterForNotification("noticeKeyUp", this.id);
        Application.instance.deregisterForNotification("noticeKeyDown", this.id);
        Application.instance.deregisterForNotification("noticeZoomChanged", this.id);
        Application.instance.deregisterForNotification("noticeRedrawUserComponent", this.id);
        Application.instance.deregisterForNotification("noticeWorkspaceLoaded", this.id);
    }

    viewWasPresented() {

        if (!isDefined(this.viewCanvasDelegate)) {
            this.viewCanvasDelegate = new ViewCanvas(undefined, undefined, "", this.view, this.view, this);
        }
        this.viewCanvasDelegate.canvasViewRef = this.canvas;
        this.viewCanvasDelegate.canvasBackgroundViewRef = this.canvasBackground;
        this.viewCanvasDelegate.canvasFrontViewRef = this.canvasFront;
        this.viewCanvasDelegate.canvasViewControllerRef = this;
        this.viewCanvasDelegate.horizontalRulerRef = this.horizontalRuler;
        this.viewCanvasDelegate.verticalRulerRef = this.verticalRuler;

        //Application.instance.registerForNotification("noticeWorkspaceLoaded", this);
        Application.instance.registerForNotification("kRedrawSubView", this);
        Application.instance.registerForNotification("noticeKeyUp", this);
        Application.instance.registerForNotification("noticeKeyDown", this);
        Application.instance.registerForNotification("noticeZoomChanged", this);
        Application.instance.registerForNotification("noticeRedrawUserComponent", this);
        Application.instance.registerForNotification("noticeWorkspaceLoaded", this);


        this.canvasFront.setClickDelegate({
            onClick: function () {
                if (Session.instance.isEditingText === true) {
                    Application.instance.notifyAll(this, "noticeExitTextEditMode");
                }
                Application.instance.notifyAll(this, "noticeBodyClicked");
            }
        }, "onClick");

        this.canvasFront.getDiv().vcRef = this;
        this.canvasFront.getDiv().onscroll = function (e) {
            if (this.vcRef !== null) {
                this.vcRef.onScroll(e);
            }
        };


        this.horizontalRuler.set(0);
        this.verticalRuler.set(0);

        this.canvasFront.setWheelEvent(
            (sender: View, options) => {
                let b = this.canvasFront.getBounds("");
                let viewportW = NUConvertToPixel(b.width).amount;
                let viewportH = NUConvertToPixel(b.height).amount;

                let offset_x = 0;
                let offset_y = 0;
                if (isDefined(this.viewCanvasDelegate) && isDefined(this.viewCanvasDelegate.workspaceRef)) {
                    let origin = this.viewCanvasDelegate.workspaceRef.viewportOrigin;
                    offset_x = NUConvertToPixel(origin.x).amount;
                    offset_y = NUConvertToPixel(origin.y).amount;
                }
                let canvasX = offset_x;
                let canvasY = offset_y;

                if (options.mouseEvent.shiftKey === true) {
                    canvasX += (options.mouseEvent.deltaY>0) ? -10 : 10;
                } else {
                    canvasY += (options.mouseEvent.deltaY>0) ? 10 : -10;
                }

                canvasX = round10(canvasX, 1);
                canvasY = round10(canvasY, 1);

                if (canvasX < -4800) {
                    canvasX = -4800;
                }
                if (canvasX < -4800) {
                    canvasX = -4800;
                }
                if (canvasX + viewportW > 4800) {
                    canvasX = round10(4800 - viewportW, 1);
                }
                if (canvasY + viewportH > 4800) {
                    canvasY = round10(4800 - viewportH, 1);
                }


                this.viewCanvasDelegate.canvasScrollTo(canvasX, canvasY);



            }
        );


        this.canvasFront.setMouseDownMoveUpEvent(
            (sender, options) => {
                //console.log(`${options.x},${options.y}`);
                let offset_x = 0;
                let offset_y = 0;
                if (isDefined(this.viewCanvasDelegate) && isDefined(this.viewCanvasDelegate.workspaceRef)) {
                    let origin = this.viewCanvasDelegate.workspaceRef.viewportOrigin;
                    offset_x = NUConvertToPixel(origin.x).amount;
                    offset_y = NUConvertToPixel(origin.y).amount;
                }
                let canvasX = options.x + offset_x;
                let canvasY = options.y + offset_y;

                if (options.eventName === "down") {
                    this.viewCanvasDelegate.currentEditorMode.mouseDown(options.mouseEvent, canvasX, canvasY);
                }
                if (options.eventName === "up") {
                    this.viewCanvasDelegate.currentEditorMode.mouseUp(options.mouseEvent, canvasX, canvasY);
                }
                if (options.eventName === "move") {
                    this.viewCanvasDelegate.currentEditorMode.mouseMove(options.mouseEvent, canvasX, canvasY);
                }
            }
        );

        //this.noticeWorkspaceLoaded();

    }



    noticeZoomChanged(sender: any, zoomValue: number) {
        let scale = zoomValue / 100.0;
        this.canvas.extracss = `overflow-x: scroll; overflow-y: scroll; webkit-overflow-scrolling: touch;transform: scale(${scale});transform-origin: 0 0;`;
        this.canvas.processStyleAndRender("", []);
    }


    onScroll(e: Event) {
        if (!isDefined(this.keyValues["isScrolling"]) || this.keyValues["isScrolling" ]=== false) {
            this.keyValues["isScrolling"] = true;
            requestAnimationFrame(() => {
                this.viewCanvasDelegate.calculateAllRealViewBounds();
                this.viewCanvasDelegate.recalculateRulers();
                this.keyValues["isScrolling"] = false;
            });
        }
    }


    noticeWorkspaceLoaded() {
        //MentatJS.LayoutEditor.Code.Canvas.recalculateRulers();
        //this.viewCanvasDelegate.drawElementsOnCanvas(false);
        //this.viewCanvasDelegate.recalculateRulers();

        queueCommand(new ICOMDrawAll());
        let origin = Session.instance.currentDocument.currentWorkspace.viewportOrigin;
        this.viewCanvasDelegate.canvasScrollTo(NUConvertToPixel(origin.x).amount, NUConvertToPixel(origin.y).amount);

    }


    //onObjectClicked = onObjectClicked;
    //onObjectDoubleClicked =  onObjectDoubleClicked;




    onObjectHoveredIn(sender) {

    }




    noticeRedrawUserComponent(sender, componentID: string) {
        updateLayersFromUserComponent(componentID);
    }



    kRedrawSubView(containerNode: any, node2RedrawRef: Layer) {
        let containerView = null;
        if (isDefined(containerNode.id)) {
            containerView = this.viewCanvasDelegate.findViewRef(containerNode.id);
            if (!isDefined(containerView)) {
                console.dir(containerNode);
                throw 'could not find view with container id ' + containerNode.id;
            }
            this.viewCanvasDelegate.drawElement(node2RedrawRef, node2RedrawRef.pageLayer, {el: containerView, isView: true}, false, node2RedrawRef.type === "symbolInstance", true, false);
        } else {

            this.viewCanvasDelegate.drawElement(node2RedrawRef, node2RedrawRef.pageLayer,  {el: this.canvas, isView: true}, true, node2RedrawRef.type === "symbolInstance", true, false);
        }
        Session.instance.getCurrentCanvas().calculateAllRealViewBounds();

    }



    noticeKeyUp(sender, e) {
        if (e.srcElement.nodeName === "INPUT" || e.srcElement.nodeName === "TEXTAREA" || e.srcElement.nodeName === "SELECT") {
            //SkLogger.write("input keydown");
            return;
        }
        if (Session.instance.isEditingText === true) {
            return;
        }

        // pressing shift while dragging allow going outside of bounds
        if (e.which === 16) {
            Application.instance.shiftKeyPressed = false;
        }


        if (e.altKey === true) {
            if (e.metaKey === false) {
                Application.instance.rootView.getDiv().style.cursor = 'default';
                if (isDefined(Application.instance.keyValues["currentViewMoving"])) {
                    if (Application.instance.keyValues["currentViewMoving"].isDragging === true) {
                        // abort the copy
                        let parentNode = Session.instance.currentDocument.currentWorkspace.layersTree.find(Application.instance.keyValues["currentViewMoving"].old_node_id).parentLayer;
                        let idx = -1;
                        for (let i = 0; i < parentNode.children.length; i += 1) {
                            if (parentNode.children[i].id === Application.instance.keyValues["currentViewMoving"].old_node_id) {
                                idx = i;
                            }
                        }
                        if (idx > -1) {
                            parentNode.children.splice(idx, 1);
                        }

                        Application.instance.rootView.getDiv().style.cursor = 'default';

                        // delete the view
                        idx = -1;
                        for (let i = 0; i < this.viewCanvasDelegate.viewRefs.length; i++) {
                            if (this.viewCanvasDelegate.viewRefs[i].nodeId === Application.instance.keyValues["currentViewMoving"].old_node_id) {
                                idx = i;
                                break;
                            }
                        }
                        if (idx > -1) {
                            if (isDefined(this.viewCanvasDelegate.viewRefs[idx])) {
                                this.viewCanvasDelegate.viewRefs[idx].detachItSelf();
                            }
                            this.viewCanvasDelegate.viewRefs.splice(idx, 1);
                        }

                    }
                }
            }
        }

    }

    noticeKeyDown(sender, e) {
        //e.preventDefault();
        if (e.srcElement.nodeName === "INPUT" || e.srcElement.nodeName === "TEXTAREA" || e.srcElement.nodeName === "SELECT") {
            //SkLogger.write("input keydown");
            return;
        }

        if (e.ctrlKey === true) {

        }





    }










}