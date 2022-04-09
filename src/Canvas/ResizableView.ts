
import {
    BorderRadius,
    BorderSide,
    Bounds,
    dispatch_msg,
    isDefined,
    Logging,
    NUAdd, NUConvertToPixel, NumberWithUnit,
    NUscalarDiv,
    NUSub, px,
    View, ViewStyle
} from "mentatjs";
import {ViewResizeDelegate} from "./ViewResizeDelegate";




export class ResizableView extends View {

    temp: {
        selectedLayerOverlay: View;

        topMiddleCorner: View;
        bottomMiddleCorner: View;

        middleLeftCorner: View;
        middleRightCorner: View;

        topLeftCorner: View;
        topRightCorner: View;

        bottomLeftCorner: View;
        bottomRightCorner: View;

        rotateCenter: View;

    } = undefined;


    isResizable: boolean = false;
    isResizing: boolean = false;
    resizeDelegate?: ViewResizeDelegate = undefined;
    resizeWidth: boolean = true;
    resizeHeight: boolean = true;


    // delegate for user resizing
    viewWillBeResized(view: View) {}
    viewIsBeingResized(view: View, newBounds: Bounds, eventData: {
        event: Event,
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        mouseVelocity: {
            linear: number,
            x: number,
            y: number
        }}) {}
    viewWasResized(view: View) {}


    setLayerHeight (z: string) {
        super.setLayerHeight(z);

        if (isDefined(this.temp)) {
            if (isDefined(this.temp.selectedLayerOverlay)) {
                this.temp.selectedLayerOverlay.setLayerHeight(z);
            }
            if (isDefined(this.temp.middleLeftCorner)) {
                this.temp.middleLeftCorner.setLayerHeight(z);
            }
            if (isDefined(this.temp.middleRightCorner)) {
                this.temp.middleRightCorner.setLayerHeight(z);
            }
            if (isDefined(this.temp.topMiddleCorner)) {
                this.temp.topMiddleCorner.setLayerHeight(z);
            }
            if (isDefined(this.temp.bottomMiddleCorner)) {
                this.temp.bottomMiddleCorner.setLayerHeight(z);
            }

            if (isDefined(this.temp.topLeftCorner)) {
                this.temp.topLeftCorner.setLayerHeight(z);
            }
            if (isDefined(this.temp.topRightCorner)) {
                this.temp.topRightCorner.setLayerHeight(z);
            }
            if (isDefined(this.temp.bottomLeftCorner)) {
                this.temp.bottomLeftCorner.setLayerHeight(z);
            }
            if (isDefined(this.temp.bottomRightCorner)) {
                this.temp.bottomRightCorner.setLayerHeight(z);
            }
        }

    }




    doResize () {
        let i: number = 0;

        this.invalidateBounds();

        const newBounds: Bounds = this.getBounds("");

        this.bounds = newBounds;
        this.resize(newBounds);

        if (this.subViews === undefined) { this.subViews = []; }

        for (i = 0; i < this.subViews.length; i += 1) {
            this.subViews[i].doResize();
        }

        // resize resize bars
        if (this.temp !== undefined) {
            dispatch_msg(this, ["temp", "selectedLayerOverlay"], "doResize");
            if (this.resizeWidth) {
                dispatch_msg(this, ["temp", "middleLeftCorner"], "doResize");
                dispatch_msg(this, ["temp", "middleRightCorner"], "doResize");
            }
            if (this.resizeHeight) {
                dispatch_msg(this, ["temp", "topMiddleCorner"], "doResize");
                dispatch_msg(this, ["temp", "bottomMiddleCorner"], "doResize");
            }
            if ((this.resizeWidth) && (this.resizeHeight)) {
                dispatch_msg(this, ["temp", "topLeftCorner"], "doResize");
                dispatch_msg(this, ["temp", "topRightCorner"], "doResize");
                dispatch_msg(this, ["temp", "bottomLeftCorner"], "doResize");
                dispatch_msg(this, ["temp", "bottomRightCorner"], "doResize");
            }
        }

        if (isDefined(this.wasResized)) {
            this.wasResized(newBounds);
        }

    }


