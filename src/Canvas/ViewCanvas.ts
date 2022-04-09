
import {
    ComparisonResult,
    objectSortedBinarySearch,
    partitionShapesInQuads, searchRectsInPartition,
    ShapeTypeRect,
    TPartitionQuadLeaf
} from "flowbreaker";

import {matrixCheckSpace} from "./matrixCheckSpace";
import {SkeletDocument} from "../Document/SkeletDocument";
import {Workspace} from "../Document/Workspace";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {
    Application, BorderRadius,
    Bounds, boundsWithPixels, Drp,
    Fill, generateV4UUID, isDefined,
    Label, LayerProperty,
    Logging, NUConvertToPixel, NUConvertToPoint,
    NumberWithUnit, Point, PropertyTextStyle,
    pt,
    px,
    PXBounds,
    safeCopy, View,
    ViewController
} from "mentatjs";

import {generateKeyboardShortcutIcon} from "../Shortcuts/generateKeyboardShortcutIcon";
import {LayerClassification} from "../Layer/LayerClassification";
import {safeRestore} from "../Utils/safeRestore";
import {SkLogger} from "../Logging/SkLogger";
import {kNotifications} from "../Session/kNotifications";
import {IWSRSnapshotWriteRequest, WSRSnapshotWrite} from "../Environment/ServerCommands";
import {hasClipBoardData} from "../Shortcuts/hasClipBoardData";
import {findSymbolNode} from "../Layer/findSymbolNode";
import {EditorMode_Main} from "./modes/main/EditorMode_Main";
import {copyStyle} from "../Layer/copyStyle";
import {HistorySnapshot, setTitle} from "../Session/history";
import {filterFertileLayers} from "../Layer/filterFertileLayers";
import {getWhitespaceMatrix} from "./getWhitespaceMatrix";
import {LayerView} from "../Layer/LayerView";
import {LayerData} from "../Layer/LayerData";
import {moveLayerTop} from "../Layer/moveLayerTop";
import {SelectedLayerInfo} from "../Session/SelectedLayerInfo";
import {EditorMode} from "./modes/EditorMode";
import {SkeletWebSocket} from "../Environment/SkeletWebSocket";
import {copyTextStyle} from "../Layer/copyTextStyle";
import {getEnvironment} from "../Environment/getEnvironment";
import {Ruler} from "../Controls/Ruler/Ruler";
import {Layer} from "../Layer/Layer";
import {ReverseLeafTree} from "../Utils/reverseLeafTree";
import {getCallerFunctionName} from "../Utils/getCallerFunctionName";
import {ViewsCanvasViewController} from "./ViewCanvasViewController";
import {Session} from "../Session/Session";
import {check_selectionBounds_against_container} from "./check_selectionBounds_against_container";
import {checkSnapOpportunities} from "./checkSnapOpportunities";
import {DragPayload} from "./DragPayload";
import {nodesBounds_overlap} from "./nodesBounds_overlap";
import {LayerLabel} from "../Controls/LayerLabel";
import {LayerImageView} from "../Controls/LayerImageView";
import {LayerCanvas} from "../Controls/LayerCanvas";
import {findControlForClassName} from "../Plugin/findControlForClassName";
import {SkeletControl} from "../Plugin/SkeletControl";


type TCalculatedBounds = {
    layer_id: string;
    depth: number;
    bounds: Bounds;
}

export class ViewCanvas {
    documentRef: SkeletDocument;
    workspaceRef: Workspace;
    resourceId: string;
    canvasViewRef: View;
    canvasFrontViewRef: View;
    canvasBackgroundViewRef: View;
    canvasViewControllerRef: ViewsCanvasViewController;
    horizontalRulerRef: Ruler;
    verticalRulerRef: Ruler;
    selectedLayersInfo: SelectedLayerInfo[] = [];
    highlightedLayersInfo:{
        view: ILayoutEditorView & View;
        layer: Layer;
        layerCalculatedBounds: Bounds;
        layerAbsoluteBounds: Bounds;
        parentLayer: Layer;
        parentLayerCalculatedBounds: Bounds;
    }[] = [];
    currentEditorMode: EditorMode;
    viewRefs: (ILayoutEditorView & View)[];

    arrayLayerCalculatedBounds: TCalculatedBounds[] = [];

    rtreeLayers: TPartitionQuadLeaf<ShapeTypeRect> = undefined;

    private _hintsPopup: View;

    snapGuidesViews: {
        allViews: View[];
        overlapViews: View[];
    };

    private batchHistories: {nodeId: string, propertyTitle: string }[] = [];
    private commitHistoryTimeoutHandle = null;

    private recalcTime: number = undefined;

    constructor(documentRef: SkeletDocument, workspaceRef: Workspace, resourceId: string, canvasViewRef: View, canvasBackgroundViewRef: View, canvasViewControllerRef: ViewsCanvasViewController) {
        this.documentRef = documentRef;
        this.workspaceRef = workspaceRef;
        this.resourceId = resourceId;
        this.canvasViewRef = canvasViewRef;
        this.canvasBackgroundViewRef = canvasBackgroundViewRef;
        this.canvasViewControllerRef = canvasViewControllerRef;
        this.snapGuidesViews = {
            allViews: [],
            overlapViews: []
        }
        this.selectedLayersInfo = [];
        this.viewRefs = [];
    }

    init() {
        this.currentEditorMode = new EditorMode_Main(this);
        this.rtreeLayers = undefined;

        Application.instance.registerForNotification(kNotifications.noticeKeyDown, this);
        Application.instance.registerForNotification(kNotifications.noticeKeyUp, this);
    }


    noticeKeyUp(sender, e) {
        if (e.srcElement.nodeName === "INPUT" || e.srcElement.nodeName === "TEXTAREA" || e.srcElement.nodeName === "SELECT") {
            //SkLogger.write("input keydown");
            return;
        }

        if (e.keyCode === 32) {
            this.currentEditorMode.isPanning = false;
            this.canvasViewRef.styles[0].cursor = "";
            this.canvasViewRef.getDiv().style.cursor = "";
        }

    }

    noticeKeyDown(sender, e) {
        if (e.srcElement.nodeName === "INPUT" || e.srcElement.nodeName === "TEXTAREA" || e.srcElement.nodeName === "SELECT") {
            //SkLogger.write("input keydown");
            return;
        }
        if (e.keyCode === 32) {
            this.currentEditorMode.isPanning = true;
            this.canvasViewRef.styles[0].cursor = "move"
            this.canvasViewRef.getDiv().style.cursor = "move";
        }

    }



    removeAllViews() {
        while (this.viewRefs.length > 0) {
            if (isDefined(this.viewRefs[this.viewRefs.length - 1])) {
                if ((this.viewRefs[this.viewRefs.length-1] as any as View).keyValues["nodeRef"].dontInstantiate !== true) {
                    (this.viewRefs[this.viewRefs.length - 1] as any as View).detachItSelf();
                    this.viewRefs[this.viewRefs.length - 1] = null;
                }
                this.viewRefs.pop();
            } else {
                this.viewRefs.pop();
            }
        }
        this.arrayLayerCalculatedBounds = [];
    }

    getSelectionBoundsInfo(): { bounds: Bounds, parentNode: Layer } {
        let minX = [];
        let minY = [];
        let maxX = [];
        let maxY = [];
        let container = null;
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            let n = this.selectedLayersInfo[i].layer;
            let properties = this.selectedLayersInfo[i].properties;
            if (container === null) {
                container = this.selectedLayersInfo[i].parentLayer;
            }
            let nodeBounds = n.boundsOnCanvas();
            minX.push(NUConvertToPixel(nodeBounds.x).amount);
            minY.push(NUConvertToPixel(nodeBounds.y).amount);
            maxX.push(NUConvertToPixel(nodeBounds.x).amount + NUConvertToPixel(nodeBounds.width).amount);
            maxY.push(NUConvertToPixel(nodeBounds.y).amount + NUConvertToPixel(nodeBounds.height).amount);
        }
        let boundsInContainer = {
            kind: "Bounds",
            x: px(Math.min(...minX)),
            y: px(Math.min(...minY)),
            width: px(Math.max(...maxX) - Math.min(...minX)),
            height: px(Math.max(...maxY) - Math.min(...minY)),
            unit: 'px',
            position: 'absolute'
        };

