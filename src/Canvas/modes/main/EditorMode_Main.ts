
import {QueueLimiter} from "flowbreaker";
import {EditorMode} from "../EditorMode";
import {ILayoutEditorView} from "../../../Layer/ILayoutEditorView";
import {
    Application,
    Border,
    BorderRadius, Bounds, dispatch_msg,
    Fill,
    generateV4UUID, isDefined,
    NUConvertToPixel,
    NumberWithUnit,
    px,
    safeCopy, View
} from "mentatjs";
import {ViewCanvas} from "../../ViewCanvas";
import {setTool} from "../../setTool";
import {LayerView} from "../../../Layer/LayerView";
import {generateKeyboardShortcutIcon} from "../../../Shortcuts/generateKeyboardShortcutIcon";
import {kNotifications} from "../../../Session/kNotifications";
import {DragPayload} from "../../DragPayload";
import {nodesBounds_overlap} from "../../nodesBounds_overlap";
import {electronRefreshWorkspaceMenu} from "../../../Workspace/electronRefreshWorkspaceMenu";
import {calculateBounds} from "../../../Layer/calculateBounds";
import {Layer} from "../../../Layer/Layer";
import {ResizableView} from "../../ResizableView";
import {ActionBarController} from "../../../ActionBars/ActionBarController";
import {Session} from "../../../Session/Session";
import {CanvasEventInfo} from "../CanvasEventInfo";
import {SkeletControl} from "../../../Plugin/SkeletControl";
import {findControlForClassName} from "../../../Plugin/findControlForClassName";



export class EditorMode_Main extends EditorMode {

    isPanning: boolean = false;
    isLasso: boolean = false;
    actionCandidate: 'unknown' | 'pan' | 'select' | 'drag' | 'lasso' | 'dragSwapHandle' | 'dragResizeHandle' = 'unknown';
    lassoViewRef: View = undefined;


    private batchCounter: number = 0;
    private queueSendMouseInfo: QueueLimiter;

    dragSwapHandleInfo : {
        layer: Layer,
        layerView: ILayoutEditorView & View,
        swapHandle: View,
        swapPlaceholder: View,
        viewDeltaX: number,
        viewDeltaY: number,
        bounds: Bounds,
        viewOriginalBounds: Bounds
    } = undefined;


    dragResizeHandleInfo: {
        side: 'topLeftCorner' | 'bottomLeftCorner' | 'bottomMiddleCorner' | 'bottomRightCorner' |
            'middleLeftCorner' | 'middleRightCorner' | 'topMiddleCorner' | 'topRightCorner';
        selectionView: ResizableView;
        handle: View;
    } = undefined;


    dragPayload: DragPayload = undefined;

    dragInfo: {
        dx: number,
        dy: number,
        x_off_start: number,
        y_off_start: number,
        mouseDownTime: number,
        lastMouseDownTime: number,
        layer: Layer,
        layerCalculatedBounds: Bounds,
        parentLayer: Layer,
        parentLayerCalculatedBounds: Bounds,
        view: ILayoutEditorView & View
    } = {
        dx: 0,
        dy: 0,
        x_off_start: 0,
        y_off_start: 0,
        mouseDownTime: 0,
        lastMouseDownTime: 0,
        layer: undefined,
        layerCalculatedBounds: undefined,
        parentLayer: undefined,
        parentLayerCalculatedBounds: undefined,
        view: undefined
    };



    constructor(viewCanvasRef: ViewCanvas) {
        super(viewCanvasRef);
        this.queueSendMouseInfo = new QueueLimiter(1000, 100, true);

    }

    batchChanges() {
        this.batchCounter += 1;
    }

    commitChanges() {
        this.batchCounter -= 1;
        if (this.batchCounter <= 0) {
            this.batchCounter = 0;
            this.renderAlreadySelectedLayers();
            this.renderHighlight();
            this.renderSelectionLayer();
            this.renderActionBar();
        }
    }


    enteringMode(layers: Layer[], views: (ILayoutEditorView & View)[]) {
        //this.setDelegatesLoop(views, true);



    }

    exitingMode(layers: Layer[], views: (ILayoutEditorView & View)[]) {
        //this.setDelegatesLoop(views, false);
    }