    doResizeFrameOnly () {
        try {

            this.invalidateBounds();

            const newBounds: Bounds = this.getBounds("");

            this.resize(newBounds);

            if (this.subViews === undefined) {
                this.subViews = [];
            }

            // resize resize bars
            if (this.temp !== undefined) {
                dispatch_msg(this, ["temp", "selectedLayerOverlay"], "doResize");
                if (this.resizeWidth) {
                    dispatch_msg(this, ["temp", "middleLeftCorner"], "doResize");
                    dispatch_msg(this, ["temp", "middleRightCorner"], "doResize");
                }
                if (this.resizeHeight) {
                    dispatch_msg(this, ["temp", "topMiddleCorner"], "doResize");
                    dispatch_msg(this, ["temp", "bottomMiddleCorner"], "doResize");
                }
                if ((this.resizeWidth) && (this.resizeHeight)) {
                    dispatch_msg(this, ["temp", "topLeftCorner"], "doResize");
                    dispatch_msg(this, ["temp", "topRightCorner"], "doResize");
                    dispatch_msg(this, ["temp", "bottomLeftCorner"], "doResize");
                    dispatch_msg(this, ["temp", "bottomRightCorner"], "doResize");
                }
            }


            if (isDefined(this.wasResized)) {
                this.wasResized(newBounds);
            }
        } catch (e) {
            //console.warn("Could not resize view: " + this.id);
            //console.warn("switch logging on to throw");
            if (Logging.enableLogging) {
                throw e;
            }
        }


    }


    detachItSelf() {
        if (!isDefined(this.parentView)) {
            if (this.isResizing) {
                this.setResizing(false);
            }
        }
        super.detachItSelf();
    }



    setResizeHandles(visible: boolean) {
        if (visible) {
            if (isDefined(this.temp)) {
                if (this.resizeHeight) {
                    if (isDefined(this.temp.topMiddleCorner)) {
                        this.temp.topMiddleCorner.setVisible(true);
                    }
                    if (isDefined(this.temp.bottomMiddleCorner)) {
                        this.temp.bottomMiddleCorner.setVisible(true);
                    }
                }
                if (this.resizeWidth) {
                    if (isDefined(this.temp.middleLeftCorner)) {
                        this.temp.middleLeftCorner.setVisible(true);
                    }
                    if (isDefined(this.temp.middleRightCorner)) {
                        this.temp.middleRightCorner.setVisible(true);
                    }
                }
                if ((this.resizeWidth) && (this.resizeHeight)) {
                    if (isDefined(this.temp.topLeftCorner)) {
                        this.temp.topLeftCorner.setVisible(true);
                    }
                    if (isDefined(this.temp.topRightCorner)) {
                        this.temp.topRightCorner.setVisible(true);
                    }
                    if (isDefined(this.temp.bottomLeftCorner)) {
                        this.temp.bottomLeftCorner.setVisible(true);
                    }
                    if (isDefined(this.temp.bottomRightCorner)) {
                        this.temp.bottomRightCorner.setVisible(true);
                    }
                }
            }
        } else {
            if (isDefined(this.temp)) {
                if (this.resizeHeight) {
                    if (isDefined(this.temp.topMiddleCorner)) {
                        this.temp.topMiddleCorner.setVisible(false);
                    }
                    if (isDefined(this.temp.bottomMiddleCorner)) {
                        this.temp.bottomMiddleCorner.setVisible(false);
                    }
                }
                if (this.resizeWidth) {
                    if (isDefined(this.temp.middleLeftCorner)) {
                        this.temp.middleLeftCorner.setVisible(false);
                    }
                    if (isDefined(this.temp.middleRightCorner)) {
                        this.temp.middleRightCorner.setVisible(false);
                    }
                }
                if ((this.resizeWidth) && (this.resizeHeight)) {
                    if (isDefined(this.temp.topLeftCorner)) {
                        this.temp.topLeftCorner.setVisible(false);
                    }
                    if (isDefined(this.temp.topRightCorner)) {
                        this.temp.topRightCorner.setVisible(false);
                    }
                    if (isDefined(this.temp.bottomLeftCorner)) {
                        this.temp.bottomLeftCorner.setVisible(false);
                    }
                    if (isDefined(this.temp.bottomRightCorner)) {
                        this.temp.bottomRightCorner.setVisible(false);
                    }
                }
            }
        }
    }