        return {
            bounds: boundsInContainer,
            parentNode: container
        };

    }

    getBoundsInCanvas(boundsInfo: {bounds: Bounds, parentNode: Layer}): Bounds {
        if (!isDefined(boundsInfo)) {
            return null;
        }
        if (!isDefined(boundsInfo.bounds)) {
            return null;
        }
        if (!isDefined(boundsInfo.parentNode)) {
            return null;
        }
        let ret = {
            kind: "Bounds",
            x: boundsInfo.bounds.x,
            y: boundsInfo.bounds.y,
            width: boundsInfo.bounds.width,
            height: boundsInfo.bounds.height,
            unit: boundsInfo.bounds.unit,
            position: boundsInfo.bounds.position
        };

        let parentNode = boundsInfo.parentNode;

        let pageLayer = parentNode.pageLayer;

        while (isDefined(parentNode)) {
            if (parentNode.special_id === "workspace.views") {
                break;
            }
            let pnb = parentNode.boundsOnCanvas()
            if (pnb !== null) {
                SkLogger.write(`Parent ${parentNode.title} bounds: ${pnb.x},${pnb.y} w:${pnb.width} h:${pnb.height}`);

                ret.x = px(NUConvertToPixel(ret.x).amount + NUConvertToPixel(pnb.x).amount);
                ret.y = px(NUConvertToPixel(ret.y).amount + NUConvertToPixel(pnb.y).amount);
            } else {
                console.warn("but calculated bounds are null ?");
            }
            parentNode = parentNode.parentLayer;
        }
        return ret;
    }

    calculateCanvasSize(): Bounds {
        return new Bounds(-4800, -4800, 9600, 9600);
    }


    canvasCenterOnSelection() {
        let selectionBounds: {bounds: Bounds, parentNode: Layer} = this.getSelectionBoundsInfo();

        let backgroundBounds = this.canvasBackgroundViewRef.getBounds("");
        let bw = NUConvertToPixel(backgroundBounds.width).amount
        let bh = NUConvertToPixel(backgroundBounds.height).amount

        let x = NUConvertToPixel(selectionBounds.bounds.x).amount;
        let y = NUConvertToPixel(selectionBounds.bounds.y).amount;

        let viewportX = NUConvertToPixel(this.workspaceRef.viewportOrigin.x).amount;
        let viewportY = NUConvertToPixel(this.workspaceRef.viewportOrigin.y).amount;
        let viewportW = bw;
        let viewportH = bh;

        if (!( (x > viewportX) && (x < viewportX + viewportW) &&
            (y > viewportY) && (y < viewportY + viewportH) )) {
            x = x - (viewportW / 2);
            y = y - (viewportH / 2);
            if (x + viewportW > 9600) {
                x = 9600 - viewportW;
            }
            if (y + viewportH > 9600) {
                y = 9600 - viewportH;
            }
            this.canvasScrollTo(x, y);
        }

    }


    canvasScrollTo(x: number, y: number, broadcast: boolean = true ) {

        let backgroundBounds = this.canvasBackgroundViewRef.getBounds("");
        let bw = NUConvertToPixel(backgroundBounds.width).amount
        let bh = NUConvertToPixel(backgroundBounds.height).amount

        if (x + bw > 9600) {
            x = 9600 - bw;
        }
        if (y + bh > 9600) {
            y = 9600 - bh;
        }

        let canvasX = -(x + 4800) + 20;
        let canvasY = -(y + 4800) + 20;

        if (isDefined(this.workspaceRef)) {
            this.workspaceRef.viewportOrigin = Point.fromStruct({x: px(x), y: px(y)});
        }

        this.canvasViewRef.getDefaultStyle().bounds = new Bounds(canvasX, canvasY, 9600, 9600);
        this.canvasViewRef.doResizeFrameOnly(true);

        this.recalculateRulers();

        //if (this.recalcTime !== undefined) {
        //    clearTimeout(this.recalcTime);
        //}
        // @ts-ignore
        //this.recalcTime = setTimeout( () => {

        //}, 100);
        if (broadcast === true) {
            Application.instance.notifyAll(this, kNotifications.noticeRedrawZoomPanel);
        }



    }


    deleteViewRefOnly(nodeId: string) {
        let idx = -1;
        for (let i = 0; i < this.viewRefs.length; i++) {
            let viewRef = this.viewRefs[i];
            if (isDefined(viewRef)) {
                if ((viewRef.nodeId === nodeId) && (viewRef.isNodeTitle === false)) {
                    idx = i;
                    break;
                }
            }
        }
        if (idx > -1) {
            this.viewRefs.splice(idx, 1);
        }
    }

    deleteViewRef(nodeId: string) {
        let idx = -1;
        for (let i = 0; i < this.viewRefs.length; i++) {
            let viewRef = this.viewRefs[i];
            if (isDefined(viewRef)) {
                if ((viewRef.nodeId === nodeId) && (viewRef.isNodeTitle === false)) {
                    idx = i;
                    break;
                }
            }
        }
        if (idx > -1) {
            try {
                this.viewRefs[idx].detachItSelf();
            } catch (ee) {
                console.warn(ee.message);
            }
            // is it still there ?
            // weird bugs for labels
            let labelDiv = document.getElementById(nodeId);
            if (isDefined(labelDiv)) {
                labelDiv.parentElement.removeChild(labelDiv);
            }
            this.viewRefs.splice(idx,1);
        }
    }

    deleteTitleRef(nodeId: string) {
        let idx = -1;
        for (let i = 0; i < this.viewRefs.length; i++) {
            let viewRef = this.viewRefs[i];
            if (isDefined(viewRef)) {
                if ((viewRef.nodeId === nodeId) && (viewRef.isNodeTitle === true)) {
                    idx = i;
                    break;
                }
            }
        }
        if (idx > -1) {
            try {
                this.viewRefs[idx].detachItSelf();
            } catch (ee) {
                console.warn(ee.message);
            }
            // is it still there ?
            // weird bugs for labels
            let labelDiv = document.getElementById(nodeId + ".title");
            if (isDefined(labelDiv)) {
                labelDiv.parentElement.removeChild(labelDiv);
            }
            this.viewRefs.splice(idx,1);
        }
    }

    findViewRef(nodeId: string): (ILayoutEditorView & View)  {

        for (let i = 0; i < this.viewRefs.length; i++) {
            let viewRef = this.viewRefs[i];
            if (isDefined(viewRef)) {
                if ((viewRef.nodeId === nodeId) && (viewRef.isNodeTitle === false)) {
                    return viewRef;
                }
            }
        }
        return undefined;
    }

    findTitleRef(nodeId: string): (ILayoutEditorView & View) {
        for (let i = 0; i < this.viewRefs.length; i++) {
            let viewRef = this.viewRefs[i];
            if (isDefined(viewRef)) {
                if ((viewRef.nodeId === nodeId) && (isDefined(viewRef.isNodeTitle)) && (viewRef.isNodeTitle === true)) {
                    return viewRef;
                }
            }
        }
        return undefined;
    }

    // HIGHLIGHT INFO

    indexForLayerIdInHighlight(layer_id: string) {
        return this.highlightedLayersInfo.findIndex((elem) => { return elem.layer.id === layer_id;});
    }

    layerIdInHighlight(layer_id: string) {
        return isDefined(this.highlightedLayersInfo.find((elem) => { return elem.layer.id === layer_id; }));
    }

    addLayerIdToHighlight(layer_id: string) {
        let layer: Layer = this.workspaceRef.layersTree.find(layer_id);
        if (isDefined(layer)) {
            return this.addLayerToHighlight(layer);
        }
    }

    addLayerToHighlight(layer: Layer, layerBounds?: Bounds, layerAbsoluteBounds?: Bounds, parentLayer?: Layer, parentLayerBounds?: Bounds, view?: ILayoutEditorView & View) {
        let _layerBounds: Bounds = undefined;
        let _layerAbsoluteBounds: Bounds = undefined;
        let _parentLayer: Layer = undefined;
        let _parentLayerBounds: Bounds = undefined;
        let _view: ILayoutEditorView & View = undefined;

        if (isDefined(layerBounds)) {
            _layerBounds = layerBounds;
        } else {
            _layerBounds = layer.calculatedBounds();
        }
        if (isDefined(layerAbsoluteBounds)) {
            _layerAbsoluteBounds = layerAbsoluteBounds;
        } else {
            _layerAbsoluteBounds = layer.boundsOnCanvas();
        }

        if (isDefined(parentLayer)) {
            _parentLayer = parentLayer;
        } else {
            _parentLayer = layer.parentLayer;
        }
        if (isDefined(parentLayerBounds)) {
            _parentLayerBounds = parentLayerBounds;
        } else {
            _parentLayerBounds = _parentLayer.calculatedBounds();
        }
        if (isDefined(view)) {
            _view = view;
        } else {
            _view = this.findViewRef(layer.id);
        }

        let info = {
            layer: layer,
            layerCalculatedBounds: _layerBounds,
            layerAbsoluteBounds: _layerAbsoluteBounds,
            parentLayer: _parentLayer,
            parentLayerCalculatedBounds: _parentLayerBounds,
            view: _view
        };
        this.highlightedLayersInfo.push(info);
        Application.instance.notifyAll(layer, "noticeLayerHoverIn");
        this.currentEditorMode.layerAddedToHighlight(info);
    }

    removeLayerIdFromHighlight(layer_id: string) {
        let index = this.indexForLayerIdInHighlight(layer_id);
        let layer: Layer = undefined;
        let view: ILayoutEditorView & View = undefined;
        if (index > -1) {
            layer = this.highlightedLayersInfo[index].layer;
            view = this.highlightedLayersInfo[index].view;
            Application.instance.notifyAll(layer, "noticeLayerHoverOut", { id: layer_id, isSelected: false });
            this.highlightedLayersInfo.splice(index, 1);
        }
        this.currentEditorMode.layerRemovedFromHighlight(layer, view);
    }

    clearAllHighlights() {
        for (let i = this.highlightedLayersInfo.length - 1; i >= 0; i -= 1) {
            let layer: Layer = this.highlightedLayersInfo[i].layer;
            let view: ILayoutEditorView & View = this.highlightedLayersInfo[i].view;

            Application.instance.notifyAll(layer, "noticeLayerHoverOut", { id: layer.id, isSelected: false });
            this.highlightedLayersInfo.splice(i, 1);
            this.currentEditorMode.layerRemovedFromHighlight(layer, view);
        }
        this.highlightedLayersInfo = [];
    }


    // SELECTION INFO

    selectionInfoForLayerId(layer_id: string): SelectedLayerInfo {
        return this.selectedLayersInfo.find((elem) => { return elem.layer.id === layer_id; });
    }


    indexForLayerIdInSelection(layer_id: string) {
        return this.selectedLayersInfo.findIndex((elem) => { return elem.layer.id === layer_id;});
    }

    indexForLayerInSelection(layer: Layer) {
        return this.indexForLayerIdInSelection(layer.id);
    }

    layerIdInSelection(layer_id: string) {
        return isDefined(this.selectedLayersInfo.find((elem) => { return elem.layer.id === layer_id; }));
    }

    layerIsInSelection(layer: Layer) {
        return this.layerIdInSelection(layer.id);
    }

    addLayerIdToSelection(layer_id: string): SelectedLayerInfo {
        let layer: Layer = this.workspaceRef.layersTree.find(layer_id);
        let layerBounds: Bounds = undefined;
        let layerAbsoluteBounds: Bounds = undefined;
        let parentLayer: Layer = undefined;
        let parentLayerBounds: Bounds = undefined;
        let view: ILayoutEditorView & View = undefined;

        if (isDefined(layer)) {
            layerBounds = layer.calculatedBounds();
            layerAbsoluteBounds = layer.boundsOnCanvas();
            parentLayer = layer.parentLayer;
            if (isDefined(parentLayer)) {
                parentLayerBounds = parentLayer.calculatedBounds();
            }
            view = this.findViewRef(layer_id);

            return this.addLayerToSelection(layer, layerBounds, layerAbsoluteBounds, parentLayer, parentLayerBounds, view);
        } else {
            console.warn(`addLayerIdToSelection: layer ${layer_id} could not be find`);
            return undefined;
        }
    }

    removeLayerIdFromSelection(layer_id: string) {
        let index = this.indexForLayerIdInSelection(layer_id);
        let layer: Layer = undefined;
        let view: ILayoutEditorView & View = undefined;
        if (index > -1) {
            Application.instance.notifyAll(this, "kSelectionChangedOnCanvas", { id: layer_id, isSelected: false });
            layer = this.selectedLayersInfo[index].layer;
            view = this.selectedLayersInfo[index].view;
            this.selectedLayersInfo.splice(index, 1);
        }
        this.currentEditorMode.layerRemovedFromSelection(layer, view);
    }

    clearAllSelection() {
        for (let i = this.selectedLayersInfo.length - 1; i >= 0; i -= 1) {
            let layer: Layer = undefined;
            let view: ILayoutEditorView & View = undefined;
            Application.instance.notifyAll(this, "kSelectionChangedOnCanvas", { id: this.selectedLayersInfo[i].layer.id, isSelected: false });
            layer = this.selectedLayersInfo[i].layer;
            view = this.selectedLayersInfo[i].view;
            this.selectedLayersInfo.splice(i, 1);
            this.currentEditorMode.layerRemovedFromSelection(layer, view);
        }
        Application.instance.notifyAll(this, "noticeNodeSelected", null);
        this.selectedLayersInfo = [];
    }

    clearSelectionAndAddLayerId(layer_id: string): {
        view: ILayoutEditorView & View,
        layer: Layer,
        layerCalculatedBounds: Bounds,
        parentLayer: Layer,
        parentLayerCalculatedBounds: Bounds
    } {
        this.clearAllSelection();
        return this.addLayerIdToSelection(layer_id);
    }

    addLayerToSelection(layer: Layer, layerBounds?: Bounds, layerAbsoluteBounds?: Bounds, parentLayer?: Layer, parentLayerBounds?: Bounds, view?: ILayoutEditorView & View): SelectedLayerInfo {
        let _layerBounds: Bounds = undefined;
        let _layerAbsoluteBounds: Bounds = undefined;
        let _parentLayer: Layer = undefined;
        let _parentLayerBounds: Bounds = undefined;
        let _view: ILayoutEditorView & View = undefined;

        let pageLayerView = this.findViewRef(layer.pageLayer.id);

        if (isDefined(layerBounds)) {
            _layerBounds = layerBounds;
        } else {
            _layerBounds = layer.calculatedBounds();
        }
        if (isDefined(layerAbsoluteBounds)) {
            _layerAbsoluteBounds = layerAbsoluteBounds;
        } else {
            _layerAbsoluteBounds = layer.boundsOnCanvas();
        }

        if (isDefined(parentLayer)) {
            _parentLayer = parentLayer;
        } else {
            _parentLayer = layer.parentLayer;
        }
        if (isDefined(parentLayerBounds)) {
            _parentLayerBounds = parentLayerBounds;
        } else {

            _parentLayerBounds = _parentLayer.calculatedBounds();
        }
        if (isDefined(view)) {
            _view = view;
        } else {
            _view = this.findViewRef(layer.id);
        }



        let info: SelectedLayerInfo = {
            layer: layer,
            layerCalculatedBounds: _layerBounds,
            layerAbsoluteBounds: _layerAbsoluteBounds,
            parentLayer: _parentLayer,
            parentLayerCalculatedBounds: _parentLayerBounds,
            view: _view,
            pageLayer: layer.pageLayer,
            pageLayerView: pageLayerView,
            properties: layer.properties
        };
        this.selectedLayersInfo.push(info);
        Application.instance.notifyAll(this, "kSelectionChangedOnCanvas", { id: layer.id, isSelected: true });

        this.currentEditorMode.layerAddedToSelection(info.layer, info.view);

        if (this.selectedLayersInfo.length === 1) {
            Application.instance.notifyAll(this, "noticeNodeSelected", layer);
        } else {
            Application.instance.notifyAll(this, kNotifications.noticeMultipleSelection);
        }


        return info;
    }

    calculateAllRealViewBounds() {
        this.arrayLayerCalculatedBounds = [];
        this.rtreeLayers = undefined

        for (let i = 0; i < this.viewRefs.length; i += 1) {
            if (this.viewRefs[i].isNodeTitle !== true) {
                this.calculateRealViewBounds(this.viewRefs[i]);
            }
        }
        this.rtreeLayers = partitionShapesInQuads<TCalculatedBounds>(this.arrayLayerCalculatedBounds, (t: TCalculatedBounds, i: number) => {
            return [{
                bb: [NUConvertToPixel(t.bounds.x).amount,
                        NUConvertToPixel(t.bounds.y).amount,
                        NUConvertToPixel(t.bounds.x).amount + NUConvertToPixel(t.bounds.width).amount,
                        NUConvertToPixel(t.bounds.y).amount + NUConvertToPixel(t.bounds.height).amount
                ],
                i: i}];
        });

    }


    calculateRealViewBounds(view: View & ILayoutEditorView) {
        try {
            if (view.isNodeTitle === true) {
                return;
            }
            let el = view.getDiv();
            if (el !== undefined && el !== null) {
                let b = view.nodeRef.boundsOnCanvas();
                //SkLogger.write(`calculateRealViewBounds ${view.nodeRef.title}`, b);

                let t = this.reverseTreeForLayer(view.nodeRef);
                let depth = 0;
                let currentLeaf = t;
                while (currentLeaf !== undefined) {
                    depth += 1;
                    currentLeaf = currentLeaf.prev;
                };
                b.x = px(NUConvertToPixel(b.x).amount + 4800);
                b.y = px(NUConvertToPixel(b.y).amount + 4800);

                //console.log(`${view.nodeRef.title} ${NUConvertToPixel(b.x).amount},${NUConvertToPixel(b.y).amount} ${NUConvertToPixel(b.width).amount},${NUConvertToPixel(b.height).amount}`);


                this.arrayLayerCalculatedBounds.push({
                    layer_id: view.nodeRef.id,
                    depth: depth,
                    bounds: b
                });


            }
        } catch (_) {

        }
    }

    findLayersUnderneathMousePointer(x: number, y: number):
        {
            layer: Layer,
            depth: number,
            bounds: Bounds
        }[] {
        let ret: {
            layer: Layer,
            depth: number,
            bounds: Bounds
        }[] = [];


        if (isDefined(this.rtreeLayers)) {
            let hits = searchRectsInPartition(this.rtreeLayers, x + 4800, y + 4800);
            for (let i = 0; i < hits.length; i ++) {
                if (hits[i] < this.arrayLayerCalculatedBounds.length) {
                    let found: TCalculatedBounds = this.arrayLayerCalculatedBounds[hits[i]];
                    if (isDefined(found)) {
                        let layer = this.workspaceRef.layersTree.find(found.layer_id);
                        if (isDefined(layer)) {
                            ret.push({
                                layer: layer,
                                depth: found.depth,
                                bounds: found.bounds
                            });
                        }
                    }
                }
            }

        }

        ret.sort((elemA, elemB) => { return elemA.depth - elemB.depth; });
        if (ret.length > 0) {
            let str = "realBounds: ";
            for (let i = 0; i < ret.length; i += 1) {
                str += ret[i].depth + "/";
            }
            //SkLogger.write(str);
        }
        return ret;
    }


    isLayerDirectContainerOfSelection(layer: Layer) {
        if (this.selectedLayersInfo.length === 0) {
            return false;
        }
        if (this.selectedLayersInfo[0].parentLayer.id === layer.id) {
            return true;
        }
        return false;
    }

    isLayerContainerOfSelection(layer: Layer ) {
        if (this.selectedLayersInfo.length === 0) {
            return false;
        }
        let parent = this.selectedLayersInfo[0].parentLayer;
        while (isDefined(parent) && parent.special_id !== "workspace.views") {
            if (parent.id === layer.id) {
                return true;
            }
            parent = parent.parentLayer;
        }
        return false;
    }

    isLayerSiblingOfSelection(layer: Layer) {
        if (this.selectedLayersInfo.length === 0) {
            return false;
        }
        let parent = this.selectedLayersInfo[0].parentLayer;
        if (!isDefined(parent.children)) {
            return false;
        }
        for (let i = 0; i < parent.children.length; i += 1) {
            if (parent.children[i].id === layer.id) {
                return true;
            }
        }
        return false;
    }

    isLayerDescendentOfSelection(layer: Layer) {
        function testLayerDescended(baseLayer: Layer, layer: Layer) {
            if (baseLayer.id === layer.id) {
                return true;
            }
            if (!isDefined(baseLayer.children)) {
                return false;
            }
            for (let x = 0; x < baseLayer.children.length; x += 1) {
                let ret = testLayerDescended(baseLayer.children[x], layer);
                if (ret === true) {
                    return true;
                }
            }
            return false;
        }
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            let ret = testLayerDescended(this.selectedLayersInfo[i].layer, layer);
            if (ret === true) {
                return true;
            }
        }
        return false;
    }


    isLayerObfuscated(canvasX: number, canvasY: number, layer: Layer) {
        let layerRealBounds = this.arrayLayerCalculatedBounds.find((elem) => { return elem.layer_id === layer.id; });
        if (!isDefined(layerRealBounds)) {
            return false;
        }
        let lb = layerRealBounds.bounds;
        let passed = false;
        let parent = layer.parentLayer;
        for (let i = 0; i < parent.children.length; i += 1) {
            if (parent.children[i].id === layer.id) {
                passed = true;
            }
            if (passed) {
                let rb = this.arrayLayerCalculatedBounds.find((elem) => { return elem.layer_id === parent.children[i].id; });
                if (this.testBoundsWithPointer(rb.bounds, px(canvasX), px(canvasY)) && this.testBoundsWithPointer(lb, px(canvasX), px(canvasY))) {
                    return true;
                }
            }
        }
        return false;
    }

    isLayerDirectChild(layer: Layer) {
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            let sli = this.selectedLayersInfo[i];
            for (let x = 0; x < sli.layer.children.length; x += 1) {
                if (sli.layer.children[x].id === layer.id) {
                    return true;
                }
            }
        }
        return false;
    }



    canHover(layerClass: LayerClassification) {
        if (!layerClass.isSelected && layerClass.isSibling) {
            return true;
        }
        if (!layerClass.isSelected && layerClass.isDirectChild) {
            return true;
        }

        if (this.selectedLayersInfo.length === 0 && layerClass.layer.isPage === true) {
            return true;
        }

        return false;
    }

    canSelect(layers: {
        layer: Layer,
        depth: number,
        bounds: Bounds }[],layerClass: LayerClassification) {
        if (layerClass.isSelected) {
            return false;
        }
        if (layerClass.isDirectContainer && (layers.length === 1 || layers[0].layer.id !== layerClass.layer.id)) {
            return true;
        }
        if (layerClass.isSibling) {
            return true;
        }
        if (layerClass.isDirectChild) {
            return true;
        }
        if (this.selectedLayersInfo.length === 0 && layerClass.layer.isPage) {
            return true;
        }
        return false;
    }

    canUnselect(layers: {
        layer: Layer,
        depth: number,
        bounds: Bounds }[],layerClass: LayerClassification) {
        if (layerClass.isSelected && layers[layers.length-1].layer.id === layerClass.layer.id && this.selectedLayersInfo.length === 1) {
            return true;
        }
    }


    canAdd(layers: {
        layer: Layer,
        depth: number,
        bounds: Bounds }[],layerClass: LayerClassification) {
        if (this.selectedLayersInfo.length > 0 && layerClass.isSelected === false && layerClass.isSibling) {
            return true;
        }
        return false;
    }

    canRemove(layers: {
        layer: Layer,
        depth: number,
        bounds: Bounds }[],layerClass: LayerClassification) {
        if (this.selectedLayersInfo.length > 1 && layerClass.isSelected === true && layerClass.isSibling) {
            return true;
        }
        return false;
    }



    canSelectFront(layers: {
        layer: Layer,
        depth: number,
        bounds: Bounds }[], layerClass: LayerClassification) {
        if (this.selectedLayersInfo.length === 0 && layers.length > 1 && layerClass.isSelected === false && layers[layers.length-1].layer.id === layerClass.layer.id) {
            return true;
        }
        if (this.selectedLayersInfo.length > 0) {
            if (layers.length > 1 && layerClass.isSelected === false && layerClass.isDirectChild === false && layers[layers.length-1].layer.id === layerClass.layer.id && layerClass.isDescendent) {
                return true;
            }
        }
        return false;

    }



    classifyLayer(layer: Layer, canvasX: number, canvasY: number): LayerClassification {
        return {
            layer: layer,
            isSelected: this.layerIsInSelection(layer),
            isDirectContainer: this.isLayerDirectContainerOfSelection(layer),
            isAContainer: this.isLayerContainerOfSelection(layer),
            isSibling: this.isLayerSiblingOfSelection(layer),
            isDescendent: this.isLayerDescendentOfSelection(layer),
            isObfuscated: this.isLayerObfuscated(canvasX, canvasY, layer),
            isDirectChild: this.isLayerDirectChild(layer)
        };
    }

    layersSelectionLogic(
        canvasActionCandidate: 'unknown' | 'pan' | 'select' | 'drag' | 'lasso' | 'dragSwapHandle' | 'dragResizeHandle',
        event: MouseEvent | undefined,
        eventName: 'unknown' | 'mouseDown' | 'mouseMove' | 'mouseUp' | 'mouseOut',
        layers: {
            layer: Layer,
            depth: number,
            bounds: Bounds }[],
        isCanvas: boolean, canvasX: number, canvasY: number):{
        result: ('select' | 'unselect' | 'add' | 'remove' | 'selectfront' | 'drag' | 'duplicate' | 'delete' | 'place')[],
        conditional: ('leftclick' | 'rightclick' | 'shift' | 'alt' | 'ctrl' | 'key:del')[]
        layer?: Layer,
        container?: Layer,
        classification?: LayerClassification
    }[] {
        let ret: {
            result: ('select' | 'unselect' | 'add' | 'remove' | 'selectfront' | 'drag' | 'duplicate' | 'delete' | 'place')[],
            conditional: ('leftclick' | 'rightclick' | 'shift' | 'alt' | 'ctrl' | 'key:del')[]
            layer?: Layer,
            container?: Layer,
            classification?: LayerClassification
        }[] = [];

        let hasSelection = this.selectedLayersInfo.length > 0;


        if (Session.instance.selectedTool === 'selector') {

            // list available actions
            if (isCanvas === false) {
                // if no prior selection, select with a click
                if (this.selectedLayersInfo.length === 0) {
                    ret.push( {
                        result: ['select'],
                        conditional: ['leftclick'],
                        layer: layers[0].layer,
                        container: layers[0].layer.parentLayer
                    });
                } else {
                    // is the layer in selection
                    let selected = this.layerIdInSelection(layers[0].layer.id);
                    if (selected) {
                        // if it just one layer selected, a click will unselect
                        if (this.selectedLayersInfo.length === 1) {
                            ret.push({
                                result: ['unselect'],
                                conditional: ['leftclick'],
                                layer: layers[0].layer,
                                container: layers[0].layer.parentLayer
                            });
                        } else {
                            // the selection will be replace with just the layer selected
                            ret.push({
                                result: ['select'],
                                conditional: ['leftclick'],
                                layer: layers[0].layer,
                                container: layers[0].layer.parentLayer
                            });
                        }
                    } else {
                        // the layer is not in the selection

                    }
                }
            } else {
                if (!isDefined(layers)) {
                    return [];
                }

                // classify layers
                let lc: {
                    layer: Layer,
                    isSelected: boolean,
                    isDirectContainer: boolean,
                    isAContainer: boolean,
                    isSibling: boolean
                    isDescendent: boolean,
                    isObfuscated: boolean,
                    isDirectChild: boolean
                }[] = [];

                for (let i = 0; i < layers.length; i += 1) {
                    let layerClass: {
                        layer: Layer,
                        isSelected: boolean,
                        isDirectContainer: boolean,
                        isAContainer: boolean,
                        isSibling: boolean
                        isDescendent: boolean,
                        isObfuscated: boolean,
                        isDirectChild: boolean
                    } = this.classifyLayer(layers[i].layer, canvasX, canvasY);

                    let slc = layerClass.layer.title + ":";
                    if (layerClass.isSelected) {
                        slc += "Sel";
                    }
                    if (layerClass.isDirectContainer) {
                        slc += "DirectCont";
                    }
                    if (layerClass.isAContainer) {
                        slc += "Cont";
                    }
                    if (layerClass.isSibling) {
                        slc += "Sib";
                    }
                    if (layerClass.isDescendent) {
                        slc += "Desc";
                    }
                    if (layerClass.isObfuscated) {
                        slc += "Obs";
                    }
                    if (layerClass.isDirectChild) {
                        slc += "DChild";
                    }
                    //SkLogger.write(slc);

                    if (['unknown','select'].includes(canvasActionCandidate) && this.canSelect(layers,layerClass)) {
                        // can select
                        ret.push({
                            layer: layerClass.layer,
                            conditional: ['leftclick'],
                            container: layerClass.layer.parentLayer,
                            result: ['select'],
                            classification: layerClass
                        });
                    }
                    if (['unknown','select'].includes(canvasActionCandidate) && this.canUnselect(layers,layerClass)) {
                        // can select
                        ret.push({
                            layer: layerClass.layer,
                            conditional: ['leftclick'],
                            container: layerClass.layer.parentLayer,
                            result: ['unselect'],
                            classification: layerClass
                        });
                    }
                    if (['unknown','select'].includes(canvasActionCandidate) && this.canAdd(layers,layerClass)) {
                        // can select
                        ret.push({
                            layer: layerClass.layer,
                            conditional: ['shift','leftclick'],
                            container: layerClass.layer.parentLayer,
                            result: ['add'],
                            classification: layerClass
                        });
                    }
                    if (['unknown','select'].includes(canvasActionCandidate) && this.canRemove(layers,layerClass)) {
                        // can select
                        ret.push({
                            layer: layerClass.layer,
                            conditional: ['shift','leftclick'],
                            container: layerClass.layer.parentLayer,
                            result: ['remove'],
                            classification: layerClass
                        });
                    }
                    if (['unknown','select'].includes(canvasActionCandidate) && this.canSelectFront(layers,layerClass)) {
                        // can select
                        ret.push({
                            layer: layerClass.layer,
                            conditional: ['alt','leftclick'],
                            container: layerClass.layer.parentLayer,
                            result: ['selectfront'],
                            classification: layerClass
                        });
                    }

                    lc.push(layerClass);
                }
            }

        }

        return ret;
    }


    reverseTreeForLayer(layer: Layer): ReverseLeafTree {
        let ret : ReverseLeafTree = undefined;

        let currentLeaf = layer;
        let currentRet: ReverseLeafTree = undefined;
        while (currentLeaf.special_id !== "workspace.views") {
            let view = this.findViewRef(currentLeaf.id);
            let bounds = currentLeaf.calculatedBounds();

            if (currentRet === undefined) {
                currentRet = {
                    view: view,
                    layer: currentLeaf,
                    layerBounds: bounds,
                    prev: undefined
                };
                ret = currentRet;
            } else {
                let newRet = {
                    view: view,
                    layer: currentLeaf,
                    layerBounds: bounds,
                    prev: undefined
                };
                currentRet.prev = newRet;
                currentRet = newRet;
            }

            currentLeaf = currentLeaf.parentLayer;
        }
        return ret;

    }

    findTreeForNodeId(nodeID: string) {
        "use strict";
        let ret = [];
        function _recurseTree(ret, node) {
            if (node && node.special_id !== "workspace.views") {
                ret.push(node);
                // if the current node is a page, we stop here
                if (node.isPage === true) {
                    return ret;
                }
                // if not we search the parent
                let parent = node.parentLayer;
                if (parent) {
                    ret = _recurseTree(ret, parent);
                }
            }
            return ret;
        }
        let node = this.workspaceRef.layersTree.find(nodeID);
        if (node) {
            ret = _recurseTree(ret, node);
        }
        return ret;
    }





    testBoundsWithPointer(bounds: Bounds, x: NumberWithUnit, y: NumberWithUnit): boolean {
        if (x.amount >= bounds.x.amount && x.amount <= (bounds.x.amount + bounds.width.amount) && y.amount >= bounds.y.amount && y.amount <= (bounds.y.amount + bounds.height.amount)) {
            return true;
        }
        return false;
    }


    //// DRAW
    private arrayOfNodesToDisplay (): Layer[] {
        return this.workspaceRef.layersTree.children;
    }


    drawElementNode(node: Layer, pageLayer: Layer, symbol_node: Layer | undefined, isSymbol: boolean, attachTo: any, drawTitle: boolean, checkForOldView, onlyDrawViews?: boolean) {
        "use strict";

        if (!isDefined(Application) || !isDefined(Application.instance)) {
            throw `method ${getCallerFunctionName()} cannot be called from the command line`;
        }


        if (onlyDrawViews === undefined) {
            onlyDrawViews = false;
        }
        let properties = node.properties;

        let v: View & ILayoutEditorView;
        let type = null;
        let content_node: Layer = null;
        let content_bounds: Bounds = null;
        let content_properties: LayerProperty[] = null;
        let content_anchors = null;

        if (isDefined(symbol_node)) {
            type = symbol_node.type;
            content_node = symbol_node;
            content_bounds = node.bounds();
            content_properties = symbol_node.properties;
            content_anchors = node.anchors();
        } else {
            type = node.type;
            content_node = node;
            content_bounds = node.bounds();
            content_properties = properties;
            content_anchors = node.anchors();
        }
        if (node.dontInstantiate === true) {
            // get the parent node
            let parentNode = node.parentLayer;
            SkLogger.write('node.dontInstantiate ' + node.title, node.id);
            SkLogger.write('parentNode is ', parentNode.title);
            let parentView = this.findViewRef(parentNode.id);
            if (!isDefined(parentView)) {
                SkLogger.write("could not find view of parentNode", parentNode.title);
                return undefined;
            }
            if (!isDefined(parentView.layoutEditorViewForSubNode)) {
                SkLogger.write("layoutEditorViewForSubNode not implemented.", parentNode.title);
                return undefined;
            }

            // View cannot be fully defined in skeletcore
            try {
                // @ts-ignore
                v = parentView.layoutEditorViewForSubNode(parentNode, node);
            } catch (errorSubNode) {
                v = new LayerView();
            }
            v.isLayoutEditor = true;
            v.isNodeTitle = false;
            v.nodeRef = node;
            v.pageLayerRef = pageLayer;
            v.layerProperties = properties;
            // content_properties = node.properties;
            for (let i = 0; i < content_properties.length; i++) {
                if (isDefined(v.applyLayoutProperty)) {
                    v.applyLayoutProperty(content_properties[i].property_id, content_properties[i].value);
                }
            }

            if (onlyDrawViews !== true) {

            }
            // is it in the selected list ?
            //if (layerIdInSelection(node.id)) {
//            setSelected(node.id, true);
            //      }



            if (((!isDefined(symbol_node) && (isSymbol === false)) || isDefined(symbol_node))) {
                if (onlyDrawViews !== true) {

                    this.currentEditorMode.viewDrawn(v, v.nodeRef);



                    //v.setClickDelegate(this, "onObjectClicked");
                    //if (isDefined(v.layoutEditorSupportsDoubleClick) && v.layoutEditorSupportsDoubleClick(v.nodeRef) === true) {
                    //    v.setDoubleClickDelegate(this, "onObjectDoubleClicked");
                    //}
                    /*
                    v.getDiv().addEventListener("mouseover", function (event: MouseEvent) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (this.viewRef) {
                            onObjectHoveredIn(this.viewRef, event);
                        }
                    });
                    v.getDiv().addEventListener("mouseout", function (event: MouseEvent) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (this.viewRef) {
                            onObjectHoveredOut(this.viewRef, event);
                        }
                    });

                     */

                }

            }

            this.deleteViewRefOnly(v.id);
            this.viewRefs.push(v);

            this.calculateRealViewBounds(v);

            return v;
        } else {
            SkLogger.write("Layer " + type + " " + node.className);
            if (type === "frame") {
                v = new LayerView();
            } else if (type === "label") {
                v = new LayerLabel();
            } else if (type === "image") {
                v = new LayerImageView();
            } else if (type === "object") {
                if (isDefined(node.className)) {
                    // find the control
                    let sk: SkeletControl = findControlForClassName(node.className);
                    if (sk === undefined) {
                        SkLogger.write("Could not instantiate type " + node.className);
                        SkLogger.write("Are you missing a plugin ?");
                        return undefined;
                    }
                    try {
                        v = Object.assign(new sk.controlClass(), {});
                    } catch (objectAssignError) {
                        SkLogger.write("Could not instantiate type " + node.className);
                        SkLogger.write("controlClass not implemented in plugin " + sk.name);
                        throw objectAssignError;
                        return undefined;
                    }
                    //eval("v = new " + node.className + "();");
                    v.isLayoutEditor = true;
                    if (isDefined(sk.componentID)) {
                        v.symbolID = sk.componentID;
                    }
                }
            } else if (type === "canvas") {
                v = new LayerCanvas();
            } else if (type === 'report') {
                v = new LayerView();
            } else if (type.startsWith('report-')) {
                v = new LayerView();
            } else {
                SkLogger.write("NOT IMPLEMENTED TYPE " + type);
                return undefined;
            }
        }

        v.isLayoutEditor = true;
        for (let i = 0; i < content_properties.length; i++) {
            if (isDefined(v.applyLayoutProperty)) {
                try {
                    if (content_properties[i].property_id === "view.bounds" && node.isPage) {
                        let newBounds = safeCopy(content_properties[i].value);
                        newBounds.x = px(NUConvertToPixel(newBounds.x).amount + 4800);
                        newBounds.y = px(NUConvertToPixel(newBounds.y).amount + 4800);
                        v.applyLayoutProperty("view.bounds",newBounds);

                    } else {

                        v.applyLayoutProperty(content_properties[i].property_id, content_properties[i].value);
                    }

                } catch (applyLayoutPropertyError) {
                    SkLogger.write("Could not apply property " + content_properties[i].property_id + " to " + node.className);
                    // return undefined;
                }
            }
        }

        if (!isDefined(symbol_node) && isSymbol === true) {
            // a copy
            v.nodeId = node.id + "-" + generateV4UUID();
        } else {
            v.nodeId = node.id;
        }
        v.keyValues["node_type"] = type;
        v.viewController = new ViewController();

        if (!isDefined(content_anchors["top"])) {
            SkLogger.write("Layer " + node.id + " does not have proper anchors.");
            SkLogger.write("Layer", node.title);
            SkLogger.write("Type", type);
            SkLogger.write("isSymbol", isSymbol);
            SkLogger.write("Symbol_node", symbol_node.id);
            SkLogger.write("content_anchors", content_anchors);

        }


        v.anchor("top", content_anchors["top"].active, content_anchors["top"].target, content_anchors["top"].targetAnchor, (content_anchors["top"].constant));
        v.anchor("left", content_anchors["left"].active, content_anchors["left"].target, content_anchors["left"].targetAnchor, (content_anchors["left"].constant));
        v.anchor("right", content_anchors["right"].active, content_anchors["right"].target, content_anchors["right"].targetAnchor, (content_anchors["right"].constant));
        v.anchor("bottom", content_anchors["bottom"].active, content_anchors["bottom"].target, content_anchors["bottom"].targetAnchor, (content_anchors["bottom"].constant));
        v.anchor("width", content_anchors["width"].active, null, null, (content_anchors["width"].constant));
        v.anchor("height", content_anchors["height"].active, null, null, (content_anchors["height"].constant));

        if (!isDefined(symbol_node) && isSymbol === true) {
            v.nodeRef = node;
            v.isSymbol = true;
        } else if (isDefined(symbol_node)) {
            v.nodeRef = node;
            v.isSymbol = true;
        } else {
            v.nodeRef = node;
            v.isSymbol = false;
        }

        // v.boundsForView deprec
        /*
        v.boundsForView = function (parentBounds: Bounds): Bounds {
            // get the canvas zoom
            let ret: Bounds = new Bounds(0, 0, 0, 0);
            let bounds: Bounds = this.nodeRef.bounds();

            if (isDefined(bounds.x)) {
                ret.x = bounds.x;
            } else {
                ret.x = new NumberWithUnit(0, "auto");
            }
            if (isDefined(bounds.y)) {
                ret.y = bounds.y;
            } else {
                ret.y = new NumberWithUnit(0, "auto");
            }
            if (isDefined(bounds.width)) {
                ret.width = bounds.width;
            } else {
                ret.width = new NumberWithUnit(0, "auto");
            }
            if (isDefined(bounds.height)) {
                ret.height = bounds.height;
            } else {
                ret.height = new NumberWithUnit(0, "auto");
            }
            if (isDefined(bounds.position)) {
                ret.position = bounds.position;
            } else {
                ret.position = 'absolute';
            }
            if (isDefined(bounds.unit)) {
                ret.unit = bounds.unit;
            } else {
                ret.unit = "px";
            }
            if (isDefined(bounds.rotation)) {
                ret.rotation = bounds.rotation;
            } else {
                ret.rotation = new NumberWithUnit(0, "deg");
            }
            if (isDefined(bounds.elevation)) {
                ret.elevation = bounds.elevation;
            } else {
                ret.elevation = new NumberWithUnit(0, "auto");
            }

            if (isDefined(bounds.rotationY)) {
                ret.rotationY = bounds.rotationY;
            } else {
                ret.rotationY = px(0);
            }

            if (isDefined(bounds.rotationX)) {
                ret.rotationX = bounds.rotationX;
            } else {
                ret.rotationX = px(0);
            }

            if (isDefined(bounds.rotationOriginX)) {
                ret.rotationOriginX = bounds.rotationOriginX;
            } else {
                ret.rotationOriginX = new NumberWithUnit(50, "%");
            }

            if (isDefined(bounds.rotationOriginY)) {
                ret.rotationOriginY = bounds.rotationOriginY;
            } else {
                ret.rotationOriginY = new NumberWithUnit(50, "%");
            }

            if (isDefined(bounds.z)) {
                ret.z = bounds.z;
            } else {
                ret.x = px(0);
            }

            if (isDefined(bounds.scaleX)) {
                ret.scaleX = bounds.scaleX;
            } else {
                ret.scaleX = new NumberWithUnit(100, "%");
            }

            if (isDefined(bounds.scaleY)) {
                ret.scaleY = bounds.scaleY;
            } else {
                ret.scaleY = new NumberWithUnit(100, "%");
            }

            if (isDefined(bounds.skewX)) {
                ret.skewX = bounds.skewX;
            } else {
                ret.skewX = new NumberWithUnit(0, "deg");
            }

            if (isDefined(bounds.skewY)) {
                ret.skewY = bounds.skewY;
            } else {
                ret.skewY = new NumberWithUnit(0, "deg");
            }


            return ret;

        };
         */


        try {
            v.initView(node.id);
        } catch (initViewError) {
            SkLogger.write("Could not init control " + node.id);
            return undefined;
        }

        if (type === "canvas") {
            for (let cs = 0; cs < content_node.children.length; cs += 1) {
                (v as any as LayerCanvas).shapes.push(content_node.children[cs]);
            }
        }

        if (attachTo.isView === true) {
            try {
                attachTo.el.attach(v);
            } catch (attachToError) {
                SkLogger.write("Could not attach control "  + node.id);
                return undefined;
            }
            v.parentView = attachTo.el;
        } else {
            v.parentView = this.canvasViewRef; // this.view.canvas;
            attachTo.el.appendChild(v.getDiv());
        }


        if (symbol_node === null && isSymbol === true) {
            v.getDiv().viewRef = v;
        } else {
            //v.isResizable = true;
            v.getDiv().viewRef = v;
            //v.dragDelegate = v;
        }
        v.viewWillBeDragged = function (parentView, options?: { event: Event }) {
            throw "canvasDraw.ts: v.viewWillBeDragged should not be called";
            /*
            let layer: Layer = this.nodeRef;
            let layerBounds: Bounds = calculateBounds(layer, "");
            let parentLayer: Layer = findParentNode(layer.id);
            let parentLayerBounds: Bounds = calculateBounds(parentLayer, "");

            let eventInfo: EventInfo = {
                view: this,
                layer: layer,
                layerCalculatedBounds: layerBounds,
                parentLayer: parentLayer,
                parentLayerCalculatedBounds: parentLayerBounds,
                mouseEvent: options.event as MouseEvent,
                canvasViewRef: Session.instance.canvasViewRef
            };

            return Session.instance.currentEditorMode.viewWillBeDragged(eventInfo);
            */
        };
        v.viewWasDragged = function (view: View, options: {
            event: Event,
            x: number,
            y: number
        }) {
            throw "canvasDraw.ts: v.viewWasDragged should not be called";
            /*
            let layer: Layer = this.nodeRef;
            let layerBounds: Bounds = calculateBounds(layer, "");
            let parentLayer: Layer = findParentNode(layer.id);
            let parentLayerBounds: Bounds = calculateBounds(parentLayer, "");

            let eventInfo: EventInfo = {
                view: this,
                layer: layer,
                layerCalculatedBounds: layerBounds,
                parentLayer: parentLayer,
                parentLayerCalculatedBounds: parentLayerBounds,
                mouseEvent: options.event as MouseEvent,
                canvasViewRef: Session.instance.canvasViewRef
            };

            Session.instance.currentEditorMode.viewWasDragged(eventInfo, options.x, options.y);
            */
        };

        v.viewIsBeingDragged = function (view, options: {
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
            throw "canvasDraw.ts: v.viewIsBeingDragged should not be called";
            /*
            let layer: Layer = this.nodeRef;
            let layerBounds: Bounds = calculateBounds(layer, "");
            let parentLayer: Layer = findParentNode(layer.id);
            let parentLayerBounds: Bounds = calculateBounds(parentLayer, "");

            let eventInfo: EventInfo = {
                view: this,
                layer: layer,
                layerCalculatedBounds: layerBounds,
                parentLayer: parentLayer,
                parentLayerCalculatedBounds: parentLayerBounds,
                mouseEvent: options.event as MouseEvent,
                canvasViewRef: Session.instance.canvasViewRef
            };

            Session.instance.currentEditorMode.viewBeingDragged(eventInfo, options);
            */
        };




        v.isNodeTitle = false;
        if (onlyDrawViews === false) {
            this.viewRefs.push(v);
        }

        //drawTitle = true;
        //@ts-ignore
        if (drawTitle === true) {

            let titleBar = new LayerView();
            titleBar.nodeId = node.id;
            titleBar.layerProperties = v.layerProperties;
            titleBar.pageLayerRef = v.pageLayerRef;
            titleBar.isNodeTitle = true;
            // titleBar.vcRef = this;
            titleBar.nodeRef = node;
            // titleBar.overflow = 'hidden';
            titleBar.boundsForView = function (parentBounds: Bounds): Bounds {
                let bounds: Bounds = this.nodeRef.rawBounds();
                return {
                    kind: "Bounds",
                    x: px(NUConvertToPixel(bounds.x).amount + 4800),
                    y: px(NUConvertToPixel(bounds.y).amount + 4800 - 25),
                    width: bounds.width,
                    height: px(25),
                    unit: "px",
                    position: "absolute"
                };
            };
            titleBar.viewWasAttached = function () {

                let bounds: Bounds = this.nodeRef.rawBounds();

                let t = new LayerLabel();

                t.keyValues["nodeId"] = node.id;
                t.keyValues["isNodeTitle"] = true;
                t.keyValues["vcRef"] = this;
                t.keyValues["nodeRef"] = node;
                t.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                    return {
                        x: 0,
                        y: 0,
                        width: parentBounds.width - 150 - 10,
                        height: (25),
                        unit: "px",
                        position: "absolute"
                    };
                };
                t.fillLineHeight = true;
                t.fontSize = 12;
                t.text = node.title;

                t.fontWeight = '300';
                t.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                t.fontColor = "rgb(0,15,178)";
                if (node.isSymbol === true) {
                    t.fontColor = "rgb(250,50,50)";
                    t.text = "<span style='font-family:FontAwesome5ProLight;'>&#xf021;</span>&nbsp;" + node.title;
                }
                if (node.isSymbolInstance === true) {
                    t.text = "<span style='font-family:FontAwesome5ProLight;'>&#xf021;</span>&nbsp;" + node.title;
                }

                t.initView(node.id + ".title");
                this.attach(t);

                let s = new Drp();
                s.keyValues["nodeId"] = node.id;
                s.keyValues["isNodeTitle"] = true;
                s.keyValues["vcRef"] = this;
                s.keyValues["nodeRef"] = node;
                s.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {

                    return {
                        x: parentBounds.width - 150,
                        y: 0,
                        width: 150,
                        height: (20),
                        unit: "px",
                        position: "absolute"
                    };
                };
                let currentSizeTitle = '';
                if ((node as any).sizeTitle) {
                    currentSizeTitle = (node as any).sizeTitle;
                } else {
                    currentSizeTitle = `{"title": "${bounds.width.amount}${bounds.width.unit} * ${bounds.height.amount}${bounds.height.unit}", "width": ${bounds.width.amount}, "height": ${bounds.width.amount}}`;
                }
                s.dataSource = [
                    {
                        id: currentSizeTitle,
                        text: JSON.parse(currentSizeTitle).title
                    }
                ];
                s.initView(node.id + ".title");
                this.attach(s)
                s.setSelectedItem(currentSizeTitle);
                s.setVisible(false);

                this.keyValues["labelTitle"] = t;
                this.keyValues["drpSize"] = s;

            }
            titleBar.initView(node.id + ".title");
            if (attachTo.isView === true) {
                attachTo.el.attach(titleBar);
            } else {
                attachTo.el.appendChild(titleBar.getDiv());
                titleBar.parentView = this.canvasViewRef; // this.view.canvas;
                titleBar.viewWasAttached();
            }

            this.viewRefs.push(titleBar);

        }


        // clear all events on elements
        let el = v.getDiv();

        function remove_events(el: HTMLElement) {
            el.onmouseover = null;
            el.onmouseout = null;
            el.onclick = null;
            el.ondblclick = null;
            el.oncontextmenu = null;
            for (let i = 0; i < el.children.length; i += 1) {
                remove_events(el.children[i] as HTMLElement);
            }
        }

        remove_events(el);

        if (node.type !== "frame" && node.className !== "MentatJS.View" && node.className !== "MentatJS.ListView" && node.className !== "MentatJS.CollectionView" && node.className !== "MentatJS.TableView") {
            // @ts-ignore
            /*
            v.renderBefore = v.render;
            v.render = function () {
                this.renderBefore();
                let vCacheExists = this.findViewNamed(this.id + ".cacheLayer");
                if (isDefined(vCacheExists)) {
                    this._detachView(vCacheExists);
                }
                let vCache = new View();
                vCache.boundsForView = function (parentBounds: Bounds) {
                    return fillParentBounds(parentBounds);
                }
                vCache.initView(v.id + ".cacheLayer");
                v.attach(vCache);
            }

             */
        }

        v.viewController = new ViewController();

        // is it in the selected list ?
        //if (onlyDrawViews !== true) {
//        if (layerIdInSelection(node.id)) {
//            setSelected(node.id, true);
//        }
//    }

        v.processStyleAndRender("", []);

        //this.calculateRealViewBounds(v);

        if (((symbol_node === null) && (isSymbol === false)) || (symbol_node !== null)) {
            if (onlyDrawViews !== true) {
                this.currentEditorMode.viewDrawn(v, v.nodeRef);
            }
        }




        if (isDefined(v.layoutEditorViewDrawn)) {
            //@ts-ignore
            v.layoutEditorViewDrawn(node, v, this);
        }



        return v;

    }


    drawElement (node: Layer, pageLayer: Layer, attachTo: { el: View | HTMLElement | DocumentFragment, isView: boolean}, drawTitle: boolean, isSymbol: boolean, checkForOldView: boolean, onlyDrawViews: boolean) {

        if (onlyDrawViews === undefined) {
            onlyDrawViews = false;
        }

        if (node.type === "group") {
            for ( let j = 0; j < node.children.length; j++) {
                try {
                    this.drawElement(node.children[j], pageLayer, attachTo, false, isSymbol, checkForOldView, onlyDrawViews);
                } catch (error) {
                    console.warn(error.message, error);
                }
            }
            return;
        }
        if (checkForOldView === true) {
            let idx = this.viewRefs.length-1;
            while (idx >= 0) {
                if ((this.viewRefs[idx] as any).id === node.id) {
                    if (node.dontInstantiate !== true) {
                        (this.viewRefs[idx] as any as View).detachItSelf();
                        this.viewRefs[idx] = null;
                    }
                    this.viewRefs.splice(idx,1);
                }
                idx = idx - 1;
            }
        }

        //var selectedZoom = this.view.topBar.ZoomBar.canvasZoom.getSelectedItem();
        //var zoom = parseFloat(selectedZoom.id);
        let n: Layer = null;
        let v = null;


        if (node.type === "symbolInstance") {
            // find the symbol
            let symbol_node = findSymbolNode(node.symbolID);
            n = symbol_node;
            isSymbol = true;
            // v = this.drawNodeEL(node, symbol_node, isSymbol, attachTo, drawTitle, checkForOldView);
            try {
                v = this.drawElementNode(node, pageLayer, symbol_node, isSymbol, attachTo, drawTitle, checkForOldView, onlyDrawViews);
            } catch (error) {
                console.warn(error.message, error);
            }
            // apply exported properties

        } else {
            n = node;
            // v = this.drawNodeEL(node, null, isSymbol, attachTo, drawTitle, checkForOldView);
            try {
                v = this.drawElementNode(node, pageLayer, null, isSymbol, attachTo, drawTitle, checkForOldView, onlyDrawViews);
            } catch (error) {
                console.warn(error.message, error);
            }
        }

        if (n.type !== "canvas") {
            for (let j = n.children.length - 1; j >= 0; j--) {
                try {
                    this.drawElement(n.children[j], pageLayer, {
                        el: v,
                        isView: true
                    }, false, isSymbol, checkForOldView, onlyDrawViews);
                } catch (error) {
                    console.warn(error.message, error);
                }
            }
        }

        if (isDefined(v)) {
            try {
                v.doResize();
            } catch (error) {
                console.warn(error.message, error);
            }

            if (node.isVisible === false) {
                v.setVisible(false);
            }
        }
        return v;

    }

    drawElementsOnCanvas(drawOnly?: boolean) {

        let onlyDrawViews = false;
        if (isDefined(drawOnly)) {
            onlyDrawViews = drawOnly;
        }

        this.removeAllViews();

        this.canvasViewRef.detachAllChildren();

        let fragment = document.createDocumentFragment();
        let container = {
            el: fragment,
            isView: false
        };

        let array = this.arrayOfNodesToDisplay();
        for ( let i = array.length -1; i >= 0; i--) {
            let pageLayer =array[i].pageLayer;
            this.drawElement(array[i], pageLayer, container, true, array[i].type === "symbolInstance", false, onlyDrawViews);
        }

        requestAnimationFrame(() => {
            Application.instance.isInAnimationFrame = true;
            this.canvasViewRef.getDiv().appendChild(fragment);

            // force render on canvas views
            /*
            for (let idx = 0; idx < this.viewRefs.length; idx += 1) {
                let v = this.viewRefs[idx];
                if (v) {
                    //if (v.nodeRef.type === 'canvas') {
                    if ((v as any).visible === false) {
                        continue;
                    }
                    try {
                        (v as any as View).processStyleAndRender("", []);
                    } catch (error) {
                        console.warn(error.message, error);
                    }

                }
            }

             */

            Application.instance.isInAnimationFrame = false;

        });

        this.calculateAllRealViewBounds();
        this.currentEditorMode.redrawSelectionAndHighlight();


    }



    showHints(components: (string | View)[]) {

        this.removeHints();
        let v = this.createHintView();
        this._hintsPopup = v;
        this.canvasViewRef.parentView.attach(v);

        let inside = new View();
        inside.boundsForView = function (parentBounds: Bounds) {
            return new Bounds(5, 5, this.keyValues["width"], this.keyValues["height"]);
        };
        inside.keyValues["width"] = 300;
        inside.keyValues["height"] = 24;
        inside.initView("hintContent");
        v.attach(inside);

        let widths = [];

        let x = 0;
        let y = 0;
        let h = 0;


        for (let i = 0; i < components.length; i += 1) {
            let t = components[i];
            if (typeof t === "string") {
                if ((t as string) === "\r\n") {
                    h += 24;
                    y += 24;
                    widths.push(x);
                    x = 0;

                } else {
                    let l = new Label();
                    l.keyValues["x"] = x;
                    l.keyValues["y"] = y;
                    l.keyValues["width"] = undefined;
                    l.keyValues["height"] = 24;
                    l.boundsForView = function (pb) {
                        let x = this.keyValues["x"];
                        let y = this.keyValues["y"];
                        let width = (this.keyValues["width"] === undefined) ? undefined : px(this.keyValues["width"]);
                        return {
                            kind: "Bounds",
                            x: px(x),
                            y: px(y),
                            width: width,
                            height: px(24),
                            unit: 'px',
                            position: 'absolute',
                            rotation: new NumberWithUnit(0, "deg"),
                            elevation: new NumberWithUnit(0, "auto")
                        };
                    }
                    l.text = t as string;
                    l.wordBreak = 'keep-all';
                    l.whiteSpace = 'normal';
                    l.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                    l.fontSize = 11;
                    l.fontColor = "rgb(250,250,250)";
                    l.textAlignment = "left";
                    l.fillLineHeight = true;
                    l.initView("hintComp" + i);
                    inside.attach(l);
                    l.getDiv().display = 'inline-block';

                    let realWidth = (l.getDiv() as HTMLElement).getBoundingClientRect().width;
                    // SkLogger.write(`realWidth ${realWidth}`);
                    l.keyValues["width"] = realWidth;
                    x += realWidth;

                }
            } else {
                (t as View).keyValues["x"] = x;
                (t as View).keyValues["y"] = y;
                x += (t as View).keyValues["width"];
                inside.attach(t as View);
            }
        }
        widths.push(x);
        h += 24;
        inside.keyValues["width"] = Math.max(...widths);
        inside.keyValues["height"] = h;
        v.doResize();
        v.processStyleAndRender("", [])
    }


    createHintView(): View {
        let v = new View();
        v.boundsForView = function (parentBounds): Bounds {
            let innerViewSize: Bounds = new Bounds(10, 10, 100, 30);
            if (v.subViews.length === 1) {
                innerViewSize.width = px(v.subViews[0].keyValues["width"]);
                innerViewSize.height = px(v.subViews[0].keyValues["height"]);
            }
            return {
                kind: "Bounds",
                x: px(30),
                y: px(NUConvertToPixel(parentBounds.height).amount - NUConvertToPixel(innerViewSize.height).amount - 20),
                width: px(NUConvertToPixel(innerViewSize.width).amount + 10),
                height: px(NUConvertToPixel(innerViewSize.height).amount + 10),
                unit: 'px',
                position: "absolute",
                rotation: new NumberWithUnit(0, "deg"),
                elevation: new NumberWithUnit(0, "auto")
            }
        }
        v.dontCacheStyle = true;
        v.fills = [new Fill(true, "color", "normal", "rgba(10, 10, 10, 0.6)")];
        v.borderRadius = new BorderRadius(6, 6, 6, 6);
        v.initView("hintsPopup");
        return v;
    }


    removeHints() {
        //if (isDefined(Application.instance.keyValues["hintsPopup"])) {
        if (isDefined(this._hintsPopup)) {
            let v = this._hintsPopup as View;
            v.detachItSelf();
            this._hintsPopup = undefined;
        }
    }




    clearOverlapViews() {
        for (let i = 0; i < this.snapGuidesViews.overlapViews.length; i += 1) {
            this.snapGuidesViews.overlapViews[i].detachItSelf();
        }
    }

    clearSnapViews (node: Layer) {
        if (node.isPage === false) {
            for (let i = 0; i < this.snapGuidesViews.allViews.length; i += 1) {
                this.snapGuidesViews.allViews[i].detachItSelf();
            }
            for (let i = 0; i < this.snapGuidesViews.overlapViews.length; i += 1) {
                this.snapGuidesViews.overlapViews[i].detachItSelf();
            }

            this.snapGuidesViews = {
                allViews: [],
                overlapViews: [],
            };
        }
    }


    recalculateRulers() {

        let offset_x = 0;
        let offset_y = 0;

        if (isDefined(this.workspaceRef)) {
            let origin = this.workspaceRef.viewportOrigin;
            offset_x = NUConvertToPixel(origin.x).amount;
            offset_y = NUConvertToPixel(origin.y).amount;
        }

        if (this.horizontalRulerRef !== null) {
            (this.horizontalRulerRef as Ruler).set(offset_x);
        }
        if (this.verticalRulerRef !== null) {
            (this.verticalRulerRef as Ruler).set(offset_y);
        }

    }



    pushHistory(title: string) {

        if (this.commitHistoryTimeoutHandle !== null) {
            clearTimeout(this.commitHistoryTimeoutHandle);
            this.batchHistories = [];
        }
        this.commitHistoryBatch();
        setTitle(Session.instance.currentTitle, true);


        this.takeSnapshot(title);


    }

    takeSnapshot(title: string) {
        let snap: HistorySnapshot = {
            id: generateV4UUID(),
            document_guid: this.documentRef.projectSettings.project_guid,
            workspace_guid: this.workspaceRef.workspace_guid,
            time: + new Date(),
            title: title
        };
        let data :LayerData[] = this.workspaceRef.layersTree.flatten();
        let content = JSON.stringify(data);
        SkeletWebSocket.instance.send(WSRSnapshotWrite, {
            snapshotInfo: snap,
            content: content
        } as IWSRSnapshotWriteRequest)
    }

    batchHistory(nodeId: string, propertyTitle: string) {
        if (this.commitHistoryTimeoutHandle !== null) {
            clearTimeout(this.commitHistoryTimeoutHandle);
        }

        if (this.batchHistories.length > 0) {
            if (this.batchHistories[this.batchHistories.length - 1].nodeId !== nodeId) {
                this.commitHistoryBatch();
            }
        }
        this.batchHistories.push({nodeId: nodeId, propertyTitle: propertyTitle});

        this.commitHistoryTimeoutHandle = setTimeout(() => {
            this.commitHistoryTimeoutHandle = null;
            this.commitHistoryBatch()
        },500)
    }


    commitHistoryBatch() {
        if (this.batchHistories.length > 0) {
            let node = this.workspaceRef.layersTree.find(this.batchHistories[this.batchHistories.length - 1].nodeId);
            let title = '';
            if (this.batchHistories.length > 1) {
                title = `Properties changed for Layer ${node.title}`;
            } else {
                title = `Property ${this.batchHistories[0].propertyTitle} changed for Layer ${node.title}`;
            }

            this.takeSnapshot(title);

            //Application.instance.notifyAll(this, kNotifications.noticeHistoryAdded);
            this.batchHistories = [];
        }
    }


    check_collisions(dragPayload) {

        for (let i = 0; i < dragPayload.nodes.length; i += 1) {
            let n: Layer = dragPayload.nodes[i].node;
            let p: Layer = dragPayload.nodes[i].parentNode;
            let pv: View = dragPayload.nodes[i].view;

            let bounds = n.bounds();


            if (isDefined(p) && isDefined(pv)) {

                for (let x = 0; x < p.children.length; x += 1) {
                    let sv = p.children[x];
                    if (sv.id !== n.id) {

                        // does it overlap
                        if (nodesBounds_overlap(bounds, sv.bounds())) {

                            let svp = sv.parentLayer;
                            let svpv = this.findViewRef(svp.id);

                            let overlap = new View();
                            overlap.keyValues["linkedNode"] = sv;
                            overlap.boundsForView = function (parentBounds: Bounds): Bounds {
                                if (isDefined(this.keyValues["linkedNode"])) {
                                    return { ...this.keyValues["linkedNode"].bounds(), unit: "px", position: "absolute" };
                                }
                                return boundsWithPixels({ x: 0, y: 0, width: 0, height: 0, unit: 'px', position: 'absolute'});
                            };
                            overlap.fills = [{active: true, type: 'color', blendMode: "normal", value: "rgba(250, 100, 100, 0.5)"}];
                            overlap.initView(generateV4UUID());
                            svpv.attach(overlap);

                            this.snapGuidesViews.overlapViews.push(overlap);
                        }
                    }
                }

            }

        }

    }


    getAlignmentLines(nodes: {node: Layer, parentNode?: Layer}[]): { x?: NumberWithUnit, y?: NumberWithUnit, node: Layer, isParent: boolean, testOrigin?: string, magnet: string[], attachLine: View}[] {
        let ret : { x?: NumberWithUnit, y?: NumberWithUnit, node: Layer, isParent: boolean, testOrigin?: string, magnet: string[], attachLine: View}[] = [];

        for (let i = 0; i < nodes.length; i += 1) {
            let n = nodes[i].node;
            let p = nodes[i].parentNode;
            let pb = p.bounds();
            let margin = { l: px(5), r: px(5), t: px(5), b: px(5) };
            let marginProperty = p.property("view.margin");
            if (isDefined(marginProperty)) {
                margin = marginProperty.value;
            }
            let pv = this.findViewRef(p.id);

            // container bounds & margins
            // left right
            ret.push({
                x: px(0),
                node: p,
                isParent: true,
                magnet: ['leftSide'],
                attachLine: pv
            });
            ret.push({
                x: NUConvertToPoint(margin.l),
                node: p,
                isParent: true,
                magnet: ['leftSide'],
                attachLine: pv
            });
            ret.push({
                x: NUConvertToPoint(pb.width),
                node: p,
                isParent: true,
                magnet: ['rightSide'],
                attachLine: pv
            });
            ret.push({
                x: px(NUConvertToPoint(pb.width).amount - NUConvertToPoint(margin.r).amount),
                node: p,
                isParent: true,
                magnet: ['rightSide'],
                attachLine: pv
            });
            // top bottom
            ret.push({
                y: px(0),
                node: p,
                isParent: true,
                magnet: ['topSide'],
                attachLine: pv
            });
            ret.push({
                y: NUConvertToPoint(margin.t),
                node: p,
                isParent: true,
                magnet: ['topSide'],
                attachLine: pv
            });
            ret.push({
                y: NUConvertToPoint(pb.height),
                node: p,
                isParent: true,
                magnet: ['bottomSide'],
                attachLine: pv
            });
            ret.push({
                y: px(NUConvertToPoint(pb.height).amount - NUConvertToPoint(margin.b).amount),
                node: p,
                isParent: true,
                magnet: ['bottomSide'],
                attachLine: pv
            });
            // middle
            /*
            ret.push({
                x: (pb.width) / 2,
                node: p,
                isParent: true,
                magnet: ['middleX']
            });
            ret.push({
                y: (pb.height) / 2,
                node: p,
                isParent: true,
                magnet: ['middleY']
            });
            */


            for (let x = 0; x < p.children.length; x += 1) {
                let psv = p.children[x];
                // don't process nodes which are selected
                if (this.layerIdInSelection(psv.id)) {
                    continue;
                }

                let psvb = psv.bounds();

                let psv_margin = margin;
                let psv_marginProperty = psv.property("view.margin");
                if (isDefined(psv_marginProperty)) {
                    psv_margin = psv_marginProperty.value;
                }

                ret.push({
                    x: NUConvertToPoint(psvb.x),
                    node: psv,
                    isParent: false,
                    magnet: ['leftSide','rightSide'],
                    testOrigin: 'rightOf',
                    attachLine: pv
                });
                ret.push({
                    x: px(NUConvertToPoint(psvb.x).amount - NUConvertToPoint(psv_margin.l).amount),
                    node: psv,
                    isParent: false,
                    magnet: ['leftSide', 'rightSide'],
                    testOrigin: 'rightOf',
                    attachLine: pv
                });
                ret.push({
                    x: px(NUConvertToPoint(psvb.x).amount + NUConvertToPoint(psvb.width).amount),
                    node: psv,
                    isParent: false,
                    magnet: ['leftSide', 'rightSide'],
                    testOrigin: 'leftOf',
                    attachLine: pv
                });
                ret.push({
                    x: px(NUConvertToPoint(psvb.x).amount + NUConvertToPoint(psvb.width).amount + NUConvertToPoint(psv_margin.r).amount),
                    node: psv,
                    isParent: false,
                    magnet: ['leftSide', 'rightSide'],
                    testOrigin: 'leftOf',
                    attachLine: pv
                });
                ret.push({
                    x: px(NUConvertToPoint(psvb.x).amount + NUConvertToPoint(psvb.width).amount / 2),
                    node: psv,
                    isParent: false,
                    magnet: ['middleX'],
                    testOrigin: 'all',
                    attachLine: pv
                });
                ret.push({
                    y: NUConvertToPoint(psvb.y),
                    node: psv,
                    isParent: false,
                    magnet: ['topSide', 'bottomSide'],
                    testOrigin: 'all',
                    attachLine: pv
                });
                ret.push({
                    y: px(NUConvertToPoint(psvb.y).amount - NUConvertToPoint(psv_margin.t).amount),
                    node: psv,
                    isParent: false,
                    magnet: ['topSide', 'bottomSide'],
                    testOrigin: 'all',
                    attachLine: pv
                });
                ret.push({
                    y: px(NUConvertToPoint(psvb.y).amount + NUConvertToPoint(psvb.height).amount),
                    node: psv,
                    isParent: false,
                    magnet: ['topSide', 'bottomSide'],
                    testOrigin: 'all',
                    attachLine: pv
                });
                ret.push({
                    y: px(NUConvertToPoint(psvb.y).amount + NUConvertToPoint(psvb.height).amount + NUConvertToPoint(psv_margin.b).amount),
                    node: psv,
                    isParent: false,
                    magnet: ['topSide', 'bottomSide'],
                    testOrigin: 'all',
                    attachLine: pv
                });
                ret.push({
                    y: px(NUConvertToPoint(psvb.y).amount + NUConvertToPoint(psvb.height).amount / 2),
                    node: psv,
                    isParent: false,
                    magnet: ['middle'],
                    testOrigin: 'all',
                    attachLine: pv
                });



            }
        }

        return ret;
    }


    drawAlignmentLines(dragPayload: DragPayload) {
        let ret = dragPayload.alignmentLines; // getAlignmentLines(dragPayload);
        // let ret = checkAlignmentLines(dragPayload);
        for (let i = 0; i < ret.length; i += 1) {
            let r = ret[i];

            let line = new View();
            if (isDefined(r.x)) {
                line.keyValues["x"] = r.x;
            }
            if (isDefined(r.y)) {
                line.keyValues["y"] = r.y;
            }
            line.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                if (isDefined(this.keyValues["x"])) {
                    return {
                        x: this.keyValues["x"],
                        y: 0,
                        width: 1,
                        height: parentBounds.height,
                        unit: 'px',
                        position: 'absolute'
                    };
                }
                if (isDefined(this.keyValues["y"])) {
                    return {
                        x: 0,
                        y: this.keyValues["y"],
                        width: parentBounds.width,
                        height: 1,
                        unit: 'px',
                        position: 'absolute'
                    };
                }
            };
            line.fills = [{active: true, type: 'color', blendMode: 'normal', value: "rgba(255, 89, 255, 1)"}];
            line.initView(generateV4UUID());
            r.attachLine.attach(line);
            this.snapGuidesViews.overlapViews.push(line);
        }
    }




    updateSnap(view, node, newPosition, dragPayload, isDrag, isResize, resizeHandle, event) {

        this.clearOverlapViews();

        if (node.isPage === true) {
            return;
        }

        let allowOutsideContainerBounds = false;

        if (Application.instance.shiftKeyPressed === true) {
            allowOutsideContainerBounds = true;
        }
        if (isDrag) {
            let containerBounds = dragPayload.nodes[0].parentBounds;
            if (allowOutsideContainerBounds === false) {
                check_selectionBounds_against_container(dragPayload.selectedNodesBounds, containerBounds);
            }


            let selectionBoundsCopyX = dragPayload.selectedNodesBounds.x;
            let selectionBoundsCopyY = dragPayload.selectedNodesBounds.y;

            checkSnapOpportunities(dragPayload, event);


            // apply new bounds
            for (let i = 0; i < dragPayload.nodes.length; i += 1) {
                let n = dragPayload.nodes[i].node;
                let nb = dragPayload.nodes[i].nodeBounds;
                let v = dragPayload.nodes[i].view;

                let n_x = (NUConvertToPoint(dragPayload.selectedNodesBounds.x).amount + (dragPayload.nodes[i].deltaX));
                let n_y = (NUConvertToPoint(dragPayload.selectedNodesBounds.y).amount + (dragPayload.nodes[i].deltaY));
                //SkLogger.write("n" + n.id + " " + nb.x + " " + n_x);
                //SkLogger.write("n" + n.id + " " + nb.y + " " + n_y);

                n.bounds.x = px(n_x);
                n.bounds.y = px(n_y);


                SkLogger.write(`selectionBounds(${dragPayload.selectedNodesBounds.x}, ${dragPayload.selectedNodesBounds.y}) was (${selectionBoundsCopyX},${selectionBoundsCopyY}), node(${n_x},${n_y})`);

                v.doResizeFrameOnly();
            }

            // check for collision
            this.check_collisions(dragPayload);

            this.drawAlignmentLines(dragPayload);


        }
        if (isResize) {

        }


    }



    copyToClipBoard() {

        let payload = {
            magic:"skelet",
            from_filename: Session.instance.filename,
            project_guid: Session.instance.project_guid,
            workspace_guid: this.workspaceRef.workspace_guid,
            rows: []
        };
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            let node_id = this.selectedLayersInfo[i].layer.id;
            let node = this.selectedLayersInfo[i].layer;
            let parent = this.selectedLayersInfo[i].parentLayer;
            let symbol_id = null;
            let symbol = null;
            if (node.isSymbolInstance === true) {
                symbol_id = node.symbolID;
                symbol = findSymbolNode(symbol_id);
            }
            let row = {
                isPage: node.isPage,
                node_id: node_id,
                node: safeCopy(node.data),
                isSymbolInstance: (node.isSymbolInstance === true) ? true : false,
                symbol_id: symbol_id,
                symbol: (symbol !== null) ? safeCopy(symbol) : null
            };
            payload.rows.push(row);
        }

        if (isDefined(navigator) && isDefined(navigator.clipboard)) {
            let permissionName: PermissionName = "clipboard" as PermissionName;
            navigator.permissions.query( { name: permissionName } ).then( (value: PermissionStatus) => {
                if (value.state !== "denied") {
                    navigator.clipboard.writeText(JSON.stringify(payload)).then( () => {
                        if (Logging.enableLogging === true) {
                            SkLogger.write('clipboard copy payload is ');
                            console.dir(payload);
                        }``
                    });
                }
            });

        }
    }


    async _pasteClipboardImage() {

        let target_id = this.selectedLayersInfo[0].layer.id;
        let target_node: Layer = this.selectedLayersInfo[0].layer;
        if (!target_node) {
            return;
        }

        const auth = await navigator.permissions.query( { name: "clipboard" as PermissionName} );
        if( auth.state !== 'denied' ) {
            // @ts-ignore
            const item_list = await navigator.clipboard.read();
            let image_type; // we will feed this later
            const item = item_list.find( item => // choose the one item holding our image
                item.types.some( type => { // does this item have our type
                    if( type.startsWith( 'image/' ) ) {
                        image_type = type; // store which kind of image type it is
                        return true;
                    }
                } )
            );
            const file = item && await item.getType( image_type );
            SkLogger.write( file );
        }
        /*

        let image = clipboard.readImage();
        let size = image.getSize();
        let buffer = image.toPNG();
        let title = generateV4UUID();
        let tempName = title + ".png";

        let tempFolder = app.getPath('temp');
        let newPath = path.format({
            dir: tempFolder,
            base: tempName
        });
        fs.writeFileSync(newPath, buffer);
        // add the Resource
        let newResource = {
            id: generateV4UUID(),
            title: title,
            children: [],
            path: "",
            mime: "",
            origin: "",
            currentPath: "",
            isNew: true,
            filename: newPath,
            format: mime.lookup(".png")
        };
        newResource.path = "assets/" + newResource.id + ".png";
        newResource.mime = mime.lookup(".png");
        newResource.origin = newPath;
        newResource.currentPath = newPath;
        if (Logging.enableLogging === true) {
            SkLogger.write('new resource');
            console.dir(newResource);
        }
        Session.instance.currentDocument.assets.push(newResource);
        Application.instance.notifyAll(this, "noticeAssetListChanged");
        // add an image node
        let new_node = Layer.create('image', 'image', 'MentatJS.Image');
        let bounds = new_node.rawBounds();
        bounds.width = px(size.width);
        bounds.height = px(size.height);
        new_node.setPropertyValue("view.bounds", bounds);

        new_node.setPropertyValue("image.uri", "@" + newResource.id);
        new_node.setPropertyValue("image.width", size.width);
        new_node.setPropertyValue("image.height", size.height);
        new_node.setPropertyValue("image.fit", "none");

        let target_bounds = Session.instance.selectedLayersInfo[0].layerCalculatedBounds;
        bounds.x = px(NUConvertToPixel(target_bounds.width).amount / 2 - NUConvertToPixel(bounds.width).amount / 2);
        bounds.y = px(NUConvertToPixel(target_bounds.height).amount / 2 - NUConvertToPixel(bounds.height).amount / 2);
        if (bounds.x.amount < 0) {
            bounds.x = px(0);
        }
        if (bounds.y.amount < 0) {
            bounds.y = px(0);
        }
        target_node.adopt(new_node);
        clearAllSelection();

        moveLayerTop(new_node, target_node);

        Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
        addLayerIdToSelection(new_node.id);

        clipboard.clear();


         */

    }

    async _pasteClipboardText(evt) {

        const auth = await navigator.permissions.query( { name: "clipboard" as PermissionName } );
        if( auth.state !== 'denied' ) {
            navigator.clipboard.readText().then((value:string) => {
                if (value.indexOf('"magic":"skelet"') > -1) {
                    this._pasteClipboardSkelet(evt, value);
                } else {
                    this._pasteClipboardPlainText(evt, value);
                }
            });
        }



    }

    _pasteClipboardSkelet(evt, text: string) {
        let payload = safeRestore(text);
        if (!isDefined(payload)) {
            return;
        }
        if (payload.rows.length === 0) {
            return;
        }

        let isSameFile = (Session.instance.filename === payload.from_filename);
        let isSameWorkspace = (isSameFile === true) &&
            (this.workspaceRef.workspace_guid === payload.workspace_guid);
        let containerNode: Layer = null;
        let containerIsCanvas = false;
        let containerCenterPoint = { x: 0, y: 0 };

        let selectedNode: Layer = null;
        if (this.selectedLayersInfo.length > 0) {
            selectedNode = this.selectedLayersInfo[0].layer;
        }

        // in which container does the copied nodes should reside ?
        // first if the copied node is a page, we make a copy on the canvas container
        if (payload.rows[0].isPage === true) {
            containerNode = this.workspaceRef.layersTree;
        } else {
            // we check the selected node,
            // if its one of the copied node, we take the parent
            if (selectedNode.id === payload.rows[0].node_id) {
                containerNode = this.selectedLayersInfo[0].parentLayer;
            } else {
                // if its a frame that's our container,
                if (selectedNode.type === "frame") {
                    containerNode = selectedNode;
                } else {
                    // if not we lookup the parent
                    containerNode = this.selectedLayersInfo[0].parentLayer;
                }
            }
        }

        let containerNodeBounds = containerNode.calculatedBounds();

        if (containerNode.special_id === "workspace.views") {
            let maxX = [];
            let maxY = [];

            for (let i = 0; i < this.workspaceRef.layersTree.children.length; i += 1) {

                let nptr = this.workspaceRef.layersTree.children[i];
                let nptr_bounds = nptr.bounds();

                maxX.push(NUConvertToPixel(nptr_bounds.x).amount+NUConvertToPixel(nptr_bounds.width).amount);
                maxY.push(NUConvertToPixel(nptr_bounds.y).amount+NUConvertToPixel(nptr_bounds.height).amount);
            }
            containerNodeBounds.width = px(Math.max(...maxX) + 100);
            containerNodeBounds.height = px(Math.max(...maxY) + 100);
        }


        // get the copied node size
        let copyRect = {
            atPoint: {top: -1, left: -1, right: -1, bottom: -1 },
            size: {width: 0, height: 0}
        };

        for (let i = 0; i < payload.rows.length; i += 1) {
            let n = payload.rows[i];
            let b = n.node.calculatedBounds();
            if (copyRect.atPoint.top === -1) {
                copyRect.atPoint.top = NUConvertToPixel(b.y).amount;
                copyRect.atPoint.left = NUConvertToPixel(b.x).amount;
                copyRect.atPoint.right = NUConvertToPixel(b.x).amount + NUConvertToPixel(b.width).amount;
                copyRect.atPoint.bottom = NUConvertToPixel(b.y).amount + NUConvertToPixel(b.height).amount;
                continue;
            }
            if (NUConvertToPixel(b.x).amount < copyRect.atPoint.left) {
                copyRect.atPoint.left = NUConvertToPixel(b.x).amount;
            }
            if ((NUConvertToPixel(b.x).amount > copyRect.atPoint.right) || (NUConvertToPixel(b.x).amount + NUConvertToPixel(b.width).amount > copyRect.atPoint.right)){
                copyRect.atPoint.right = NUConvertToPixel(b.x).amount + NUConvertToPixel(b.width).amount;
            }
            if (NUConvertToPixel(b.y).amount < copyRect.atPoint.top) {
                copyRect.atPoint.top = NUConvertToPixel(b.y).amount;
            }
            if ((NUConvertToPixel(b.y).amount > copyRect.atPoint.bottom) || (NUConvertToPixel(b.y).amount + NUConvertToPixel(b.height).amount > copyRect.atPoint.bottom)) {
                copyRect.atPoint.bottom = NUConvertToPixel(b.y).amount + NUConvertToPixel(b.height).amount;
            }
        }
        copyRect.size.width = copyRect.atPoint.right - copyRect.atPoint.left;
        copyRect.size.height = copyRect.atPoint.bottom - copyRect.atPoint.top;
        if (Logging.enableLogging === true) {
            SkLogger.write('containerNodeBounds ', containerNodeBounds);
            SkLogger.write('copyRect ', copyRect);
        }

        // get a matrix of whitespace
        let matrix = getWhitespaceMatrix(containerNode, NUConvertToPixel(containerNodeBounds.width).amount, NUConvertToPixel(containerNodeBounds.height).amount);
        let newPos = {x: 0, y: 0};
        // can we place the copied nodes underneath ?
        let gap: number = 0;
        if (payload.rows[0].node.className !== "MentatJS.View") {
            gap = 5;
        }
        if (matrixCheckSpace(matrix, copyRect.size, { x: copyRect.atPoint.left, y: copyRect.atPoint.bottom + gap}) === true) {
            newPos.x = copyRect.atPoint.left;
            newPos.y = copyRect.atPoint.bottom + gap;
        } else {
            // right side ?
            if (matrixCheckSpace(matrix, copyRect.size, {x: copyRect.atPoint.right + gap, y: copyRect.atPoint.top}) === true) {
                newPos.x = copyRect.atPoint.right + gap;
                newPos.y = copyRect.atPoint.top;
            } else {
                // we put it in the middle
                newPos.x = NUConvertToPixel(containerNodeBounds.width).amount / 2 - copyRect.size.width / 2;
                newPos.y = NUConvertToPixel(containerNodeBounds.height).amount / 2 - copyRect.size.height / 2;
            }
        }
        if (Logging.enableLogging === true) {
            SkLogger.write('newPos', newPos);
        }
        // we copy the nodes now
        let newSelection = [];
        for (let i = 0; i < payload.rows.length; i += 1) {
            let copyInfo = payload.rows[i];
            if (Logging.enableLogging === true) {
                SkLogger.write('node to copy, ', copyInfo.node);
            }
            /*
            copyInfo.node.bounds.x = (copyInfo.node.bounds.x);
            copyInfo.node.bounds.y = (copyInfo.node.bounds.y);
            copyInfo.node.bounds.width = (copyInfo.node.bounds.width);
            copyInfo.node.bounds.height = (copyInfo.node.bounds.height);
             */

            let dup = containerNode.duplicateChild(copyInfo.node);
            if (Logging.enableLogging === true) {
                SkLogger.write('duplicateNode :');
                console.dir(dup);
            }
            let dup_bounds = dup.rawBounds();
            dup_bounds.x = px((newPos.x) + (NUConvertToPixel(dup_bounds.x).amount - copyRect.atPoint.left));
            dup_bounds.y = px((newPos.y) + (NUConvertToPixel(dup_bounds.y).amount - copyRect.atPoint.top));
            if (Logging.enableLogging === true) {
                SkLogger.write('duplicate bounds after');
                console.dir(dup_bounds);
            }
            dup.setPropertyValue("view.bounds", dup_bounds);
            // is it a symbol instance ?
            if (copyInfo.isSymbolInstance === true) {
                // is the symbol already defined ?
                if (!isDefined(findSymbolNode(copyInfo.symbol_id))) {
                    // copy symbol

                }
            }
            containerNode.children.push(dup);
            newSelection.push(dup.id);

            moveLayerTop(dup, containerNode);

        }

        Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
        this.clearAllSelection();
        for (let x = 0; x < newSelection.length; x += 1) {
            this.addLayerIdToSelection(newSelection[x]);

        }
        Application.instance.notifyAll(this, "noticeNodeSelected", this.workspaceRef.layersTree.find(newSelection[0].id));

        //clipboard.clear();
    }

    _pasteClipboardPlainText(evt, text: string) {
        //////////////////////////
        //
        // PLAIN TEXT FROM OUTSIDE
        //
        let newNode = Layer.create("Label", "object", "MentatJS.Label");
        let newNodeBounds = newNode.bounds();
        let selectedNode: Layer = this.selectedLayersInfo[0].layer;
        let selectedNodeProperties = this.selectedLayersInfo[0].properties;
        if (selectedNode.type !== "frame") {
            return;
        }

        let view = this.selectedLayersInfo[0].view;
        let boundingRect = view.getDiv().getBoundingClientRect();

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
        let defaultPosition = { x: px(evt.clientX - boundingRect.left), y: px(evt.clientY - boundingRect.top), width: px(100), height: px(100) };
        if (isDefined(v.layoutEditorPositioning)) {
            defaultPosition = v.layoutEditorPositioning(view, (evt.clientX - boundingRect.left), (evt.clientY - boundingRect.top));
        }
        let selectedNodeBounds =selectedNode.calculatedBounds();
        newNodeBounds.x =  px(NUConvertToPixel(selectedNodeBounds.width).amount / 2 - NUConvertToPixel(defaultPosition.width).amount / 2);
        newNodeBounds.y =  px(NUConvertToPixel(selectedNodeBounds.height).amount / 2 - NUConvertToPixel(defaultPosition.height).amount / 2);
        newNodeBounds.width = NUConvertToPixel(defaultPosition.width);
        newNodeBounds.height = NUConvertToPixel(defaultPosition.height);
        newNodeBounds.position = 'absolute';
        newNodeBounds.unit = 'px';
        newNode.setPropertyValue("view.bounds", newNodeBounds);


        let propertyText = newNode.setPropertyValue("label.text", text);

        if (Logging.enableLogging === true) {
            SkLogger.write("generated node");
            console.dir(newNode);
        }

        selectedNode.children.push(newNode);

        this.clearAllSelection();
        moveLayerTop(newNode, selectedNode);

        Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
        this.addLayerIdToSelection(newNode.id);
        Application.instance.notifyAll(this, "noticeNodeSelected", newNode);
    }


    pasteClipBoard(evt) {

        let formats = hasClipBoardData().then( (value: {text:string, mime: string} | undefined) => {
            if (value === undefined) {
                return;
            }
            let formats = [value];
            if (Logging.enableLogging === true) {
                SkLogger.write('supported Formats');
                console.dir(formats);
            }
            for (let i = 0; i < formats.length; i += 1) {
                if (formats[i].mime === "image/png") {
                    this._pasteClipboardImage().then(() => {

                    }).catch ((reason: any) => {

                    });
                }
                if (formats[i].mime === 'text/plain') {
                    this._pasteClipboardText(evt).then( () => {

                    }).catch ( (reason: any) => {

                    });
                }
                if (formats[i].mime === 'text/html') {

                }
            }
        }).catch((reason:any) => {

        });

    }


    // ALIGN LAYERS

    alignTop() {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = this.selectedLayersInfo[i].parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }

            const nodeBounds = this.selectedLayersInfo[i].layerCalculatedBounds;
            const parentBounds = this.selectedLayersInfo[i].parentLayerCalculatedBounds;


            let newBounds = node.bounds();

            const nodes = [];
            for (let j = 0; j < parentNode.children.length; j++) {
                if (parentNode.children[j].id === node.id) {
                    continue;
                }

                const siblingNodeBounds = parentNode.children[j].bounds();

                if (NUConvertToPixel(siblingNodeBounds.y).amount < NUConvertToPixel(nodeBounds.y).amount) {
                    nodes.push({ id: parentNode.children[j].id, y: NUConvertToPixel(siblingNodeBounds.y), bounds: siblingNodeBounds });
                    if (NUConvertToPixel(siblingNodeBounds.y).amount + NUConvertToPixel(siblingNodeBounds.height).amount < NUConvertToPixel(nodeBounds.y).amount) {
                        nodes.push({
                            id: parentNode.children[j].id,
                            y: px(NUConvertToPixel(siblingNodeBounds.y).amount + NUConvertToPixel(siblingNodeBounds.height).amount),
                            bounds: siblingNodeBounds
                        });
                    }
                }
            }
            nodes.push({ id: "parentView", y: px(0) });
            if (Logging.enableLogging === true) {
                SkLogger.write("nodes higher:");
                console.dir(nodes);
            }
            if (nodes.length > 0) {
                nodes.sort(function (b, a) {
                    return (a.y.amount - b.y.amount);
                });
                newBounds.y = nodes[0].y;

            } else {
                newBounds.y = px(0);
            }
            node.setPropertyValue("view.bounds", newBounds);


            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }
    }

    alignMiddle() {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {

            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = this.selectedLayersInfo[i].parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }
            let bounds = node.bounds();

            bounds.y = px(NUConvertToPixel(parentNode.bounds().height).amount / 2 - NUConvertToPixel(bounds.height).amount / 2);

            node.setPropertyValue("view.bounds", bounds);

            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }

    }

    alignBottom() {
        "use strict";
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {

            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = node.parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }

            let nodeBounds = node.bounds();
            const parentBounds = this.selectedLayersInfo[i].parentLayerCalculatedBounds;


            const nodes = [];
            for (let j = 0; j < parentNode.children.length; j++) {
                if (parentNode.children[j].id === node.id) {
                    continue;
                }


                const siblingNodeBounds = parentNode.children[j].bounds();


                if (NUConvertToPixel(siblingNodeBounds.y).amount > NUConvertToPixel(nodeBounds.y).amount) {
                    nodes.push({id: parentNode.children[j].id, y: NUConvertToPixel(siblingNodeBounds.y), bounds: siblingNodeBounds});
                }
                if (NUConvertToPixel(siblingNodeBounds.y).amount + NUConvertToPixel(siblingNodeBounds.height).amount > NUConvertToPixel(nodeBounds.y).amount) {
                    nodes.push({
                        id: parentNode.children[j].id,
                        y: px(NUConvertToPixel(siblingNodeBounds.y).amount + NUConvertToPixel(siblingNodeBounds.height).amount),
                        bounds: siblingNodeBounds
                    });

                }
            }
            nodes.push({
                id: "parentView",
                y: px(NUConvertToPixel(parentBounds.height).amount - NUConvertToPixel(nodeBounds.height).amount)
            });
            if (Logging.enableLogging === true) {
                SkLogger.write("nodes higher:");
                console.dir(nodes);
            }
            if (nodes.length > 0) {
                nodes.sort(function (b, a) {
                    return (NUConvertToPixel(a.y).amount - NUConvertToPixel(b.y).amount);
                });
                nodeBounds.y = NUConvertToPixel(nodes[0].y);
            } else {
                nodeBounds.y = px(NUConvertToPixel(parentBounds.height).amount - NUConvertToPixel(nodeBounds.height).amount);
            }
            node.setPropertyValue("view.bounds", nodeBounds);

            // find the view
            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }

            // MentatJS.Application.instance.notifyAll(parentNode, "kRedrawSubView", node);
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }
    }

    alignLeft() {
        "use strict";
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {

            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = node.parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }
            let nodeBounds = node.bounds();
            nodeBounds.x = px(0);

            node.setPropertyValue("view.bounds", nodeBounds);

            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }

    }

    alignCenter() {
        "use strict";
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {

            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = node.parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }

            let nodeBounds = node.bounds();

            nodeBounds.x = px(NUConvertToPixel(parentNode.bounds().width).amount / 2 - NUConvertToPixel(nodeBounds.width).amount / 2);

            node.setPropertyValue("view.bounds", nodeBounds);

            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }

    }

    alignRight() {
        "use strict";
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = node.parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }

            let nodeBounds = node.bounds();

            nodeBounds.x = px(NUConvertToPixel(parentNode.bounds().width).amount - NUConvertToPixel(nodeBounds.width).amount);

            node.setPropertyValue("view.bounds", nodeBounds);

            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }

    }

    fillParent() {
        "use strict";
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            const node = this.selectedLayersInfo[i].layer;
            if (node === null) {
                continue;
            }
            const parentNode = node.parentLayer;
            if (isDefined(parentNode) === false) {
                // node is a page
                // nothing to align
                continue;
            }

            let nodeBounds = node.bounds();

            nodeBounds.x = px(0);
            nodeBounds.y = px(0);
            nodeBounds.width = NUConvertToPixel(parentNode.bounds().width);
            nodeBounds.height = NUConvertToPixel(parentNode.bounds().height);

            node.setPropertyValue("view.bounds", nodeBounds);

            let view = this.selectedLayersInfo[i].view;
            if (isDefined(view)) {
                view.doResize();
                view.render();
            }
            Application.instance.notifyAll(this, "noticeUpdateCoordinates", node);
        }
    }



    symbolMake(node_id: string) {
        let node = this.workspaceRef.layersTree.find(node_id);
        if (!isDefined(node)) {
            return;
        }
        if (node.isSymbolInstance === true) {
            return;
        }
        if (node.isSymbol === true) {
            return;
        }
        node.isSymbol = true;
        if (!isDefined(node.symbolID) || node.symbolID === "") {
            node.symbolID = generateV4UUID();
        }
        // is the symbol ref exists in the cache ?
        let found = false;
        for (let i = 0; i < getEnvironment().SymbolsCache.length; i += 1) {
            if (getEnvironment().SymbolsCache[i].symbolID === node.symbolID) {
                found = true;
            }
        }
        if (found === false) {
            getEnvironment().SymbolsCache.push({
                symbolID: node.symbolID,
                title: node.title,
                nodeRef: node
            })
        }
        Application.instance.notifyAll(this, "noticeUpdateLibrary");

        // update the title
        let viewRef: LayerView = this.findTitleRef(node.id) as LayerView;
        viewRef.keyValues["labelTitle"].fontColor = "rgb(250,50,50)";
        viewRef.keyValues["labelTitle"].setText("<span style='font-family:FontAwesome5ProLight;'>&#xf021;</span>&nbsp;" + node.title);
        viewRef.keyValues["labelTitle"].render();

    }

    symbolDelete(node_id: string) {
        let node = this.workspaceRef.layersTree.find(node_id);
        if (!isDefined(node)) {
            return;
        }
        if (node.isSymbol === false) {
            return;
        }
        node.isSymbol = false;
        let idx = -1;
        for (let i = 0; i < getEnvironment().SymbolsCache.length; i += 1) {
            if (getEnvironment().SymbolsCache[i].symbolID === node.symbolID) {
                idx = i;
                break;
            }
        }
        if (idx > -1) {
            getEnvironment().SymbolsCache.splice(idx, 1);
        }
        Application.instance.notifyAll(this, "noticeUpdateLibrary");

        // update the title
        let viewRef: LayerView = this.findTitleRef(node.id) as LayerView;
        viewRef.keyValues["labelTitle"].fontColor = "rgb(0,15,178)";
        viewRef.keyValues["labelTitle"].setText(node.title);
        viewRef.keyValues["labelTitle"].render();

    }


    applyStyle(style: any, node: Layer) {
        if (!isDefined(node) || !isDefined(style)) {
            return;
        }
        let property_fills = node.property("view.fills");
        let property_borders = node.property("view.borders");
        let property_shadows = node.property("view.shadows");

        property_fills.value = JSON.parse(JSON.stringify(style.fills));
        property_borders.value = JSON.parse(JSON.stringify(style.borders));
        property_shadows.value = JSON.parse(JSON.stringify(style.shadows));

        node.setPropertyValue("view.fills", property_fills);
        node.setPropertyValue("view.borders", property_borders);
        node.setPropertyValue("view.shadows", property_shadows);

        let viewRef = this.findViewRef(node.id);
        if (isDefined(viewRef)) {
            viewRef.applyLayoutProperty("view.fills", property_fills.value);
            viewRef.applyLayoutProperty("view.borders", property_borders.value);
            viewRef.applyLayoutProperty("view.shadows", property_shadows.value);
            viewRef.render();
        }

        Application.instance.notifyAll(this, "noticeNodeSelected", node);
    }



    layerApplyTextStyle(style: any, node: Layer) {
        if (!isDefined(node) || !isDefined(style)) {
            return;
        }
        let property_textStyle = node.property("label.textStyle");

        property_textStyle.value = JSON.parse(JSON.stringify(style.textStyle));

        node.setPropertyValue("label.textStyle", property_textStyle);

        let viewRef = this.findViewRef(node.id);
        if (isDefined(viewRef)) {
            viewRef.applyLayoutProperty("label.textStyle", property_textStyle.value);
            viewRef.render();
        }

        Application.instance.notifyAll(this, "noticeNodeSelected", node);

    }

    // VIEW PROP

    selectedLayersWithCB(callback:(layer: Layer)=>void) {
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            callback(this.selectedLayersInfo[i].layer);
        }
    }


    setPropertyValue(property_id: string, value) {
        this.selectedLayersWithCB((layer: Layer) => {
            layer.setPropertyValue(property_id, value);
            let viewRef = this.findViewRef(layer.id);
            if (isDefined(viewRef)) {
                viewRef.applyLayoutProperty(property_id, value);
                viewRef.processStyleAndRender("", []);
            }
        });
    }

    getPropertyValue(property_id): any {
        if (this.selectedLayersInfo.length === 0) {
            return undefined;
        }
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            let prop = this.selectedLayersInfo[i].layer.property(property_id);
            if (isDefined(prop)) {
                return prop.value;
            }
        }
    }

    // TEXT

    textMakeBold() {
        // TODO
        // FIX
        /*
        for (let i = 0; i < Session.instance.selectedLayersInfo.length; i++) {
            let node = Session.instance.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        let font = getEnvironment().Fonts.rows.find((elem) => { return elem.id === prop.value.typeface; });
                        if (isDefined(font)) {

                            prop.value.bold = !prop.value.bold;
                            // find the weight
                            let weight = font.styles.find((elem) => {
                                if (prop.value.bold === true) {
                                    return (elem.style.indexOf('Bold')>-1 && elem.italic === prop.value.italic);
                                }
                                return (elem.italic === prop.value.italic);
                            });
                            if (isDefined(weight)) {
                                prop.value.weightName = weight.text;
                                prop.value.weight = weight.id;
                            }
                        }
                        node.setPropertyValue("label.textStyle", prop.value);

                        let viewRef = findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", prop.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", prop);
                    }
                }
            }
        }

         */
    }


    textMakeItalic() {
        // TODO
        // FIX
        /*
        for (let i = 0; i < Session.instance.selectedLayersInfo.length; i++) {
            let node = Session.instance.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        let font = getEnvironment().Fonts.rows.find((elem) => { return elem.id === prop.value.typeface; });
                        if (isDefined(font)) {
                            prop.value.italic = !prop.value.italic;
                            // find the weight
                            let weight = font.styles.find((elem) => {
                                if (prop.value.bold === true) {
                                    return (elem.style.indexOf('Bold')>-1 && elem.italic === prop.value.italic);
                                }
                                return (elem.italic === prop.value.italic);
                            });
                            if (isDefined(weight)) {
                                prop.value.weightName = weight.text;
                                prop.value.weight = weight.id;
                            }
                        }
                        node.setPropertyValue("label.textStyle", prop.value);

                        let viewRef = findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", prop.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", prop);
                    }
                }
            }
        }

         */
    }


    textMakeUnderline() {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {

                        (prop.value as PropertyTextStyle).decorations.understrike = !prop.value.decorations.understrike;

                        node.setPropertyValue("label.textStyle", prop.value);

                        let viewRef = this.findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", prop.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", prop);
                    }
                }
            }
        }
    }


    textMakeStrike() {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        prop.value.decorations.strike = !prop.value.decorations.strike;

                        node.setPropertyValue("label.textStyle", prop.value);

                        let viewRef = this.findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", prop.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", prop);
                    }
                }
            }
        }
    }


    textIncreaseFontSize() {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let sizeProp = node.property("label.textStyle");
                    if (isDefined(sizeProp)) {
                        sizeProp.value.size.amount = parseFloat(sizeProp.value.size.amount) + 1;

                        node.setPropertyValue("label.textStyle", sizeProp.value);

                        let viewRef = this.findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", sizeProp.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", sizeProp);

                    }
                }
            }
        }
    }

    textDecreaseFontSize(): void {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let sizeProp = node.property("label.textStyle");
                    if (isDefined(sizeProp)) {
                        sizeProp.value.size.amount = parseFloat(sizeProp.value.size.amount) - 1;

                        node.setPropertyValue("label.textStyle", sizeProp.value);

                        let viewRef = this.findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", sizeProp.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", sizeProp);
                    }
                }
            }
        }
    }


    textKerning(kerning: 'auto' | 'none' | 'normal'): void {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let sizeProp = node.property("label.textStyle");
                    if (isDefined(sizeProp)) {
                        sizeProp.value.kerning = kerning;

                        node.setPropertyValue("label.textStyle", sizeProp.value);

                        let viewRef = this.findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", sizeProp.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", sizeProp);
                    }
                }
            }
        }
    }

    textAlign(alignment: 'left' | 'right' | 'center' | 'justify'): void {
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let sizeProp = node.property("label.textStyle");
                    if (isDefined(sizeProp)) {
                        sizeProp.value.textAlignment = alignment;

                        node.setPropertyValue("label.textStyle", sizeProp.value);
                        let viewRef = this.findViewRef(node.id);
                        viewRef.applyLayoutProperty("label.textStyle", sizeProp.value);
                        viewRef.render();

                        Application.instance.notifyAll(this, "noticeTextStyleChanged", sizeProp);
                    }
                }
            }
        }
    }


    textIsBold(): boolean {
        let isBold = true;
        let allBold = true;
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        let font = getEnvironment().Fonts.rows.find((elem) => { return elem.id === prop.value.typeface; });
                        if (isDefined(font)) {
                            isBold = prop.value.bold;
                            if (isBold === false) {
                                allBold = false;
                            }
                        }
                    }
                }
            }
        }
        if (this.selectedLayersInfo.length > 1) {
            return allBold;
        }
        return isBold;
    }

    textIsItalic(): boolean {
        let isItalic = true;
        let allItalic = true;
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        let font = getEnvironment().Fonts.rows.find((elem) => { return elem.id === prop.value.typeface; });
                        if (isDefined(font)) {
                            isItalic = prop.value.italic;
                            if (isItalic === false) {
                                allItalic = false;
                            }
                        }
                    }
                }
            }
        }
        if (this.selectedLayersInfo.length > 1) {
            return allItalic;
        }
        return isItalic;
    }


    textIsUnderline(): boolean {
        let is = true;
        let all = true;
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        is = prop.value.decorations.understrike;
                        if (is === false) {
                            all = false;
                        }
                    }
                }
            }
        }
        if (this.selectedLayersInfo.length > 1) {
            return all;
        }
        return is;
    }

    textIsStrike(): boolean {
        let is = true;
        let all = true;
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        is = prop.value.decorations.strike;
                        if (is === false) {
                            all = false;
                        }
                    }
                }
            }
        }
        if (this.selectedLayersInfo.length > 1) {
            return all;
        }
        return is;
    }

    textGetAlign(): 'left' | 'right' | 'center' | 'justify' | string {
        let is = "left";
        let all = "left";
        for (let i = 0; i < this.selectedLayersInfo.length; i++) {
            let node = this.selectedLayersInfo[i].layer;
            if (node) {
                if ((node.type === "object") && (node.className === "MentatJS.Label")) {
                    let prop = node.property("label.textStyle");
                    if (isDefined(prop)) {
                        // get the font
                        is = prop.value.textAlignment;
                        if (is !== "left") {
                            all = "";
                        }
                    }
                }
            }
        }
        if (this.selectedLayersInfo.length > 1) {
            return all;
        }
        return is;
    }




    acceptDropOnFrames(accept: boolean) {

        if (accept === true) {

            // draw layer on top of canvas to receive the event
            let v = new View();
            v.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 16,
                    y: 16,
                    width: parentBounds.width - 16,
                    height: parentBounds.height - 16,
                    unit: "px",
                    position: "absolute"
                };
            };
            v.initView("canvasTouchLayer");
            this.canvasViewRef.parentView.attach(v);
            this.canvasViewRef.parentView.keyValues["canvasTouchLayer"] = v;

            let canvasBounds = this.canvasViewRef.getRealBounds();
            let offsetX = - canvasBounds.x.amount;
            let offsetY = - canvasBounds.y.amount;

            v.getDiv().ondragover = (ev) => {
                ev.preventDefault();

                // check if there's layers underneath
                let layers: { layer: Layer; depth: number; bounds: Bounds }[] = this.findLayersUnderneathMousePointer(ev.clientX + offsetX, ev.clientY + offsetY);

                layers = filterFertileLayers(layers);

                if (layers.length > 0) {
                    let array = [];
                    let str = `Drop on layer <b>${layers[layers.length-1].layer.title}</b>`;
                    array.push(str);
                    array.push('\r\n');
                    if (layers.length > 1) {
                        array.push(generateKeyboardShortcutIcon(['shift'],false));
                        array.push(` Drop on layer <b>${layers[layers.length - 2].layer.title}</b>`);
                        array.push('\r\n');
                    }
                    array.push(generateKeyboardShortcutIcon(['alt'], false));
                    array.push(` Drop on <b>workspace</b>`);
                    this.showHints(array);
                } else {
                    let str = `Drop on <b>workspace</b>`;
                    this.showHints([str]);
                }

                SkLogger.write("Layers underneath dropover ", layers.length);

            }
            v.getDiv().ondrop = (ev) => {
                ev.preventDefault();
                SkLogger.write("+ondrop");
                this.acceptDropOnFrames(false);
                const data = ev.dataTransfer.getData("text");
                const info = {
                    dropInfo: JSON.parse(data),
                    target: "",
                    x: ev.clientX,
                    y: ev.clientY,
                    ev: ev
                };
                Application.instance.notifyAll(this, "noticeSymbolDropped", info);
            }
        } else {

            if (isDefined(this.canvasViewRef.parentView.keyValues["canvasTouchLayer"])) {
                (this.canvasViewRef.parentView.keyValues["canvasTouchLayer"] as View).getDiv().ondragover = null;
                (this.canvasViewRef.parentView.keyValues["canvasTouchLayer"] as View).getDiv().ondrop = null;
                (this.canvasViewRef.parentView.keyValues["canvasTouchLayer"] as View).detachItSelf();
                this.canvasViewRef.parentView.keyValues["canvasTouchLayer"] = undefined;
            }
        }


    }


    getSelectionActions(): {id: string}[] {
        let ret = [];
        if (this.selectedLayersInfo.length === 0) {
            return ret;
        }
        let isLocked = false;
        let hasOpacity = false;
        let hasFill = false;
        let hasText = false;
        let hasBorder = false;
        let hasShadow = false;
        let hasTypeface = false;
        let isSymbolInstance = false;
        for (let i = 0; i < this.selectedLayersInfo.length; i += 1) {
            let layer = this.selectedLayersInfo[i].layer;
            if (layer.isSymbolInstance) {
                isSymbolInstance = true;
            }
            if (layer.isLocked) {
                isLocked = true;
            }
            if (isDefined(layer.property("view.opacity"))) {
                hasOpacity = true;
            }
            if (isDefined(layer.property("view.fills"))) {
                hasFill = true;
            }
            if (isDefined(layer.property("view.borders"))) {
                hasBorder = true;
            }
            if (isDefined(layer.property("view.shadows"))) {
                hasShadow = true;
            }
            if (isDefined(layer.property("label.textStyle"))) {
                hasTypeface = true;
            }
            if (isDefined(layer.property("label.text")) || isDefined(layer.property("button.text"))) {
                hasText = true;
            }
        }


        ret.push({id: "code" });
        ret.push({id:"delim"});


        if (hasText) {
            ret.push({id:"text"});
        }

        if (hasTypeface) {
            ret.push({id:"typeface"});
        }

        if (hasOpacity) {
            ret.push({id:"opacity"});
        }
        if (hasFill) {
            ret.push({id:"fills"});
        }
        if (hasBorder) {
            ret.push({id:"borders"})
        }

        ret.push({id: "delim"});
        ret.push({id:"lock"});
        ret.push({id:"duplicate"});
        ret.push({id:"delete"});

        return ret;
    }





}