    protected renderSelectionLayer() {
        if (this.viewCanvasRef.selectedLayersInfo.length > 0) {
            if (!isDefined(this.selectionView.view)) {
                let sv = new ResizableView();
                sv.dontCacheStyle = true;
                sv.boundsForView = (parentBounds: Bounds) => {
                    let x, y, w, h: number = 0;

                    let xs: number[] = [];
                    let ys: number[] = [];
                    let x2s: number[] = [];
                    let y2s: number[] = [];

                    for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
                        let lb = this.viewCanvasRef.selectedLayersInfo[i].layerAbsoluteBounds;

                        xs.push(NUConvertToPixel(lb.x).amount);
                        ys.push(NUConvertToPixel(lb.y).amount);
                        x2s.push(NUConvertToPixel(lb.x).amount + NUConvertToPixel(lb.width).amount);
                        y2s.push(NUConvertToPixel(lb.y).amount + NUConvertToPixel(lb.height).amount);
                    }

                    x = Math.min(...xs);
                    y = Math.min(...ys);
                    w = Math.max(...x2s) - x;
                    h = Math.max(...y2s) - y;

                    return new Bounds(x + 4800, y + 4800, w, h);
                }
                sv.borders = [new Border(true, 2, "solid", "rgba(15, 139, 250, 1.0)")];
                sv.zIndex = '998';
                sv.initView("EditorMode_Main.selectionView");
                sv.resizeDelegate = this;
                this.viewCanvasRef.canvasViewRef.attach(sv);
                this.selectionView.view = sv;
                this.selectionView.view.setResizing(true);
            } else {
                this.selectionView.view.invalidateBounds();
                this.selectionView.view.processStyleAndRender("", []);
                this.selectionView.view.setResizing(true);
            }
        } else {
            if (isDefined(this.selectionView.view)) {
                this.selectionView.view.setResizing(false);
                this.selectionView.view.detachItSelf();
                this.selectionView.view = undefined;
            }
        }
    }

    protected renderAlreadySelectedLayers() {

        let layerBorderColor: string = "green"; //"rgba(24, 144, 255, 1.0)";

        let processed: string[] = [];
        if (this.viewCanvasRef.selectedLayersInfo.length === 1) {
            let info = this.viewCanvasRef.selectedLayersInfo[0];
            let highlightView: { layer_id: string, view: View, swapHandle: View } = this.selectionView.placeholders.find((elem) => {
                return elem.layer_id === info.layer.id;
            });
            if (highlightView !== undefined) {
                if (isDefined(highlightView.view)) {
                    highlightView.view.detachItSelf();
                    highlightView.view = undefined;
                }
                if (isDefined(highlightView.swapHandle)) {
                    highlightView.swapHandle.detachItSelf();
                    highlightView.swapHandle = undefined;
                }
                let idx = this.selectionView.placeholders.findIndex((elem) => { return elem.layer_id === info.layer.id});
                if (idx > -1) {
                    this.selectionView.placeholders.splice(idx, 1);
                }

            }

            processed.push(info.layer.id);

        } else {
            for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
                let info = this.viewCanvasRef.selectedLayersInfo[i];
                let highlightView: { layer_id: string, view: View, swapHandle: View } = this.selectionView.placeholders.find((elem) => {
                    return elem.layer_id === info.layer.id;
                });
                if (highlightView === undefined) {

                    highlightView = {
                        layer_id: info.layer.id,
                        view: undefined,
                        swapHandle: undefined
                    };

                    highlightView.view = new View();
                    highlightView.view.keyValues["layerRef"] = info.layer;
                    highlightView.view.keyValues["absoluteBounds"] = info.layerAbsoluteBounds;
                    highlightView.view.boundsForView = function (parentBounds: Bounds): Bounds {
                        let l = this.keyValues["layerRef"] as Layer;
                        let ab = this.keyValues["absoluteBounds"] as Bounds;
                        return new Bounds(NUConvertToPixel(ab.x).amount + 4800, NUConvertToPixel(ab.y).amount + 4800,
                            NUConvertToPixel(ab.width).amount, NUConvertToPixel(ab.height).amount);
                        return ab;
                    }
                    highlightView.view.zIndex = '998';
                    highlightView.view.borders = [new Border(true, 1, 'solid', layerBorderColor)];
                    highlightView.view.initView(info.layer.id + ".highlight");
                    this.viewCanvasRef.canvasViewRef.attach(highlightView.view);

                    highlightView.swapHandle = new View();
                    highlightView.swapHandle.keyValues["layerRef"] = info.layer;
                    highlightView.swapHandle.keyValues["absoluteBounds"] = info.layerAbsoluteBounds;
                    highlightView.swapHandle.boundsForView = function (parentBounds: Bounds): Bounds {
                        let l = this.keyValues["layerRef"] as Layer;
                        let ab = this.keyValues["absoluteBounds"] as Bounds;
                        let x = NUConvertToPixel(ab.x).amount + 4800 + (NUConvertToPixel(ab.width).amount / 2) - 3;
                        let y = NUConvertToPixel(ab.y).amount + 4800 + (NUConvertToPixel(ab.height).amount / 2) - 3;
                        return new Bounds(x, y, 6, 6);
                    }
                    highlightView.swapHandle.fills = [new Fill(true, 'color', 'normal', layerBorderColor)];
                    highlightView.swapHandle.borderRadius = new BorderRadius(3, 3, 3, 3);
                    highlightView.swapHandle.zIndex = '999';
                    highlightView.swapHandle.initView(info.layer.id + ".swapHandle");
                    this.viewCanvasRef.canvasViewRef.attach(highlightView.swapHandle);
                    highlightView.swapHandle.setDragNDrop(true, info.layer.id);

                    this.selectionView.placeholders.push(highlightView);

                } else {
                    // resize
                    highlightView.view.invalidateBounds();
                    highlightView.view.processStyleAndRender("", []);
                    highlightView.swapHandle.invalidateBounds();
                    highlightView.swapHandle.processStyleAndRender("", []);
                }
                processed.push(info.layer.id);
            }
        }

        // do we have highlight to remove ?
        for (let i = this.selectionView.placeholders.length - 1; i >= 0; i -= 1) {
            if (!processed.includes(this.selectionView.placeholders[i].layer_id)) {
                this.selectionView.placeholders[i].view.detachItSelf();
                this.selectionView.placeholders[i].swapHandle.detachItSelf();
                this.selectionView.placeholders.splice(i, 1);
            }
        }


    }

    redrawSelectionAndHighlight() {
        this.renderSelectionLayer();
        this.renderHighlight();
        this.renderAlreadySelectedLayers();
        this.renderActionBar();

    }

    renderActionBar() {
        if (this.viewCanvasRef.selectedLayersInfo.length === 0) {
            if (isDefined(this.selectionView) && isDefined(this.selectionView.actionBar) && isDefined(this.selectionView.actionBar.controller)) {
                this.selectionView.actionBar.controller.hide();
            }
            return;
        }
        if (false === (isDefined(this.selectionView) && isDefined(this.selectionView.actionBar) && isDefined(this.selectionView.actionBar.controller))) {
            this.selectionView.actionBar.controller = new ActionBarController();
            this.selectionView.actionBar.controller.init(this.viewCanvasRef, this);
        } else {
            this.selectionView.actionBar.controller.show();
        }
    }

    renderHighlight() {
        let layerBorderColor: string = "red"; //"rgba(24, 144, 255, 1.0)";

        let processed: string[] = [];
        for (let i = 0; i < this.viewCanvasRef.highlightedLayersInfo.length; i += 1) {
            let info = this.viewCanvasRef.highlightedLayersInfo[i];
            let highlightView: { layer: Layer, view: View } = this.selectionView.highlights.find((elem) => { return elem.layer.id === info.layer.id; });
            if (highlightView === undefined) {

                highlightView = {
                    layer: info.layer,
                    view: undefined
                };
                highlightView.layer = info.layer;
                highlightView.view = new View();
                highlightView.view.keyValues["layerRef"] = info.layer;
                highlightView.view.keyValues["absoluteBounds"] = info.layerAbsoluteBounds;
                highlightView.view.boundsForView = function (parentBounds: Bounds): Bounds {
                    let l = this.keyValues["layerRef"] as Layer;
                    let ab = this.keyValues["absoluteBounds"] as Bounds;
                    return new Bounds(NUConvertToPixel(ab.x).amount + 4800, NUConvertToPixel(ab.y).amount + 4800,
                        NUConvertToPixel(ab.width).amount, NUConvertToPixel(ab.height).amount);
                    return ab;
                }
                highlightView.view.borders = [new Border(true, 2, 'solid', layerBorderColor)];
                highlightView.view.borderRadius = new BorderRadius(3, 3, 3, 3);
                highlightView.view.initView(info.layer.id + ".highlight");
                this.viewCanvasRef.canvasViewRef.attach(highlightView.view);

                this.selectionView.highlights.push(highlightView);

            } else {
                highlightView.view.invalidateBounds();
                highlightView.view.processStyleAndRender("", []);
            }
            processed.push(info.layer.id);
        }

        for (let i = this.selectionView.highlights.length - 1; i >= 0; i -= 1) {
            if (!processed.includes(this.selectionView.highlights[i].layer.id)) {
                this.selectionView.highlights[i].view.detachItSelf();
                this.selectionView.highlights.splice(i, 1);
            }
        }

    }



    layerRemovedFromSelection(layer: Layer, view: ILayoutEditorView & View) {
        if (this.batchCounter === 0) {
            this.renderSelectionLayer();
            this.renderHighlight();
            this.renderAlreadySelectedLayers();
            this.renderActionBar();
        }

    }

    layerAddedToSelection(layer: Layer, view: ILayoutEditorView & View) {

        if (this.batchCounter === 0) {
            this.renderSelectionLayer();
            this.renderHighlight();
            this.renderAlreadySelectedLayers();
            this.renderActionBar();
        }
    }

    layerAddedToHighlight(info: {
        layer: Layer,
        layerCalculatedBounds: Bounds,
        layerAbsoluteBounds: Bounds,
        parentLayer: Layer,
        parentLayerCalculatedBounds: Bounds,
        view: View
    }) {
        if (this.batchCounter === 0) {
            this.renderSelectionLayer();
            this.renderHighlight();
            this.renderAlreadySelectedLayers();
            this.renderActionBar();
        }
    }

    layerRemovedFromHighlight(layer: Layer, view: View) {
        if (this.batchCounter === 0) {
            this.renderSelectionLayer();
            this.renderHighlight();
            this.renderAlreadySelectedLayers();
            this.renderActionBar();
        }
    }

    findResizeHandlesUnderneathMousePointer(canvasX: number, canvasY: number): {
        side: 'topLeftCorner' | 'bottomLeftCorner' | 'bottomMiddleCorner' | 'bottomRightCorner' |
            'middleLeftCorner' | 'middleRightCorner' | 'topMiddleCorner' | 'topRightCorner';
        selectionView: ResizableView;
        handle: View;
    }[] {
        let ret: {
            side: 'topLeftCorner' | 'bottomLeftCorner' | 'bottomMiddleCorner' | 'bottomRightCorner' |
            'middleLeftCorner' | 'middleRightCorner' | 'topMiddleCorner' | 'topRightCorner';
            selectionView: ResizableView;
            handle: View;
        }[] = [];

        let sv = this.selectionView.view;
        if (!isDefined(sv)) {
            return [];
        }
        function hittest(bounds: Bounds, x: NumberWithUnit, y: NumberWithUnit): boolean {
            if (x.amount >= bounds.x.amount && x.amount <= (bounds.x.amount + bounds.width.amount) && y.amount >= bounds.y.amount && y.amount <= (bounds.y.amount + bounds.height.amount)) {
                return true;
            }
            return false;
        }

        let canvasBounds = (this.viewCanvasRef.canvasViewRef.getDiv() as HTMLElement).getBoundingClientRect();

        let sides = ['topLeftCorner','bottomLeftCorner', 'bottomMiddleCorner', 'bottomRightCorner',
            'middleLeftCorner', 'middleRightCorner', 'topMiddleCorner', 'topRightCorner'];
        for (let i = 0; i < sides.length; i += 1) {
            let bc = (sv.temp[sides[i]].getDiv() as HTMLElement).getBoundingClientRect();
            let b = new Bounds(bc.left - canvasBounds.left, bc.top - canvasBounds.top, bc.width, bc.height);
            //SkLogger.write(`swapHandle bounds ${canvasX}, ${canvasY}`, bc);
            if (hittest(b, px(canvasX), px(canvasY))) {
                // @ts-ignore
                ret.push({side: sides[i],
                    selectionView: sv,
                    handle: sv.temp[sides[i]]
                });
            }
        }
        return ret;
    }


    findSwapHandlesUnderneathMousePointer(canvasX: number, canvasY: number): {
        layer: Layer,
        layerView: ILayoutEditorView & View,
        swapHandle: View,
        swapPlaceholder: View,
        viewDeltaX: number,
        viewDeltaY: number,
        bounds: Bounds,
        viewOriginalBounds: Bounds

    }[] {

        let ret: {layer: Layer, layerView: ILayoutEditorView & View, swapHandle: View, swapPlaceholder: View, viewDeltaX: number, viewDeltaY: number, bounds: Bounds, viewOriginalBounds: Bounds}[] = [];

        function hittest(bounds: Bounds, x: NumberWithUnit, y: NumberWithUnit): boolean {
            if (x.amount >= bounds.x.amount && x.amount <= (bounds.x.amount + bounds.width.amount) && y.amount >= bounds.y.amount && y.amount <= (bounds.y.amount + bounds.height.amount)) {
                return true;
            }
            return false;
        }

        let canvasBounds = (this.viewCanvasRef.canvasViewRef.getDiv() as HTMLElement).getBoundingClientRect();
        for (let i = 0; i < this.selectionView.placeholders.length; i += 1) {
            let bc =  (this.selectionView.placeholders[i].swapHandle.getDiv() as HTMLElement).getBoundingClientRect();
            let b = new Bounds(bc.left - canvasBounds.left, bc.top - canvasBounds.top, bc.width, bc.height);
            //SkLogger.write(`swapHandle bounds ${canvasX}, ${canvasY}`, bc);
            if (hittest(b, px(canvasX), px(canvasY))) {
                let l: Layer = this.viewCanvasRef.workspaceRef.layersTree.find(this.selectionView.placeholders[i].layer_id);
                let v: ILayoutEditorView & View = this.viewCanvasRef.findViewRef(this.selectionView.placeholders[i].layer_id);
                let vb = calculateBounds(l, "");
                let viewOriginalBounds = safeCopy(vb);
                ret.push({
                    layer: l,
                    layerView: v,
                    swapHandle: this.selectionView.placeholders[i].swapHandle,
                    swapPlaceholder: this.selectionView.placeholders[i].view,
                    viewDeltaX: - (NUConvertToPixel(vb.width).amount / 2),
                    viewDeltaY: - (NUConvertToPixel(vb.height).amount / 2),
                    bounds: b,
                    viewOriginalBounds: viewOriginalBounds
                });
            }
        }
        return ret;
    }





    private hints(params: {
        event?: MouseEvent,
        canvasX?: number,
        canvasY?: number,
        eventName: 'unknown' | 'mouseDown' | 'mouseMove' | 'mouseUp' | 'mouseOut',
        resizeHandlesUnderneathMousePointer: {
            side: 'topLeftCorner' | 'bottomLeftCorner' | 'bottomMiddleCorner' | 'bottomRightCorner' |
                'middleLeftCorner' | 'middleRightCorner' | 'topMiddleCorner' | 'topRightCorner';
            selectionView: ResizableView;
            handle: View; }[],
        swapHandlesUnderneathMousePointer: {
            layer: Layer,
            layerView: ILayoutEditorView & View,
            swapHandle: View,
            swapPlaceholder: View,
            viewDeltaX: number, viewDeltaY: number,
            bounds: Bounds,
            viewOriginalBounds: Bounds}[],
        layersUnderneathMousePointer: {
            layer: Layer,
            depth: number,
            bounds: Bounds }[],
    }) {
        if (params.eventName === 'unknown') {
            this.viewCanvasRef.removeHints();
            return;
        }

        let hintsElements = [];

        if (isDefined(params.resizeHandlesUnderneathMousePointer) && params.resizeHandlesUnderneathMousePointer.length > 0) {
            let selection = (this.viewCanvasRef.selectedLayersInfo.length === 1) ? `layer ${this.viewCanvasRef.selectedLayersInfo[0].layer.title}` : "selection";
            hintsElements.push(...[`<b>Drag</b> to resize ${selection}.`,'\r\n',
                generateKeyboardShortcutIcon(['alt'], false),` &nbsp;to resize ${selection} from center.`, '\r\n',
                generateKeyboardShortcutIcon(['shift'], false), ' &nbsp;to keep aspect ratio.']);
            return this.viewCanvasRef.showHints(hintsElements);
        }
        if (isDefined(params.swapHandlesUnderneathMousePointer) && params.swapHandlesUnderneathMousePointer.length > 0) {
            if (hintsElements.length > 0) {
                hintsElements.push('\r\n');
            }
            hintsElements.push(...[generateKeyboardShortcutIcon(['drag'], false),' &nbsp;to swap layers positions']);
            return this.viewCanvasRef.showHints(hintsElements);
        }

        if (isDefined(params.layersUnderneathMousePointer)) {
            let layert = '';
            if (hintsElements.length > 0) {
                hintsElements.push('\r\n');
            }
            let ps = this.viewCanvasRef.layersSelectionLogic(this.actionCandidate, params.event, params.eventName, params.layersUnderneathMousePointer,true, params.canvasX, params.canvasY);
            //SkLogger.write('layers', params.layersUnderneathMousePointer);
            //SkLogger.write('logic',ps);
            for (let i = 0; i < ps.length; i += 1) {
                let hasSelection = false;
                let hasShiftSelection = false;
                let hasObfsucatedSelection = false;
                let hasFrontSelection = false;

                // selection
                if (ps[i].result.includes('select')) {
                    hasSelection = true;
                    hintsElements.push(...['\r\n', generateKeyboardShortcutIcon(['leftclick'], false), ` &nbsp;to select layer <b>${ps[i].layer.title}</b>`]);
                }
                if (ps[i].result.includes('unselect')) {
                    hasSelection = true;
                    hintsElements.push(...['\r\n', generateKeyboardShortcutIcon(['leftclick'], false), ` &nbsp;to unselect layer <b>${ps[i].layer.title}</b>`]);
                }
                if (ps[i].result.includes('add')) {
                    hasShiftSelection = true;
                    hintsElements.push(...['\r\n',generateKeyboardShortcutIcon(['shift'], false), generateKeyboardShortcutIcon(['leftclick'], false), ` &nbsp;to add layer <b>${ps[i].layer.title}</b> to selection`]);
                }
                if (ps[i].result.includes('remove')) {
                    hasShiftSelection = true;
                    hintsElements.push(...['\r\n',generateKeyboardShortcutIcon(['shift'], false), generateKeyboardShortcutIcon(['leftclick'], false), ` &nbsp;to remove layer <b>${ps[i].layer.title}</b> from selection`]);
                }
                if (ps[i].result.includes('selectfront')) {
                    hasShiftSelection = true;
                    hintsElements.push(...['\r\n',generateKeyboardShortcutIcon(['alt'], false), generateKeyboardShortcutIcon(['leftclick'], false), ` &nbsp;to select front layer <b>${ps[i].layer.title}</b>`]);
                }


            }
        }

        if (hintsElements.length > 0 && typeof hintsElements[0] === 'string' && hintsElements[0] === '\r\n') {
            hintsElements.splice(0, 1);
        }


        this.viewCanvasRef.showHints(hintsElements);

    }





    mouseDown(event: MouseEvent, canvasX: number, canvasY: number) {

        this.dragInfo.x_off_start = event.clientX;
        this.dragInfo.y_off_start = event.clientY;

        this.dragInfo.mouseDownTime = +new Date();
        this.dragInfo.lastMouseDownTime = this.dragInfo.mouseDownTime;


        Application.instance.notifyAll(this, kNotifications.noticeBodyClicked);



        if (this.isPanning === true) {
            this.actionCandidate = "pan";
            return;
        }


        // resizeHandles
        let resizeHandles: {
            side: 'topLeftCorner' | 'bottomLeftCorner' | 'bottomMiddleCorner' | 'bottomRightCorner' |
                'middleLeftCorner' | 'middleRightCorner' | 'topMiddleCorner' | 'topRightCorner';
            selectionView: ResizableView;
            handle: View;
        }[] = this.findResizeHandlesUnderneathMousePointer(canvasX, canvasY);
        if (resizeHandles.length > 0) {
            //SkLogger.write('found resizeHandle');
            this.actionCandidate = 'dragResizeHandle';
            this.dragResizeHandleInfo = resizeHandles[0];
            Application.instance.keyValues["x_off_start"] = event.clientX;
            Application.instance.keyValues["y_off_start"] = event.clientY;

            Application.instance.keyValues["currentViewMoving"] =resizeHandles[0].handle;
            Application.instance.keyValues["x_pos"] = event.clientX - resizeHandles[0].handle.getDiv().offsetLeft;
            Application.instance.keyValues["y_pos"] = event.clientY - resizeHandles[0].handle.getDiv().offsetTop;

            Application.instance.keyValues["mouseDownTime"] = +new Date();
            Application.instance.keyValues["lastMouseDownTime"] = Application.instance.keyValues["mouseDownTime"];


            this.hints({
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                eventName: 'mouseDown',
                resizeHandlesUnderneathMousePointer: resizeHandles,
                layersUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });

            //SkLogger.write(`%c${this.actionCandidate}`, 'background: #222; color: #bada55');

            return;
        }


        // swapHandles
        let swapHandles: {
            layer: Layer,
            layerView: ILayoutEditorView & View,
            swapHandle: View,
            swapPlaceholder: View,
            viewDeltaX: number, viewDeltaY: number,
            bounds: Bounds,
            viewOriginalBounds: Bounds}[] = this.findSwapHandlesUnderneathMousePointer(canvasX, canvasY);
        if (swapHandles.length > 0) {
            //SkLogger.write("found swapHandle");
            this.actionCandidate = 'dragSwapHandle';
            this.dragSwapHandleInfo = swapHandles[0];
            this.dragSwapHandleInfo.swapHandle.setVisible(false);
            for (let i = 0; i < this.selectionView.placeholders.length; i += 1) {
                if (this.selectionView.placeholders[i].layer_id !== this.dragSwapHandleInfo.layer.id) {
                    this.selectionView.placeholders[i].swapHandle.setVisible(false);
                    this.selectionView.placeholders[i].view.fills = [new Fill(true, "color", "normal", "rgba(250, 150, 150, 0.5)")];
                    this.selectionView.placeholders[i].view.borders = [new Border(true, 1, "solid", "rgba(250,150,150,1.0)")];
                    this.selectionView.placeholders[i].view.invalidateBounds();
                    this.selectionView.placeholders[i].view.processStyleAndRender("", []);
                }
            }
            this.hints({
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                eventName: 'mouseDown',
                resizeHandlesUnderneathMousePointer: [],
                layersUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: swapHandles
            });

            //SkLogger.write(`%c${this.actionCandidate}`, 'background: #222; color: #bada55');
            return;

        }


        let layers = this.viewCanvasRef.findLayersUnderneathMousePointer(canvasX, canvasY);
        this.actionCandidate = 'unknown';
        if (layers.length === 0) {

            if (this.lassoViewRef !== undefined) {
                this.lassoViewRef.detachItSelf();
                this.lassoViewRef = undefined;
            }
            this.actionCandidate = 'lasso';
            this.isLasso = true;
            let lasso = new View();
            lasso.keyValues["startX"] = canvasX;
            lasso.keyValues["startY"] = canvasY;
            lasso.boundsForView = function (parentBounds: Bounds): Bounds {
                let x, y, w, h = 0;
                x = this.keyValues["startX"];
                y = this.keyValues["startY"];
                if (isDefined(this.keyValues["endX"])) {
                    if (this.keyValues["endX"] > x) {
                        w = this.keyValues["endX"] - this.keyValues["startX"];
                    } else {
                        x = this.keyValues["endX"];
                        w = this.keyValues["startX"] - this.keyValues["endX"];
                    }
                    if (this.keyValues["endY"] > y) {
                        h = parseInt(this.keyValues["endY"]) - parseInt(this.keyValues["startY"]);
                    } else {
                        y = this.keyValues["endY"];
                        h = parseInt(this.keyValues["startY"]) - parseInt(this.keyValues["endY"]);
                    }
                } else {
                    w = 0;
                    h = 0;
                }
                return {
                    kind: "Bounds",
                    x: px(x),
                    y: px(y),
                    width: px(w),
                    height: px(h),
                    unit: 'px',
                    position: 'absolute',
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto")
                };
            }
            lasso.borders = [new Border(true, 2, "solid", "rgba(24, 144, 255, 1.0)")];
            lasso.borderRadius = new BorderRadius(3, 3, 3, 3);
            lasso.fills = [new Fill(true, "color", "normal", "rgba(200,200,255, 0.5)")];
            lasso.initView("selectionLasso");
            // @ts-ignore
            this.viewCanvasRef.canvasViewRef.attach(lasso);
            this.lassoViewRef = lasso;

            this.hints({
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                eventName: 'mouseDown',
                resizeHandlesUnderneathMousePointer: [],
                layersUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });

            //SkLogger.write(`%c${this.actionCandidate}`, 'background: #222; color: #bada55');

        } else {
            let idx = -1;
            let idx2 = -1;
            for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
                let sl = this.viewCanvasRef.selectedLayersInfo[i].layer;
                idx2 = layers.findIndex((elem) => { return elem.layer.id === sl.id;});
                if (idx2 > -1) {
                    idx = i;
                    break;
                }
            }
            if (idx > -1) {
                let sl = this.viewCanvasRef.selectedLayersInfo[idx];
                let layer = sl.layer;

                this.actionCandidate = 'select';

                // find the position of the mouse cursor in the layer
                let dx = canvasX - NUConvertToPixel(layers[idx2].bounds.x).amount;
                let dy = canvasY - NUConvertToPixel(layers[idx2].bounds.y).amount;
                //SkLogger.write(`delta ${dx},${dy}`);

                this.dragInfo.dx = dx;
                this.dragInfo.dy = dy;
                this.dragInfo.layer = layer;
                this.dragInfo.layerCalculatedBounds = sl.layerCalculatedBounds;
                this.dragInfo.parentLayer = sl.parentLayer;
                this.dragInfo.parentLayerCalculatedBounds = sl.parentLayerCalculatedBounds;
                this.dragInfo.view = sl.view;

            } else {
                this.actionCandidate = 'select';

                // find the position of the mouse cursor in the layer
                let dx = canvasX - NUConvertToPixel(layers[0].bounds.x).amount;
                let dy = canvasY - NUConvertToPixel(layers[0].bounds.y).amount;
                //SkLogger.write(`delta ${dx},${dy}`);

                this.dragInfo.dx = dx;
                this.dragInfo.dy = dy;
                this.dragInfo.layer = layers[0].layer;
                this.dragInfo.layerCalculatedBounds = calculateBounds(layers[0].layer, "");
                this.dragInfo.parentLayer = layers[0].layer.parentLayer;
                this.dragInfo.parentLayerCalculatedBounds = calculateBounds(this.dragInfo.parentLayer, "");
                this.dragInfo.view = this.viewCanvasRef.findViewRef(layers[0].layer.id);

            }

            this.hints({
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                eventName: 'mouseDown',
                resizeHandlesUnderneathMousePointer: [],
                layersUnderneathMousePointer: layers,
                swapHandlesUnderneathMousePointer: []
            });

            //SkLogger.write(`%c${this.actionCandidate}`, 'background: #222; color: #bada55');

        }

    }

    mouseUp(event: MouseEvent, canvasX: number, canvasY: number) {
        if (this.isPanning) {
            return;
        }
        if (this.isLasso) {
            this.lassoViewRef.detachItSelf();
            this.lassoViewRef = undefined;
            this.isLasso = false;
            let parentLayer: Layer = undefined;
            if (this.selectionView.highlights.length > 0) {
                parentLayer = this.selectionView.highlights[0].layer.parentLayer;
                this.batchChanges();

                this.viewCanvasRef.removeLayerIdFromSelection(parentLayer.id);
                for (let i = 0; i < this.selectionView.highlights.length; i += 1) {
                    let layer = this.selectionView.highlights[i].layer;
                    this.viewCanvasRef.removeLayerIdFromHighlight(layer.id);
                    Application.instance.notifyAll(layer, "noticeLayerHoverOut");
                    this.viewCanvasRef.addLayerIdToSelection(layer.id);
                }
                this.viewCanvasRef.clearAllHighlights();
                this.commitChanges();

            }
            this.selectionView.highlights = [];
            this.hints({
                layersUnderneathMousePointer: [],
                eventName: 'mouseUp',
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                resizeHandlesUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });
        }
        if (this.actionCandidate === 'select') {
            let layers = this.viewCanvasRef.findLayersUnderneathMousePointer(canvasX, canvasY);
            // normal click
            if (layers.length > 0) {
                let layer = layers[layers.length - 1].layer;

                let layerCalculatedBounds = calculateBounds(layer, "");
                let parentLayer = layers[layers.length -1].layer.parentLayer;
                let parentLayerCalculatedBounds = calculateBounds(parentLayer, "");
                let view = this.viewCanvasRef.findViewRef(layer.id);
                let eventInfo: CanvasEventInfo = {
                    layer: layer,
                    layerCalculatedBounds: layerCalculatedBounds,
                    parentLayer: parentLayer,
                    parentLayerCalculatedBounds: parentLayerCalculatedBounds,
                    canvasViewRef: this.viewCanvasRef.canvasViewRef,
                    mouseEvent: event,
                    view: view
                };
                this.viewClick(eventInfo);
            }
            this.hints({
                layersUnderneathMousePointer: layers,
                eventName: 'mouseUp',
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                resizeHandlesUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });
        }
        if (this.actionCandidate === "drag") {
            let eventInfo: CanvasEventInfo = {
                layer: this.dragInfo.layer,
                layerCalculatedBounds: this.dragInfo.layerCalculatedBounds,
                parentLayer: this.dragInfo.parentLayer,
                parentLayerCalculatedBounds: this.dragInfo.parentLayerCalculatedBounds,
                view: this.dragInfo.view,
                canvasViewRef: this.viewCanvasRef.canvasViewRef,
                mouseEvent: event
            };
            this.viewWasDragged(eventInfo, canvasX, canvasY);
            this.hints({
                layersUnderneathMousePointer: [],
                eventName: 'mouseUp',
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                resizeHandlesUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });
        }
        if (this.actionCandidate === 'dragSwapHandle') {

            // is there a different layer underneath
            let otherLayers = this.viewCanvasRef.findLayersUnderneathMousePointer(canvasX, canvasY);
            // first layer in selection
            let replacedWith: Layer = undefined;
            for (let i = 0; i < otherLayers.length; i += 1) {
                if (otherLayers[i].layer.id !== this.dragSwapHandleInfo.layer.id) {
                    let pl = this.selectionView.placeholders.find((elem) => { return elem.layer_id === otherLayers[i].layer.id; });
                    if (isDefined(pl)) {
                        replacedWith = otherLayers[i].layer;
                        break;
                    }
                }
            }

            if (replacedWith !== undefined) {
                let a_x = safeCopy(this.dragSwapHandleInfo.viewOriginalBounds.x);
                let a_y = safeCopy(this.dragSwapHandleInfo.viewOriginalBounds.y);
                let a_w = safeCopy(this.dragSwapHandleInfo.viewOriginalBounds.width);
                let a_h = safeCopy(this.dragSwapHandleInfo.viewOriginalBounds.height);
                let rwB = replacedWith.bounds();
                let b_x = safeCopy(rwB.x);
                let b_y = safeCopy(rwB.y);
                let b_w = safeCopy(rwB.width);
                let b_h = safeCopy(rwB.height);
                let dwhib = this.dragSwapHandleInfo.layer.calculatedBounds();
                dwhib.x = b_x;
                dwhib.y = b_y;


                rwB.x = a_x;
                rwB.y = a_y;

                if (event.shiftKey === true) {
                    dwhib.width = b_w;
                    dwhib.height = b_h;
                    rwB.width = a_w;
                    rwB.height = a_h;

                }
                replacedWith.setPropertyValue("view.bounds", rwB);
                this.dragSwapHandleInfo.layer.setPropertyValue("view.bounds", dwhib);
                this.dragSwapHandleInfo.layerView.invalidateBounds();
                this.dragSwapHandleInfo.layerView.processStyleAndRender("", []);
                let rview: View = this.viewCanvasRef.findViewRef(replacedWith.id);
                if (isDefined(rview)) {
                    rview.invalidateBounds();
                    rview.doResize();
                }
                this.viewCanvasRef.calculateAllRealViewBounds();


                let selection = [];
                for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
                    selection.push(this.viewCanvasRef.selectedLayersInfo[i].layer.id);
                }
               // this.batchChanges();
                this.viewCanvasRef.clearAllSelection();
                this.viewCanvasRef.clearAllHighlights();
                for (let i = 0; i < selection.length; i += 1) {
                    this.viewCanvasRef.addLayerIdToSelection(selection[i]);
                }
               // this.commitChanges();

            } else {

                // restore
                let dwhib = this.dragSwapHandleInfo.layer.bounds();
                dwhib.x = safeCopy(this.dragSwapHandleInfo.viewOriginalBounds.x);
                dwhib.y = safeCopy(this.dragSwapHandleInfo.viewOriginalBounds.y);
                this.dragSwapHandleInfo.layer.setPropertyValue("view.bounds", dwhib);
                this.dragSwapHandleInfo.layerView.invalidateBounds();
                this.dragSwapHandleInfo.layerView.processStyleAndRender("", []);
                for (let i = 0; i < this.selectionView.placeholders.length; i += 1) {
                    this.selectionView.placeholders[i].swapHandle.setVisible(true);
                    this.selectionView.placeholders[i].view.borders = [new Border(true, 1, "solid", "green")];
                    this.selectionView.placeholders[i].view.fills = [];
                    this.selectionView.placeholders[i].view.invalidateBounds();
                    this.selectionView.placeholders[i].view.processStyleAndRender("", [])
                }
            }

            this.dragSwapHandleInfo = undefined;
            this.hints({
                layersUnderneathMousePointer: [],
                eventName: 'mouseUp',
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                resizeHandlesUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });
        }
        if (this.actionCandidate === 'dragResizeHandle') {
            //SkLogger.write("view.ts mouseUp");
            if (Application.instance.keyValues["currentViewMoving"] !== undefined) {

                if (Application.instance.keyValues["currentViewMoving"].dragDelegate !== undefined) {
                    if (Application.instance.keyValues["currentViewMoving"].dragDelegate["viewWasDragged"] !== undefined) {
                        Application.instance.keyValues["currentViewMoving"].dragDelegate["viewWasDragged"](Application.instance.keyValues["currentViewMoving"], {
                            event: event,
                            x: (event.clientX - Application.instance.keyValues["x_pos"]),
                            y: (event.clientY - Application.instance.keyValues["y_pos"])
                        });
                    }
                }

                Application.instance.keyValues["currentViewMoving"] = undefined;
                //window.removeEventListener('mousemove', divMove, true);
            }
            this.viewCanvasRef.calculateAllRealViewBounds();

            this.hints({
                layersUnderneathMousePointer: [],
                eventName: 'mouseUp',
                event: event,
                canvasX: canvasX,
                canvasY: canvasY,
                resizeHandlesUnderneathMousePointer: [],
                swapHandlesUnderneathMousePointer: []
            });
        }

        this.dragInfo.dx = 0;
        this.dragInfo.dy = 0;
        this.dragInfo.x_off_start = 0;
        this.dragInfo.y_off_start = 0;
        this.dragInfo.mouseDownTime = 0;
        this.dragInfo.lastMouseDownTime = 0;
        this.dragInfo.layer = undefined;
        this.dragInfo.layerCalculatedBounds = undefined;
        this.dragInfo.parentLayer = undefined;
        this.dragInfo.parentLayerCalculatedBounds = undefined;
        this.dragInfo.view = undefined;

        this.actionCandidate = 'unknown';
    }

    layersToHighlight(baseLayer: Layer, event: MouseEvent, boundsToTest: Bounds): Layer[] {
        let ret: Layer[] = [];

        // find out which children of the base layer are in the current lasso
        for (let i = 0; i < baseLayer.children.length; i += 1) {
            let absoluteBounds = baseLayer.children[i].boundsOnCanvas();
            if (nodesBounds_overlap(boundsToTest, absoluteBounds) === true) {
                ret.push(baseLayer.children[i]);
            }
        }

        return ret;
    }


    mouseMove(event: MouseEvent, canvasX: number, canvasY: number) {
        let debugString = "";
        debugString += this.actionCandidate;

        this.queueSendMouseInfo.queue(() => {
            Application.instance.notifyAll(this, kNotifications.noticeMouseInfo, { x: canvasX, y: canvasY});
        });

        if (this.actionCandidate === "pan") {

            return;
        }

        if (this.actionCandidate === 'dragResizeHandle') {
            const div = Application.instance.keyValues["currentViewMoving"].getDiv();
            div.style.position = 'absolute';
            div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + 'px';
            div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + 'px';


            //calculate mouse velocity
            let mouseVelocity = {
                linear: 0,
                x: 0,
                y: 0
            };


            if (Application.instance.keyValues["x_off_start"] === 0) {
                Application.instance.keyValues["x_off_start"] = event.clientX;
            }
            if (Application.instance.keyValues["y_off_start"] === 0) {
                Application.instance.keyValues["y_off_start"] = event.clientY;
            }

            mouseVelocity.x = Math.round( ((Application.instance.keyValues["x_off_start"] - event.clientX) / (+new Date() - Application.instance.keyValues["lastMouseDownTime"])) * 1000);
            mouseVelocity.y = Math.round( ((Application.instance.keyValues["y_off_start"] - event.clientY) / (+new Date() - Application.instance.keyValues["lastMouseDownTime"])) * 1000);
            mouseVelocity.linear = Math.round( Math.sqrt( (mouseVelocity.x * mouseVelocity.x) + (mouseVelocity.y * mouseVelocity.y)));

            // SkLogger.write(`Mouse velocity ${mouseVelocity.x}, ${mouseVelocity.y}`);

            Application.instance.keyValues["lastMouseDownTime"] = + new Date();

            let offsetX = event.clientX - Application.instance.keyValues["x_off_start"];
            let offsetY = event.clientY - Application.instance.keyValues["y_off_start"];
            Application.instance.keyValues["x_off_start"] = event.clientX;
            Application.instance.keyValues["y_off_start"] = event.clientY;

            if (Application.instance.keyValues["currentViewMoving"].corner === undefined) {
                Application.instance.keyValues["currentViewMoving"].bounds = Application.instance.keyValues["currentViewMoving"].getBounds("");
                if (Application.instance.keyValues["currentViewMoving"].temp !== undefined) {

                    Application.instance.keyValues["currentViewMoving"].temp.selectedLayerOverlay._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + "px";
                    Application.instance.keyValues["currentViewMoving"].temp.selectedLayerOverlay._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + 'px';

                    if (Application.instance.keyValues["currentViewMoving"].resizeWidth === true) {
                        Application.instance.keyValues["currentViewMoving"].temp.middleLeftCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount / 2) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.middleLeftCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.middleRightCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount / 2) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.middleRightCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount - 4) + 'px';
                    }
                    if (Application.instance.keyValues["currentViewMoving"].resizeHeight === true) {
                        Application.instance.keyValues["currentViewMoving"].temp.topMiddleCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.topMiddleCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount / 2) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.bottomMiddleCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.bottomMiddleCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount / 2) - 4 + 'px';
                    }

                    if ((Application.instance.keyValues["currentViewMoving"].resizeWidth === true) && (Application.instance.keyValues["currentViewMoving"].resizeHeight === true)) {
                        Application.instance.keyValues["currentViewMoving"].temp.topLeftCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.topLeftCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.topRightCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.topRightCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.bottomLeftCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.bottomLeftCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.bottomRightCorner._div.style.top = (event.clientY - Application.instance.keyValues["y_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount - 4 + 'px';
                        Application.instance.keyValues["currentViewMoving"].temp.bottomRightCorner._div.style.left = (event.clientX - Application.instance.keyValues["x_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount - 4 + 'px';
                    }

                }
            } else {
                //recalculate the corners pos
                if (Application.instance.keyValues["currentViewMoving"].viewRef.temp !== undefined) {
                    Application.instance.keyValues["currentViewMoving"].viewRef.temp.selectedLayerOverlay.invalidateBounds();
                    Application.instance.keyValues["currentViewMoving"].viewRef.temp.selectedLayerOverlay.processStyleAndRender("", []);
                    //Application.instance.keyValues["currentViewMoving"].viewRef.temp.selectedLayerOverlay.doResizeFrameOnly();
                    if (Application.instance.keyValues["currentViewMoving"].viewRef.resizeWidth === true) {
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "middleLeftCorner"], "doResize");
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "middleRightCorner"], "doResize");
                    }
                    if (Application.instance.keyValues["currentViewMoving"].viewRef.resizeHeight === true) {
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "topMiddleCorner"], "doResize");
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "bottomMiddleCorner"], "doResize");
                    }
                    if ((Application.instance.keyValues["currentViewMoving"].viewRef.resizeWidth === true) && (Application.instance.keyValues["currentViewMoving"].viewRef.resizeHeight === true)) {
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "topLeftCorner"], "doResize");
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "topRightCorner"], "doResize");
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "bottomLeftCorner"], "doResize");
                        dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "bottomRightCorner"], "doResize");
                    }

                }
            }

            // what are we resizing ?
            if (this.viewCanvasRef.selectedLayersInfo.length === 1) {
                let layer = this.viewCanvasRef.selectedLayersInfo[0].layer;
                let resizeFromCenter: boolean = false;
                let keepRation: boolean = false;

                let layerBounds = layer.bounds();

                // which corner are we resizing ?
                if (isDefined(this.dragResizeHandleInfo)) {
                    if (this.dragResizeHandleInfo.side === "topLeftCorner") {
                        const newX = px(NUConvertToPixel(layerBounds.x).amount + offsetX);
                        const newY = px(NUConvertToPixel(layerBounds.y).amount + offsetY);
                        const newWidth = px(NUConvertToPixel(layerBounds.width).amount - offsetX);
                        const newHeight = px(NUConvertToPixel(layerBounds.height).amount - offsetY);

                        layerBounds.x = newX;
                        layerBounds.y = newY;
                        layerBounds.width = newWidth;
                        layerBounds.height = newHeight;
                    }
                    if (this.dragResizeHandleInfo.side === "topMiddleCorner") {

                        const newY = px(NUConvertToPixel(layerBounds.y).amount + offsetY);
                        const newHeight = px(NUConvertToPixel(layerBounds.height).amount - offsetY);

                        layerBounds.y = newY;
                        layerBounds.height = newHeight;
                    }
                    if (this.dragResizeHandleInfo.side === "topRightCorner") {

                        const newY = px(NUConvertToPixel(layerBounds.y).amount + offsetY);
                        const newWidth = px(NUConvertToPixel(layerBounds.width).amount + offsetX);
                        const newHeight = px(NUConvertToPixel(layerBounds.height).amount - offsetY);

                        layerBounds.y = newY;
                        layerBounds.width = newWidth;
                        layerBounds.height = newHeight;
                    }

                    if (this.dragResizeHandleInfo.side === "middleLeftCorner") {
                        const newX = px(NUConvertToPixel(layerBounds.x).amount + offsetX);
                        const newWidth = px(NUConvertToPixel(layerBounds.width).amount - offsetX);
                        layerBounds.x = newX;
                        layerBounds.width = newWidth;
                    }

                    if (this.dragResizeHandleInfo.side === "middleRightCorner") {
                        const newWidth = px(NUConvertToPixel(layerBounds.width).amount + offsetX);
                        layerBounds.width = newWidth;
                    }

                    if (this.dragResizeHandleInfo.side === "bottomLeftCorner") {
                        const newX = px(NUConvertToPixel(layerBounds.x).amount + offsetX);
                        const newWidth = px(NUConvertToPixel(layerBounds.width).amount - offsetX);
                        const newHeight = px(NUConvertToPixel(layerBounds.height).amount + offsetY);

                        layerBounds.x = newX;
                        layerBounds.width = newWidth;
                        layerBounds.height = newHeight;
                    }

                    if (this.dragResizeHandleInfo.side === "bottomMiddleCorner") {
                        const newHeight = px(NUConvertToPixel(layerBounds.height).amount + offsetY);
                        layerBounds.height = newHeight;
                    }

                    if (this.dragResizeHandleInfo.side === "bottomRightCorner") {
                        const newWidth = px(NUConvertToPixel(layerBounds.width).amount + offsetX);
                        const newHeight = px(NUConvertToPixel(layerBounds.height).amount + offsetY);
                        layerBounds.width = newWidth;
                        layerBounds.height = newHeight;
                    }

                }

                layer.setPropertyValue("view.bounds", layerBounds);

                this.viewCanvasRef.selectedLayersInfo[0].view.invalidateBounds();
                this.viewCanvasRef.selectedLayersInfo[0].view.applyLayoutProperty("view.bounds", layerBounds);
                this.viewCanvasRef.selectedLayersInfo[0].view.processStyleAndRender("", []);
                this.viewCanvasRef.selectedLayersInfo[0].layerCalculatedBounds = safeCopy(layer.bounds());
                this.viewCanvasRef.selectedLayersInfo[0].layerAbsoluteBounds = calculateBounds(layer, "", true);

                this.dragResizeHandleInfo.selectionView.invalidateBounds();
                this.dragResizeHandleInfo.selectionView.processStyleAndRender("", []);
                this.selectionView.view.invalidateBounds();
                this.selectionView.view.processStyleAndRender("", []);

                this.renderActionBar();

                if (layer.isPage === true) {
                    let titleView = this.viewCanvasRef.findTitleRef(layer.id);
                    if (isDefined(titleView)) {
                        titleView.invalidateBounds();
                        titleView.processStyleAndRender("", []);
                    }
                }

                Application.instance.notifyAll(this, kNotifications.noticeUpdateCoordinates, layerBounds);

                //Session.instance.selectedLayersInfo[0].layerAbsoluteBounds = calculateBounds(layer, "", true);
                // this.commitChanges();

            } else if (this.viewCanvasRef.selectedLayersInfo.length > 1) {

            }






            return;
        }

        if (this.actionCandidate === 'unknown' && this.isLasso === false) {
            // highlight layers
            this.viewCanvasRef.clearAllHighlights();

            // swapHandles
            let swapHandles: {
                layer: Layer,
                layerView: ILayoutEditorView & View,
                swapHandle: View,
                swapPlaceholder: View,
                viewDeltaX: number, viewDeltaY: number,
                bounds: Bounds,
                viewOriginalBounds: Bounds}[] = this.findSwapHandlesUnderneathMousePointer(canvasX, canvasY);
            if (swapHandles.length > 0) {
                return this.hints({
                    event: event,
                    eventName: 'mouseMove',
                    layersUnderneathMousePointer: [],
                    swapHandlesUnderneathMousePointer: swapHandles,
                    resizeHandlesUnderneathMousePointer: [],
                    canvasX: canvasX,
                    canvasY: canvasY
                });
            }


            let layers = this.viewCanvasRef.findLayersUnderneathMousePointer(canvasX, canvasY);
            if (layers.length > 0) {
                // what is the base layer
                let baseLayer: Layer = undefined;
                if (this.viewCanvasRef.selectedLayersInfo.length === 0) {
                    baseLayer = this.viewCanvasRef.workspaceRef.layersTree;
                } else {
                    baseLayer = this.viewCanvasRef.selectedLayersInfo[0].layer;
                }
                debugString += " baseLayer: " + baseLayer.title + " layers:";

                // calculate the lasso bounds
                let x, y, w, h, b, r = 0;
                x = canvasX;
                y = canvasY;
                w = 1;
                h = 1;
                let lassoBounds = new Bounds(x, y, w, h);
                let layersToSelect: Layer[] = this.layersToHighlight(baseLayer, event, lassoBounds);

                this.batchChanges();
                for (let i = 0; i < layersToSelect.length; i += 1) {
                    let nodeToHighlight = layersToSelect[i];
                    if (!this.viewCanvasRef.layerIdInSelection(nodeToHighlight.id)) {
                        debugString += "" + nodeToHighlight.title + "/";
                        let viewToHighlight = this.viewCanvasRef.findViewRef(nodeToHighlight.id);
                        this.viewCanvasRef.addLayerIdToHighlight(nodeToHighlight.id);
                    } else {
                        debugString += "[" + nodeToHighlight.title + "]/";
                    }
                }
                this.commitChanges();

                this.hints({
                    event: event,
                    eventName: 'mouseMove',
                    layersUnderneathMousePointer: layers,
                    swapHandlesUnderneathMousePointer: [],
                    resizeHandlesUnderneathMousePointer: [],
                    canvasX: canvasX,
                    canvasY: canvasY
                })

                //showHints([generateKeyboardShortcutIcon(["leftclick"], true), ` &nbsp;to select layer <b>${layersToSelect[0].title}</b>.`]);

            } else {
                this.viewCanvasRef.removeHints();
            }
        }

        if (this.actionCandidate === 'select') {
            this.actionCandidate = 'drag';
            let eventInfo: CanvasEventInfo = {
                mouseEvent: event,
                layer: this.dragInfo.layer,
                layerCalculatedBounds: this.dragInfo.layerCalculatedBounds,
                parentLayer: this.dragInfo.parentLayer,
                parentLayerCalculatedBounds: this.dragInfo.parentLayerCalculatedBounds,
                view: this.dragInfo.view,
                canvasViewRef: this.viewCanvasRef.canvasViewRef
            };
            this.viewWillBeDragged(eventInfo);

        }
        if (this.actionCandidate === 'drag') {
            let eventInfo: CanvasEventInfo = {
                mouseEvent: event,
                layer: this.dragInfo.layer,
                layerCalculatedBounds: this.dragInfo.layerCalculatedBounds,
                parentLayer: this.dragInfo.parentLayer,
                parentLayerCalculatedBounds: this.dragInfo.parentLayerCalculatedBounds,
                view: this.dragInfo.view,
                canvasViewRef: this.viewCanvasRef.canvasViewRef
            };

            let mouseVelocity = {
                linear: 0,
                x: 0,
                y: 0
            };

            if (this.dragInfo.x_off_start === 0) {
                this.dragInfo.x_off_start = event.clientX;
            }
            if (this.dragInfo.y_off_start === 0) {
                this.dragInfo.y_off_start = event.clientY;
            }

            mouseVelocity.x = Math.round( ((this.dragInfo.x_off_start - event.clientX) / (+new Date() - this.dragInfo.lastMouseDownTime)) * 1000);
            mouseVelocity.y = Math.round( ((this.dragInfo.y_off_start - event.clientY) / (+new Date() - this.dragInfo.lastMouseDownTime)) * 1000);
            mouseVelocity.linear = Math.round( Math.sqrt( (mouseVelocity.x * mouseVelocity.x) + (mouseVelocity.y * mouseVelocity.y)));

            // SkLogger.write(`Mouse velocity ${mouseVelocity.x}, ${mouseVelocity.y}`);

            this.dragInfo.lastMouseDownTime = + new Date();

            let offsetX = event.clientX - this.dragInfo.x_off_start;
            let offsetY = event.clientY - this.dragInfo.y_off_start;
            this.dragInfo.x_off_start = event.clientX;
            this.dragInfo.y_off_start = event.clientY;

            let viewIsBeingDraggedParam : {
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
            } = {
                event: event,
                x: (canvasX - this.dragInfo.dx),
                y: (canvasY - this.dragInfo.dy),
                offsetX: -offsetX,
                offsetY: -offsetY,
                mouseVelocity: mouseVelocity
            }

            this.viewCanvasRef.showHints([generateKeyboardShortcutIcon(['shift','drag'], true), ' &nbsp;to duplicate selection.']);
            this.viewBeingDragged(eventInfo, viewIsBeingDraggedParam);
        }

        if (this.actionCandidate === 'dragSwapHandle') {

            if (this.dragInfo.x_off_start === 0) {
                this.dragInfo.x_off_start = event.clientX;
            }
            if (this.dragInfo.y_off_start === 0) {
                this.dragInfo.y_off_start = event.clientY;
            }

            let offsetX = event.clientX - this.dragInfo.x_off_start;
            let offsetY = event.clientY - this.dragInfo.y_off_start;

            let dwhib = this.dragSwapHandleInfo.layer.bounds();
            dwhib.x = px(NUConvertToPixel(dwhib.x).amount + offsetX);
            dwhib.y = px(NUConvertToPixel(dwhib.y).amount + offsetY);
            this.dragSwapHandleInfo.layer.setPropertyValue("view.bounds", dwhib);
            this.dragSwapHandleInfo.layerView.invalidateBounds();
            this.dragSwapHandleInfo.layerView.processStyleAndRender("", [])

            this.dragInfo.x_off_start = event.clientX;
            this.dragInfo.y_off_start = event.clientY;
        }

        if (this.isLasso) {
            this.lassoViewRef.keyValues["endX"] = canvasX;
            this.lassoViewRef.keyValues["endY"] = canvasY;
            this.lassoViewRef.invalidateBounds();
            this.lassoViewRef.processStyleAndRender("", []);

            // what is the base layer
            let baseLayer: Layer = undefined;
            if (this.viewCanvasRef.selectedLayersInfo.length === 0) {
                baseLayer = this.viewCanvasRef.workspaceRef.layersTree;
            } else {
                baseLayer = this.viewCanvasRef.selectedLayersInfo[0].layer;
            }

            debugString += " baseLayer: " + baseLayer.title + " layers:";

            // calculate the lasso bounds
            let x, y, w, h, b, r = 0;
            x = this.lassoViewRef.keyValues["startX"];
            y = this.lassoViewRef.keyValues["startY"];
            if (isDefined(this.lassoViewRef.keyValues["endX"])) {
                if (this.lassoViewRef.keyValues["endX"] > x) {
                    w = this.lassoViewRef.keyValues["endX"] - this.lassoViewRef.keyValues["startX"];
                } else {
                    x = this.lassoViewRef.keyValues["endX"];
                    w = this.lassoViewRef.keyValues["startX"] - this.lassoViewRef.keyValues["endX"];
                }
                if (this.lassoViewRef.keyValues["endY"] > y) {
                    h = parseInt(this.lassoViewRef.keyValues["endY"]) - parseInt(this.lassoViewRef.keyValues["startY"]);
                } else {
                    y = this.lassoViewRef.keyValues["endY"];
                    h = parseInt(this.lassoViewRef.keyValues["startY"]) - parseInt(this.lassoViewRef.keyValues["endY"]);
                }
            } else {
                w = 0;
                h = 0;
            }

            b = y + h;
            r = x + w;

            let lassoBounds = new Bounds(x, y, w, h);


            this.batchChanges();
            this.viewCanvasRef.clearAllHighlights();
            let layersToSelect: Layer[] = this.layersToHighlight(baseLayer, event, lassoBounds);

            for (let i = 0; i < layersToSelect.length; i += 1) {
                let nodeToHighlight = layersToSelect[i];
                if (!this.viewCanvasRef.layerIdInSelection(nodeToHighlight.id)) {
                    debugString += nodeToHighlight.title + "/";
                    let viewToHighlight = this.viewCanvasRef.findViewRef(nodeToHighlight.id);
                    this.viewCanvasRef.addLayerToHighlight(nodeToHighlight);
                } else {
                    debugString += "[" + nodeToHighlight.title + "]/"
                }
            }
            this.commitChanges();
            //if (debugString !== "") {
               // SkLogger.write(debugString);
            //}

        }
        //if (debugString !== "") {
        //    SkLogger.write(debugString);
        //}
    }


    viewDrawn(view: ILayoutEditorView & View, layer: Layer) {
        //this.setDelegates(view, layer, true);

    }



    viewClick(eventInfo: CanvasEventInfo) {
        super.viewClick(eventInfo);

        let objectIndex: number = -1;
        let isSelected: boolean = false;
        let withShift: boolean = (eventInfo.mouseEvent.shiftKey === true);

        let previousSelection: string[] = [];
        this.viewCanvasRef.selectedLayersInfo.forEach((elem) => { previousSelection.push(elem.layer.id); });

        // dismiss popovers
        Application.instance.notifyAll(this, 'noticeBodyClicked');

        if (Session.instance.selectedTool === "selector") {

            this.batchChanges();

            for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i++) {
                if (this.viewCanvasRef.selectedLayersInfo[i].layer.id === eventInfo.layer.id) {
                    objectIndex = i;
                    isSelected = true;
                    break;
                }
            }

            if (isSelected === true) {
                if (withShift === false) {
                    // remove all selection
                    this.viewCanvasRef.clearAllSelection();
                } else {
                    // just remove the clicked node
                    this.viewCanvasRef.removeLayerIdFromSelection(eventInfo.layer.id);
                }
            } else {
                if (withShift === false) {
                    this.viewCanvasRef.clearAllSelection();

                    // Is the selection at the top level ? if yes we select it
                    // if its a child deep inside, we select the child in the current selection working our way to that selection

                    let tree = this.viewCanvasRef.findTreeForNodeId(eventInfo.layer.id);
                    let index = -1;
                    let nodeToSelect = null;
                    if (previousSelection.length === 0) {
                        nodeToSelect = tree[tree.length-1];
                    } else {
                        let previousTree = this.viewCanvasRef.findTreeForNodeId(previousSelection[0]);
                        // if the new selection is a sibling of the previous selection, we select it straight away
                        if ((previousTree.length === tree.length) &&
                            (previousTree.length >= 2) && (tree.length >=2) &&
                            (previousTree[1].id === tree[1].id)
                        ) {
                            nodeToSelect = eventInfo.layer;
                        } else {
                            // if not we select the node further down from the previous selection
                            for (let i = 0; i < tree.length; i += 1) {
                                if (tree[i].id === previousSelection[0]) {
                                    index = i;
                                }
                            }
                            if (index > -1) {
                                // we had a selection before on that branch
                                if (index - 1 > -1) {
                                    nodeToSelect = tree[index - 1];
                                } else {
                                    nodeToSelect = tree[0];
                                }
                            } else {
                                nodeToSelect = tree[tree.length - 1];
                            }
                        }
                    }
                    this.viewCanvasRef.addLayerIdToSelection(nodeToSelect.id);

                } else {
                    // add the clicked node to the list of selection
                    this.viewCanvasRef.addLayerIdToSelection(eventInfo.layer.id);
                }
            }

            this.viewCanvasRef.clearAllHighlights();
            this.commitChanges();

            Application.instance.notifyAll(this, "kScrollLayersToSelection");

            Application.instance.notifyAll(this, "displaySelectedItemProperties");

        } else {
            // label, frames

            // get the clicked view boundingRect
            let boundingRect = (eventInfo.view as LayerView).getDiv().getBoundingClientRect();

            let newNode = null;

            switch (Session.instance.selectedTool) {
                case "frame":
                    newNode = Layer.create("View", "object", "MentatJS.View");
                    break;
                case "label":
                    newNode = Layer.create("Label", "object", "MentatJS.Label");
                    break;
                case "image":
                    newNode = Layer.create("Image", "object", "MentatJS.ImageView");
                    break;
            }

            let v = null;
            try {
                let sk : SkeletControl = findControlForClassName(newNode.className);
                v = Object.assign(new sk.controlClass(), {});

            } catch (error) {
                let message = 'A Component used in this skelet requires a plugin which is not enabled.';
                message += '\nTried to instantiate a component with constructor ' + newNode.className;
                window.alert(message);
                return;
            }
            let defaultPosition = { x: (eventInfo.mouseEvent.clientX - boundingRect.left), y: (eventInfo.mouseEvent.clientY - boundingRect.top), width: 100, height: 100 };
            if (isDefined(v.layoutEditorPositioning)) {
                defaultPosition = v.layoutEditorPositioning(eventInfo.layer, (eventInfo.mouseEvent.clientX - boundingRect.left), (eventInfo.mouseEvent.clientY - boundingRect.top));
            }
            newNode.bounds.x =  defaultPosition.x;
            newNode.bounds.y =  defaultPosition.y;
            newNode.bounds.width = defaultPosition.width;
            newNode.bounds.height = defaultPosition.height;
            newNode.bounds.position = 'absolute';
            newNode.bounds.unit = 'px';
            newNode.id = generateV4UUID();
            newNode.isPage = false;


            if (eventInfo.layer !== null) {
                eventInfo.layer.children.push(newNode);
                this.viewCanvasRef.clearAllSelection();
                Application.instance.notifyAll(eventInfo.layer, "kRedrawSubView", newNode);
                this.viewCanvasRef.addLayerIdToSelection(newNode.id);
                Application.instance.notifyAll(eventInfo.layer, "noticeRedrawLayerList", { expanded: newNode.id });

            }

            this.viewCanvasRef.pushHistory(newNode.title + " added to " + eventInfo.layer.title);

            setTool('selector');
            Application.instance.notifyAll(this, "noticeSelectedToolRefresh", 'selector');
        }


        //this.viewCanvasRef.
        this.viewCanvasRef.recalculateRulers();
        electronRefreshWorkspaceMenu();


    }


    viewDoubleClick(eventInfo: CanvasEventInfo) {
        super.viewDoubleClick(eventInfo);

        let view = eventInfo.view;
        let node = eventInfo.layer;
        let parentNode = eventInfo.parentLayer;

        if (!this.viewCanvasRef.layerIdInSelection(node.id)) {
            // deselect all
            this.viewCanvasRef.clearAllSelection();
            this.viewCanvasRef.addLayerIdToSelection(node.id);
        } else {
            this.viewCanvasRef.clearAllSelection();
            this.viewCanvasRef.addLayerIdToSelection(node.id);

        }

        if (isDefined(view.layoutEditorEnterEditMode)) {
            // disable click on that object
            (view as any as View).setClickDelegate(null, "");
            //(view as any as View).setResizing(false);
            (view as any as View).setDraggable(false);
            Session.instance.isEditingText = true;
            view.layoutEditorEnterEditMode(node);

            Application.instance.registerForNotification("noticeExitTextEditMode", {
                id: generateV4UUID(),
                nodeRef: node,
                viewRef: view,
                viewCanvasViewControllerRef: this,
                noticeExitTextEditMode: function () {
                    this.viewRef.setResizing(true);
                    this.viewRef.setDraggable(true);
                    Session.instance.isEditingText = false;
                    this.viewRef.setClickDelegate(this.viewCanvasViewControllerRef, "onObjectClicked");
                    Application.instance.deregisterForNotification("noticeExitTextEditMode", this.id);
                    if (isDefined(this.viewRef.layoutEditorExitEditMode)) {
                        this.viewRef.layoutEditorExitEditMode(this.nodeRef);
                    }
                }
            });

        }


    }

    viewHover(eventInfo: CanvasEventInfo, hoveringIn: boolean) {

        throw "viewHover called. should be OBSOLETE";
        return;


        let view = eventInfo.view;
        let layer = eventInfo.layer;
        let parentLayer = eventInfo.parentLayer;

        // get the reverse tree of the hovered layer
        let tree = this.viewCanvasRef.reverseTreeForLayer(layer);

        let selectedLeaf = undefined;

        let currentLeaf = tree;
        let str = "";

        let selectedLayersParentIDs: string[] = [];
        for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
            selectedLayersParentIDs.push(this.viewCanvasRef.selectedLayersInfo[i].parentLayer.id);
        }


        while (currentLeaf !== undefined) {
            str += currentLeaf.layer.title + "/";

            if (this.viewCanvasRef.selectedLayersInfo.length === 0 && currentLeaf.prev === undefined) {
                // no layer selected, we take the page layer;
                selectedLeaf = currentLeaf;
                break;
            } else {
                if (currentLeaf.prev !== undefined && selectedLayersParentIDs.includes(currentLeaf.prev.layer.id)) {
                    // the parent layer for the current one is in the selection,
                    // its a sibling!, we can select it
                    selectedLeaf = currentLeaf;
                    break;
                }
            }

            currentLeaf = currentLeaf.prev;
        }
        //SkLogger.write(str);


        if (selectedLeaf !== undefined) {
            let viewToHighlight = selectedLeaf.view;
            let nodeToHighlight = selectedLeaf.layer;

            if (hoveringIn && !this.viewCanvasRef.layerIdInSelection(nodeToHighlight.id)) {
                //setViewHovering(viewToHighlight, nodeToHighlight, true);
                Application.instance.notifyAll(nodeToHighlight, "noticeLayerHoverIn");
            } else {
                // we are hovering out a control
                // now its more complicated
                // we need to check the bounds, to see if we're still within the selected leaf bounds
                let ok = false;
                let realBounds = (selectedLeaf.view.getDiv() as HTMLElement).getBoundingClientRect();
                if ( (eventInfo.mouseEvent.clientX >= realBounds.left && eventInfo.mouseEvent.clientX <=  realBounds.right) &&
                    (eventInfo.mouseEvent.clientY >= realBounds.top && eventInfo.mouseEvent.clientY)) {
                    let ok = true;
                }
                if (ok === false && !this.viewCanvasRef.layerIdInSelection(nodeToHighlight.id)) {
                    //setViewHovering(viewToHighlight, nodeToHighlight, false);
                    Application.instance.notifyAll(nodeToHighlight, "noticeLayerHoverOut");
                }

            }

        }



    }


    viewHoverOLD(eventInfo: CanvasEventInfo, hoveringIn: boolean) {
        super.viewHover(eventInfo, hoveringIn);

        let view = eventInfo.view;
        let node = eventInfo.layer;
        let parentNode = eventInfo.parentLayer;

        if (!isDefined(node)) {
            return;
        }
        if (this.viewCanvasRef.layerIdInSelection(node.id)) {
            return;
        }

        let ok: boolean = false;

        if (this.viewCanvasRef.selectedLayersInfo.length === 0) {
            if (parentNode.special_id === "workspace.views") {
                // if no selection, allow to select pages
                ok = true;
            }
        } else {
            // is the view being hovered, a sibling off a selected layer.

            let selectedNodesParents: string[] = [];
            for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
                selectedNodesParents.push(this.viewCanvasRef.selectedLayersInfo[i].parentLayer.id);
            }

            if (selectedNodesParents.includes(parentNode.id)) {
                ok = true;
            }

        }

        if (ok && hoveringIn === true) {
            if (view.isDOMHovering === true) {
                return;
            }
            //setViewHovering(view, node, true);
            Application.instance.notifyAll(node, "noticeLayerHoverIn");

        }
        if (hoveringIn === false) {
           // setViewHovering(view, node, false);
            Application.instance.notifyAll(node, "noticeLayerHoverOut");
        }



    }


    viewWillBeDragged(eventInfo: CanvasEventInfo): boolean {

        let view = eventInfo.view;
        let node = eventInfo.layer;
        let parentNode = eventInfo.parentLayer;

        if (!isDefined(node)) {
            return false;
        }

        if (node.isLocked === true) {
            return false;
        }

        //SkLogger.write("viewWillBeDragged " + node.title);


        // save the original position
        let preDragBounds = safeCopy(eventInfo.layerCalculatedBounds);

        // calculate the bounds of the selection before updating the node being dragged
        let minX = [];
        let minY = [];
        let maxX = [];
        let maxY = [];

        let dragPayload = new DragPayload();
        let selectedNodesBounds = new Bounds(0, 0, 0, 0);

        for(let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i +=1) {
            let l: Layer = this.viewCanvasRef.selectedLayersInfo[i].layer;
            let v: View = this.viewCanvasRef.selectedLayersInfo[i].view;
            let n: Bounds = safeCopy(this.viewCanvasRef.selectedLayersInfo[i].layerCalculatedBounds);
            n.x = NUConvertToPixel(n.x);
            n.y = NUConvertToPixel(n.y);
            n.width = NUConvertToPixel(n.width);
            n.height = NUConvertToPixel(n.height);

            minX.push((n.x.amount));
            minY.push((n.y.amount));
            maxX.push((n.x.amount) + (n.width.amount));
            maxY.push((n.y.amount) + (n.height.amount));

            dragPayload.nodes.push({
                node: l,
                nodeBounds: n,
                view: v,
                parentNode: this.viewCanvasRef.selectedLayersInfo[i].parentLayer,
                parentBounds: this.viewCanvasRef.selectedLayersInfo[i].parentLayerCalculatedBounds,
                deltaX: 0,
                deltaY: 0
            });

            let lanchors = l.anchors();
            lanchors["top"].active = false;
            lanchors["left"].active = false;
            lanchors["right"].active = false;
            lanchors["bottom"].active = false;
            lanchors["width"].active = false;
            lanchors["height"].active = false;

            l.setPropertyValue("view.anchors", lanchors);

            v.anchors["top"].active = false;
            v.anchors["left"].active = false;
            v.anchors["right"].active = false;
            v.anchors["bottom"].active = false;
            v.anchors["width"].active = false;
            v.anchors["height"].active = false;

            v.setLayerHeight('997');
        }


        selectedNodesBounds.x = px(Math.min(...minX));
        selectedNodesBounds.y = px(Math.min(...minY));
        selectedNodesBounds.width = px(Math.max(...maxX) - selectedNodesBounds.x.amount);
        selectedNodesBounds.height = px(Math.max(...maxY) - selectedNodesBounds.y.amount);
        selectedNodesBounds.unit = "px";
        selectedNodesBounds.position = "absolute";

        dragPayload.selectedNodesBounds = selectedNodesBounds;
        for (let i = 0; i < dragPayload.nodes.length; i += 1) {

            dragPayload.nodes[i].deltaX = (dragPayload.nodes[i].nodeBounds.x.amount) - selectedNodesBounds.x.amount;
            dragPayload.nodes[i].deltaY = (dragPayload.nodes[i].nodeBounds.y.amount) - selectedNodesBounds.y.amount;

        }

        //if (node.isPage !== true) {
        //    dragPayload.alignmentLines = getAlignmentLines(dragPayload.nodes);
        //}


        //SkLogger.write("bounds " + selectedNodesBounds.x + "," + selectedNodesBounds.y + " (" + selectedNodesBounds.width + "," + selectedNodesBounds.height + ")");
        // @ts-ignore
        this.dragPayload = dragPayload;


        if (isDefined(this.selectionView.view)) {
            this.selectionView.view.invalidateBounds();
            this.selectionView.view.processStyleAndRender("", []);
        }


        return true;

    }


    viewWasDragged(eventInfo: CanvasEventInfo, x: number, y: number) {
        // how fast was the event
        let newTime = +new Date();
        let diff = newTime - this.dragInfo.mouseDownTime;


        this.viewCanvasRef.clearOverlapViews();

        if (diff > 100) {
            // only save if the drag event was longer than 100 milliseconds,
            // if its under its probably just a layer being selected/deselected
            // Application.instance.notifyAll(this, "saveWorkspace");

            this.viewCanvasRef.batchHistory(eventInfo.layer.id, "bounds");
        }
        // recalculate layers hit boxes
        this.viewCanvasRef.calculateAllRealViewBounds();

        this.dragPayload = undefined;

    }


    viewBeingDragged(eventInfo: CanvasEventInfo, dragData: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }) {

        if (!isDefined(this.dragPayload)) {
            return;
        }

        //if (!isDefined(this.throttleDraggingUpdate) || this.throttleDraggingUpdate === false) {
        //    this.throttleDraggingUpdate = true;

        // do we have match with alignment on the previous drag event
        /*
        let testResults = [];
        let stopX = false;
        let stopY = false;
        for (let i = 0; i < this.dragPayload.nodes.length; i += 1) {
            let n: Layer = this.dragPayload.nodes[i].node;
            let nb: Bounds = this.dragPayload.nodes[i].node.bounds; // nodeBounds;

            for (let x = 0; x < this.dragPayload.alignmentLines.length; x += 1) {
                let test = testMagnet(nb, this.dragPayload.alignmentLines[x], options.offsetX, options.offsetY);
                if (test.result === true) {
                    testResults.push(test);
                    if (test.distance.amount === 0) {
                        if (isDefined(test.x)) {
                            if (Math.abs(options.offsetX) < 5 && options.mouseVelocity.x < 150) {
                                stopX = true;
                                // if the mouse is going the other way of the snap, we don't need force to escape
                                if (test.side === 'left' && options.offsetX < 0) {
                                    stopX = false;
                                }
                                if (test.side === 'right' && options.offsetX > 0) {
                                    stopX = false;
                                }
                            }
                        }
                        if (isDefined(test.y)) {
                            if (Math.abs(options.offsetY) < 5 && options.mouseVelocity.y < 150) {
                                stopY = true;
                                // if the mouse is going the other way of the snap, we don't need force to escape
                                if (test.side === 'top' && options.offsetY < 0) {
                                    stopY = false;
                                }
                                if (test.side === 'bottom' && options.offsetY > 0) {
                                    stopY = false;
                                }
                            }
                        }
                    }
                }
            }
        }
*/


        let stopX = false;
        let stopY = false;

        for (let i = 0; i < this.dragPayload.nodes.length; i += 1) {

            let nb = this.dragPayload.nodes[i].node.bounds();

            if (stopX === false) {
                nb.x.amount = nb.x.amount - dragData.offsetX;
            }
            if (stopY === false) {
                nb.y.amount = nb.y.amount - dragData.offsetY;
            }

            if (this.dragPayload.nodes[i].node.isPage === true) {
                this.dragPayload.nodes[i].node.setRawPropertyValue("view.bounds", nb);
            } else {
                this.dragPayload.nodes[i].node.setPropertyValue("view.bounds", nb);
            }

            Application.instance.notifyAll(this, kNotifications.noticeUpdateCoordinates, nb);

            // this.dragPayload.nodes[i].view.doResizeFrameOnly();
            this.dragPayload.nodes[i].view.invalidateBounds();

            (this.dragPayload.nodes[i].view as LayerView).applyLayoutProperty("view.bounds", nb);
            this.dragPayload.nodes[i].view.processStyleAndRender("", []);

            if (this.dragPayload.nodes[i].node.isPage === true) {
                let titleRef = this.viewCanvasRef.findTitleRef(this.dragPayload.nodes[i].node.id);
                if (titleRef) {
                    // titleRef.doResizeFrameOnly();
                    titleRef.invalidateBounds();
                    titleRef.processStyleAndRender("", []);
                    //titleRef._div.style.top = (this.dragPayload.nodes[i].node.bounds.y - 15) + 'px';
                    //titleRef._div.style.left = (this.dragPayload.nodes[i].node.bounds.x) + 'px';
                }
            }
            //if (this.dragPayload.nodes[i].node.type === "label") {
            //    this.dragPayload.nodes[i].view.render();
            //}

        }
        if (stopX === false) {
            this.dragPayload.selectedNodesBounds.x.amount = this.dragPayload.selectedNodesBounds.x.amount - dragData.offsetX;
        }
        if (stopY === false) {
            this.dragPayload.selectedNodesBounds.y.amount = this.dragPayload.selectedNodesBounds.y.amount - dragData.offsetY;
        }
        this.dragPayload.stopX = stopX;
        this.dragPayload.stopY = stopY;

        for (let i = 0; i < this.viewCanvasRef.selectedLayersInfo.length; i += 1) {
            let sl = this.viewCanvasRef.selectedLayersInfo[i];
            sl.layerAbsoluteBounds = sl.layer.boundsOnCanvas();
            let placeholder = this.selectionView.placeholders.find((elem) => { return elem.layer_id === sl.layer.id; });
            if (isDefined(placeholder)) {
                placeholder.view.keyValues["absoluteBounds"] = sl.layerAbsoluteBounds;
                placeholder.swapHandle.keyValues["absoluteBounds"] = sl.layerAbsoluteBounds;
                placeholder.view.invalidateBounds();
                placeholder.view.processStyleAndRender("", []);
                placeholder.swapHandle.invalidateBounds();
                placeholder.swapHandle.processStyleAndRender("", []);
            }
        }
        for (let i = 0; i < this.viewCanvasRef.highlightedLayersInfo.length; i += 1) {
            let hl = this.viewCanvasRef.highlightedLayersInfo[i];
            hl.layerAbsoluteBounds = hl.layer.boundsOnCanvas();
        }


        if (isDefined(this.selectionView.view)) {
            this.selectionView.view.invalidateBounds();
            this.selectionView.view.processStyleAndRender("", []);
            let b = this.selectionView.view.getBounds();
            //SkLogger.write(`selection ${b.x.amount},${b.y.amount}`);
        }



        /*
        if (Session.instance.selectedLayersInfo.length === 1) {
            Application.instance.notifyAll(this, kNotifications.noticeUpdateCoordinates, Session.instance.selectedLayersInfo[0].layer);
        } else {
            Application.instance.notifyAll(this, kNotifications.noticeUpdateGroupSelectionCoordinates);
        }

         */

        //recalculateRulers();

    }


    viewWillBeResized(view: View): any {
        return true;
    }

    viewIsBeingResized(view: View, bounds: Bounds, eventData: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }): any {
        let layer: Layer = undefined;
        let selection = this.viewCanvasRef.selectedLayersInfo;

        if (selection.length === 1) {
            layer = selection[0].layer;
            let lb = layer.calculatedBounds();
            lb.width = safeCopy(bounds.width);
            lb.height = safeCopy(bounds.height);
            layer.setPropertyValue("view.bounds", lb);
            selection[0].layerAbsoluteBounds.width = safeCopy(bounds.width);
            selection[0].layerAbsoluteBounds.height = safeCopy(bounds.height);
            selection[0].view.invalidateBounds();
            selection[0].view.processStyleAndRender("", []);

            this.selectionView.view.invalidateBounds();
            this.selectionView.view.processStyleAndRender("", []);

            Application.instance.notifyAll(this, kNotifications.noticeUpdateCoordinates, lb);

        } else {
            // TODO
        }

    }

    viewWasResized(view: View): any {

    }





}