    setHovering(bool: boolean) {
        if (this.isDOMHovering === bool) {
            return;
        }
        this.isDOMHovering = bool;

        if (!isDefined(this.parentView)) {
            console.warn("view has no parentView, resizing is not possible");
            this.isResizing = false;
            return;
        }
        if (bool) {
            if (isDefined(this.temp)) {
                this.setResizing(false);
            }
            this.temp = {
                selectedLayerOverlay: undefined,
                bottomLeftCorner: undefined,
                bottomMiddleCorner: undefined,
                bottomRightCorner: undefined,
                middleLeftCorner: undefined,
                middleRightCorner: undefined,
                rotateCenter: undefined,
                topLeftCorner: undefined,
                topMiddleCorner: undefined,
                topRightCorner: undefined
            };
            let selectionColor = "rgba(24, 144, 255, 1.0)";
            this.temp.selectedLayerOverlay = new View();
            this.temp.selectedLayerOverlay.dontCacheStyle = true;
            this.temp.selectedLayerOverlay.keyValues.viewRef = this;
            this.temp.selectedLayerOverlay.boundsForView = function (parentBounds: Bounds) {
                this.keyValues.viewRef.getBounds("");
                return new Bounds(this.keyValues.viewRef.bounds.x, this.keyValues.viewRef.bounds.y, this.keyValues.viewRef.bounds.width, this.keyValues.viewRef.bounds.height);
            };
            this.temp.selectedLayerOverlay.fills = [];
            this.temp.selectedLayerOverlay.borders = [{active: true, pattern:'solid', thickness: 1, value: selectionColor, side: BorderSide.all}];
            this.temp.selectedLayerOverlay.applyClickThrough = true;
            this.temp.selectedLayerOverlay.initView(this.id + ".selectedLayerOverlay");
            this.parentView!.attach(this.temp.selectedLayerOverlay);
        } else {
            this.setResizing(false);
        }

    }

    setResizing(bool: boolean) {
        this.isResizing = bool;

        if (!isDefined(this.parentView)) {
            console.warn("view has no parentView, resizing is not possible");
            this.isResizing = false;
            return;
        }
        if (this.isResizing) {

            if (isDefined(this.temp)) {
                if (isDefined(this.temp.selectedLayerOverlay)) {
                    this.temp.selectedLayerOverlay?.detachItSelf();
                    delete this.temp.selectedLayerOverlay;
                }

                if (isDefined(this.temp.topMiddleCorner)) {
                    this.temp.topMiddleCorner?.detachItSelf();
                    delete this.temp.topMiddleCorner;
                }
                if (isDefined(this.temp.bottomMiddleCorner)) {
                    this.temp.bottomMiddleCorner?.detachItSelf();
                    this.temp.bottomMiddleCorner = undefined;
                }
                if (isDefined(this.temp.middleLeftCorner)) {
                    this.temp.middleLeftCorner?.detachItSelf();
                    this.temp.middleLeftCorner = undefined;
                }
                if (isDefined(this.temp.middleRightCorner)) {
                    this.temp.middleRightCorner?.detachItSelf();
                    this.temp.middleRightCorner = undefined;
                }
                if (isDefined(this.temp.topLeftCorner)) {
                    this.temp.topLeftCorner?.detachItSelf();
                    this.temp.topLeftCorner = undefined;
                }
                if (isDefined(this.temp.topRightCorner)) {
                    this.temp.topRightCorner?.detachItSelf();
                    this.temp.topRightCorner = undefined;
                }
                if (isDefined(this.temp.bottomLeftCorner)) {
                    this.temp.bottomLeftCorner?.detachItSelf();
                    this.temp.bottomLeftCorner = undefined;
                }
                if (isDefined(this.temp.bottomRightCorner)) {
                    this.temp.bottomRightCorner?.detachItSelf();
                    this.temp.bottomRightCorner = undefined;
                }
                if (isDefined(this.temp.rotateCenter)) {
                    this.temp.rotateCenter?.detachItSelf();
                    this.temp.rotateCenter = undefined;
                }

            }

            this.temp = {
                selectedLayerOverlay: undefined,
                bottomLeftCorner: undefined,
                bottomMiddleCorner: undefined,
                bottomRightCorner: undefined,
                middleLeftCorner: undefined,
                middleRightCorner: undefined,
                rotateCenter: undefined,
                topLeftCorner: undefined,
                topMiddleCorner: undefined,
                topRightCorner: undefined
            };

            let selectionColor = "rgba(24, 144, 255, 1.0)";

            this.temp.selectedLayerOverlay = new View();
            this.temp.selectedLayerOverlay.keyValues.viewRef = this;
            this.temp.selectedLayerOverlay.dontCacheStyle = true;
            this.temp.selectedLayerOverlay.boundsForView = function (parentBounds: Bounds) {
                this.keyValues.viewRef.getBounds("");
                return new Bounds(this.keyValues.viewRef.bounds.x, this.keyValues.viewRef.bounds.y, this.keyValues.viewRef.bounds.width, this.keyValues.viewRef.bounds.height);
            };
            this.temp.selectedLayerOverlay.fills = [];
            this.temp.selectedLayerOverlay.borders = [{active: true, pattern:'solid', thickness: 1, value: selectionColor, side: BorderSide.all}];
            this.temp.selectedLayerOverlay.applyClickThrough = true;
            this.temp.selectedLayerOverlay.initView(this.id + ".selectedLayerOverlay");
            this.parentView!.attach(this.temp.selectedLayerOverlay);


            if (this.resizeHeight) {
                const topMiddle = new View();
                topMiddle.dontCacheStyle = true;
                topMiddle.keyValues.corner = "topMiddle";
                topMiddle.keyValues.viewRef = this;
                topMiddle.borderRadius = new BorderRadius(4,4,4,4);
                topMiddle["boundsForView"] = function (parentBounds: Bounds): Bounds {
                    let clientBounds: Bounds = undefined;
                    if (isDefined(this.keyValues.viewRef) && isDefined(this.keyValues.viewRef.realBounds)) {
                        clientBounds = this.keyValues.viewRef.realBounds;
                    } else {
                        clientBounds = this.keyValues.viewRef.getBounds("");
                    }

                    return {
                        kind: "Bounds",
                        x: NUSub(NUAdd(clientBounds.x, NUscalarDiv(clientBounds.width, 2)), new NumberWithUnit(4, "px")),
                        y: NUSub(clientBounds.y, new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: new NumberWithUnit(0, "deg"),
                        elevation: new NumberWithUnit(0, "auto")
                    };
                };
                topMiddle.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                topMiddle.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                topMiddle.cursor = 'row-resize';
                topMiddle.zIndex = '999';
                topMiddle.initView(this.id + ".topMiddleCorner");
                this.parentView!.attach(topMiddle);

                this.temp.topMiddleCorner = topMiddle;
                topMiddle.dragDelegate = topMiddle;
                topMiddle.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                topMiddle.viewIsBeingDragged = function (view: View, newPosition: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = view.keyValues.viewRef.bounds.width;
                    const newHeight = px(NUConvertToPixel(view.keyValues.viewRef.bounds.height).amount - newPosition.y - NUConvertToPixel(view.keyValues.viewRef.bounds.y).amount);

                    const viewNewBounds: Bounds = {
                        kind: "Bounds",
                        x: view.keyValues.viewRef.bounds.x,
                        y: px(newPosition.y),
                        width: newWidth,
                        height: newHeight,
                        unit: 'px',
                        position: view.keyValues.viewRef.bounds.position,
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, newPosition);
                        }
                    }
                };
                topMiddle.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                //topMiddle.setDraggable(true);

                const bottomMiddle = new View();
                bottomMiddle.dontCacheStyle = true;
                bottomMiddle.keyValues.corner = "bottomMiddle";
                bottomMiddle.keyValues.viewRef = this;
                bottomMiddle.borderRadius = new BorderRadius(4,4,4,4);
                bottomMiddle["boundsForView"] = function (parentBounds: Bounds): Bounds {
                    let b = this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(NUAdd(b.x, NUscalarDiv(b.width, 2)), new NumberWithUnit(4, "px")),
                        y: NUSub(NUAdd(b.y, b.height), new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: b.rotation,
                        elevation: b.elevation
                    };
                };
                bottomMiddle.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                bottomMiddle.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                bottomMiddle.cursor = 'row-resize';
                bottomMiddle.zIndex = '999';
                bottomMiddle.initView(this.id + ".bottomMiddleCorner");
                this.parentView!.attach(bottomMiddle);
                this.temp.bottomMiddleCorner = bottomMiddle;
                bottomMiddle.dragDelegate = bottomMiddle;
                bottomMiddle.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                bottomMiddle.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = view.keyValues.viewRef.bounds.width;
                    const newHeight = px(options!.y - NUConvertToPixel(view.keyValues.viewRef.bounds.y).amount);

                    const viewNewBounds = {
                        x: view.keyValues.viewRef.bounds.x,
                        y: view.keyValues.viewRef.bounds.y,
                        width: newWidth,
                        height: newHeight,
                        unit: view.keyValues.viewRef.bounds.unit,
                        position: view.keyValues.viewRef.bounds.position,
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                bottomMiddle.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // bottomMiddle.setDraggable(true);


            }

            if (this.resizeWidth) {
                const middleLeft = new View();
                middleLeft.dontCacheStyle = true;
                middleLeft.keyValues.corner = "middleLeft";
                middleLeft.keyValues.viewRef = this;
                middleLeft.borderRadius = new BorderRadius(4,4,4,4);
                middleLeft["boundsForView"] = function (parentBounds: Bounds): Bounds {
                    let b = this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(b.x, new NumberWithUnit(4, "px")),
                        y: NUSub(NUAdd(b.y, NUscalarDiv(b.height, 2)),  new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute'
                    };
                };
                middleLeft.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                middleLeft.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                middleLeft.cursor = 'col-resize';
                middleLeft.zIndex = '999';
                middleLeft.initView(this.id + ".middleLeftCorner");
                this.parentView!.attach(middleLeft);
                this.temp.middleLeftCorner = middleLeft;
                middleLeft.dragDelegate = middleLeft;
                middleLeft.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                middleLeft.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = px(NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount - options!.x - NUConvertToPixel(view.keyValues.viewRef.bounds.x).amount);
                    const newHeight = view.keyValues.viewRef.bounds.height;

                    const viewNewBounds = {
                        x: px(options!.x),
                        y: view.keyValues.viewRef.bounds.y,
                        width: newWidth,
                        height: newHeight,
                        unit: "px",
                        position: 'absolute',
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                middleLeft.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // middleLeft.setDraggable(true);


                const middleRight = new View();
                middleRight.dontCacheStyle = true;
                middleRight.keyValues.corner = "middleRight";
                middleRight.keyValues.viewRef = this;
                middleRight.borderRadius = new BorderRadius(4,4,4,4);
                middleRight["boundsForView"] = function (parentBounds: Bounds): Bounds {
                    let b = this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(NUAdd(this.keyValues.viewRef.bounds.x,this.keyValues.viewRef.bounds.width), new NumberWithUnit(4, "px")),
                        y: NUSub(NUAdd(this.keyValues.viewRef.bounds.y, NUscalarDiv(this.keyValues.viewRef.bounds.height, 2)), new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: b.rotation,
                        elevation: b.elevation
                    };
                };
                middleRight.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                middleRight.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                middleRight.cursor = 'col-resize';
                middleRight.zIndex = '999';
                middleRight.initView(this.id + ".middleRightCorner");
                this.parentView!.attach(middleRight);

                this.temp.middleRightCorner = middleRight;
                middleRight.dragDelegate = middleRight;
                middleRight.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                middleRight.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = px(NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount + options!.x - ( NUConvertToPixel(view.keyValues.viewRef.bounds.x).amount + NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount));
                    const newHeight = view.keyValues.viewRef.bounds.height;

                    const viewNewBounds = {
                        x: view.keyValues.viewRef.bounds.x,
                        y: view.keyValues.viewRef.bounds.y,
                        width: newWidth,
                        height: newHeight,
                        unit: "px",
                        position: 'absolute',
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                middleRight.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // middleRight.setDraggable(true);
            }


            if ((this.resizeWidth) && (this.resizeHeight)) {
                // top
                const topleft = new View();
                topleft.dontCacheStyle = true;
                topleft.keyValues.corner = "topleft";
                topleft.keyValues.viewRef = this;
                topleft.borderRadius = new BorderRadius(4,4,4,4);
                topleft["boundsForView"] = function (parentBounds: Bounds) {
                    let b= this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(b.x, new NumberWithUnit(4, "px")),
                        y: NUSub(b.y, new NumberWithUnit( 4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: b.rotation,
                        elevation: b.elevation
                    };
                };
                topleft.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                topleft.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                topleft.cursor = 'nw-resize';
                topleft.zIndex = '999';
                topleft.initView(this.id + ".topLeftCorner");
                this.parentView!.attach(topleft);

                this.temp.topLeftCorner = topleft;
                topleft.dragDelegate = topleft;
                topleft.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                topleft.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = px(NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount - options!.x - NUConvertToPixel(view.keyValues.viewRef.bounds.x).amount);
                    const newHeight = px(NUConvertToPixel(view.keyValues.viewRef.bounds.height).amount - options!.y - NUConvertToPixel(view.keyValues.viewRef.bounds.y).amount);

                    const viewNewBounds = {
                        x: px(options.x),
                        y: px(options.y),
                        width: newWidth,
                        height: newHeight,
                        unit: "px",
                        position: 'absolute',
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                topleft.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // topleft.setDraggable(true);


                const topRight = new View();
                topRight.dontCacheStyle = true;
                topRight.keyValues.corner = "topMiddle";
                topRight.keyValues.viewRef = this;
                topRight.borderRadius = new BorderRadius(4,4,4,4);
                topRight["boundsForView"] = function (parentBounds: Bounds) {
                    let b = this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(NUAdd(b.x, b.width), new NumberWithUnit(4, "px")),
                        y: NUSub(b.y, new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: b.rotation,
                        elevation: b.elevation
                    };
                };
                topRight.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                topRight.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                topRight.cursor = 'ne-resize';
                topRight.zIndex = '999';
                topRight.initView(this.id + ".topRightCorner");
                this.parentView!.attach(topRight);
                this.temp.topRightCorner = topRight;
                topRight.dragDelegate = topRight;
                topRight.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                topRight.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = px(NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount + (options!.x - ( NUConvertToPixel(view.keyValues.viewRef.bounds.x).amount + NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount)));
                    const newHeight = px(NUConvertToPixel(view.keyValues.viewRef.bounds.height).amount + ( options!.y - NUConvertToPixel(view.keyValues.viewRef.bounds.y).amount));

                    const viewNewBounds = {
                        x: view.keyValues.viewRef.bounds.x,
                        y: px(options!.y),
                        width: newWidth,
                        height: newHeight,
                        unit: 'px',
                        position: 'absolute',
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                topRight.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // topRight.setDraggable(true);

                const bottomLeft = new View();
                bottomLeft.dontCacheStyle = true;
                bottomLeft.keyValues.corner = "bottomLeft";
                bottomLeft.keyValues.viewRef = this;
                bottomLeft.borderRadius = new BorderRadius(4,4,4,4);
                bottomLeft["boundsForView"] = function (parentBounds: Bounds): Bounds {
                    let b = this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(b.x, new NumberWithUnit(4, "px")),
                        y: NUSub(NUAdd(b.y, b.height),  new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: b.rotation,
                        elevation: b.elevation
                    };
                };
                bottomLeft.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                bottomLeft.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                bottomLeft.cursor = 'sw-resize';
                bottomLeft.zIndex = '999';
                bottomLeft.initView(this.id + ".bottomLeftCorner");
                this.parentView!.attach(bottomLeft);

                this.temp.bottomLeftCorner = bottomLeft;
                bottomLeft.dragDelegate = bottomLeft;
                bottomLeft.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                bottomLeft.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = px(NUConvertToPixel(view.keyValues.viewRef.bounds.x).amount +  NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount - options!.x);
                    const newHeight = px(options!.y - NUConvertToPixel(view.keyValues.viewRef.bounds.y).amount);

                    const viewNewBounds = {
                        x: px(options!.x),
                        y: view.keyValues.viewRef.bounds.y,
                        width: newWidth,
                        height: newHeight,
                        unit: 'px',
                        position: 'absolute',
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                bottomLeft.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // bottomLeft.setDraggable(true);


                const bottomRight = new View();
                bottomRight.dontCacheStyle = true;
                bottomRight.keyValues.corner = "bottomRight";
                bottomRight.keyValues.viewRef = this;
                bottomRight.borderRadius = new BorderRadius(4,4,4,4);
                bottomRight["boundsForView"] = function (parentBounds: Bounds): Bounds {
                    let b = this.keyValues.viewRef.getBounds("");
                    return {
                        kind: "Bounds",
                        x: NUSub(NUAdd(b.x, b.width), new NumberWithUnit(4, "px")),
                        y: NUSub(NUAdd(b.y, b.height), new NumberWithUnit(4, "px")),
                        width: new NumberWithUnit(8, "px"),
                        height: new NumberWithUnit(8, "px"),
                        unit: 'px',
                        position: 'absolute',
                        rotation: b.rotation,
                        elevation: b.elevation
                    };
                };
                bottomRight.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(255,255,255)'}];
                bottomRight.borders = [{active: true, thickness: 1, pattern: 'solid', value: selectionColor, side: BorderSide.all}];
                bottomRight.cursor = 'se-resize';
                bottomRight.zIndex = '999';
                bottomRight.initView(this.id + ".bottomRightCorner");
                this.parentView!.attach(bottomRight);
                this.temp.bottomRightCorner = bottomRight;
                bottomRight.dragDelegate = bottomRight;
                bottomRight.viewWillBeDragged = function (parentView: View, options?: {event: Event}) {
                    if (this.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(this.keyValues.viewRef.resizeDelegate["viewWillBeResized"])) {
                            return this.keyValues.viewRef.resizeDelegate["viewWillBeResized"](this.keyValues.viewRef);
                        }
                    }
                };
                bottomRight.viewIsBeingDragged = function (view: View, options?: {
                    event: Event,
                    x: number,
                    y: number,
                    offsetX: number,
                    offsetY: number,
                    mouseVelocity: {
                        linear: number,
                        x: number,
                        y: number
                    }
                }) {
                    const newWidth = px(NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount + options!.x - (NUConvertToPixel(view.keyValues.viewRef.bounds.x).amount + NUConvertToPixel(view.keyValues.viewRef.bounds.width).amount))
                    const newHeight = px(options!.y - NUConvertToPixel(view.keyValues.viewRef.bounds.y).amount);

                    const viewNewBounds = {
                        x: view.keyValues.viewRef.bounds.x,
                        y: view.keyValues.viewRef.bounds.y,
                        width: newWidth,
                        height: newHeight,
                        unit: 'px',
                        position: 'absolute',
                        rotation: view.keyValues.viewRef.bounds.rotation,
                        elevation: view.keyValues.viewRef.bounds.elevation
                    };

                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewIsBeingResized"](view.keyValues.viewRef, viewNewBounds, options);
                        }
                    }
                };
                bottomRight.viewWasDragged = function (view: View, options?: any) {
                    if (view.keyValues.viewRef.resizeDelegate !== undefined) {
                        if (isDefined(view.keyValues.viewRef.resizeDelegate["viewWasResized"])) {
                            view.keyValues.viewRef.resizeDelegate["viewWasResized"](view.keyValues.viewRef);
                        }
                    }
                };
                // bottomRight.setDraggable(true);


            }

            /*
                        let rotateCenter = new View();
                        rotateCenter.keyValues["corner"] = "rotateCenter";
                        rotateCenter.keyValues["viewRef"] = this;
                        //rotateCenter.borderRadius = new BorderRadius(8,8,8,8);
                        rotateCenter["boundsForView"] = function (parentBounds: Bounds): Bounds {
                            let b = this.keyValues.viewRef.getBounds("");
                            let bx = NUConvertToPixel(b.x);
                            let by = NUConvertToPixel(b.y);
                            let bw = NUConvertToPixel(b.width);
                            let bh = NUConvertToPixel(b.height);
                            return {
                                x: px(bx.amount + (bw.amount / 2) - 14 / 2),
                                y: px(by.amount + (bh.amount / 2) - 14 / 2),
                                width: new NumberWithUnit(14, "px"),
                                height: new NumberWithUnit(14, "px"),
                                unit: 'px',
                                position: 'absolute',
                                rotation: new NumberWithUnit(0, "deg"),
                                elevation: new NumberWithUnit(0, "auto")
                            };
                        };
                        rotateCenter.viewWasAttached = function () {

                            let color = "rgb(50,190, 50)";

                            let circle = new View();
                            circle.borderRadius = new BorderRadius(4,4,4,4);
                            circle.fills = [new Fill(true, "color", "normal", "rgb(255,255,255)")];
                            circle.borders = [new Border(true, 1, "solid", color)];
                            circle.boundsForView = function (parentBounds) {
                                return {
                                    x: px(14 / 2 - 8 / 2),
                                    y: px( 14 / 2 - 8 / 2),
                                    width: px(8),
                                    height: px(8),
                                    unit: 'px',
                                    position: 'absolute',
                                    rotation: new NumberWithUnit(0, "deg"),
                                    elevation: new NumberWithUnit(0, "auto")
                                };
                            }
                            circle.initView(generateV4UUID());
                            this.attach(circle);


                        }
                        rotateCenter.fills = [];
                        rotateCenter.borders = []; // {active: true, thickness: 1, pattern: 'solid', value: selectionColor}];
                        rotateCenter.cursor = 'se-resize';
                        rotateCenter.initView(this.id + ".rotateCenter");
                        this.parentView!.attach(rotateCenter);
                        this.temp.rotateCenter = rotateCenter;
             */



        } else {
            if (isDefined(this.temp)) {
                if (isDefined(this.temp.selectedLayerOverlay)) {
                    this.temp.selectedLayerOverlay?.detachItSelf();
                    delete this.temp.selectedLayerOverlay;
                }

                if (isDefined(this.temp.topMiddleCorner)) {
                    this.temp.topMiddleCorner?.detachItSelf();
                    delete this.temp.topMiddleCorner;
                }
                if (isDefined(this.temp.bottomMiddleCorner)) {
                    this.temp.bottomMiddleCorner?.detachItSelf();
                    this.temp.bottomMiddleCorner = undefined;
                }
                if (isDefined(this.temp.middleLeftCorner)) {
                    this.temp.middleLeftCorner?.detachItSelf();
                    this.temp.middleLeftCorner = undefined;
                }
                if (isDefined(this.temp.middleRightCorner)) {
                    this.temp.middleRightCorner?.detachItSelf();
                    this.temp.middleRightCorner = undefined;
                }
                if (isDefined(this.temp.topLeftCorner)) {
                    this.temp.topLeftCorner?.detachItSelf();
                    this.temp.topLeftCorner = undefined;
                }
                if (isDefined(this.temp.topRightCorner)) {
                    this.temp.topRightCorner?.detachItSelf();
                    this.temp.topRightCorner = undefined;
                }
                if (isDefined(this.temp.bottomLeftCorner)) {
                    this.temp.bottomLeftCorner?.detachItSelf();
                    this.temp.bottomLeftCorner = undefined;
                }
                if (isDefined(this.temp.bottomRightCorner)) {
                    this.temp.bottomRightCorner?.detachItSelf();
                    this.temp.bottomRightCorner = undefined;
                }
                if (isDefined(this.temp.rotateCenter)) {
                    this.temp.rotateCenter?.detachItSelf();
                    this.temp.rotateCenter = undefined;
                }
                delete this.temp;
            }
        }

    }


    toggleResize() {
        if (this.isResizable) {
            this.isResizing = !this.isResizing;
            this.setResizing(this.isResizing);
        }
        return this.isResizing;
    }


    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        if (isDefined(this.temp)) {
            if (isDefined(this.temp.selectedLayerOverlay)) {
                this.temp.selectedLayerOverlay.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.middleLeftCorner)) {
                this.temp.middleLeftCorner.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.middleRightCorner)) {
                this.temp.middleRightCorner.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.topMiddleCorner)) {
                this.temp.topMiddleCorner.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.bottomMiddleCorner)) {
                this.temp.bottomMiddleCorner.processStyleAndRender("", []);
            }

            if (isDefined(this.temp.topLeftCorner)) {
                this.temp.topLeftCorner.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.topRightCorner)) {
                this.temp.topRightCorner.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.bottomLeftCorner)) {
                this.temp.bottomLeftCorner.processStyleAndRender("", []);
            }
            if (isDefined(this.temp.bottomRightCorner)) {
                this.temp.bottomRightCorner.processStyleAndRender("", []);
            }

            if (isDefined(this.temp.rotateCenter)) {
                this.temp.rotateCenter.processStyleAndRender("", []);
            }
        }

    }


}