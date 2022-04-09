import {CanvasEventInfo} from "./CanvasEventInfo";
import {ViewCanvas} from "../ViewCanvas";
import {ResizableView} from "../ResizableView";
import {ILayoutEditorView} from "../../Layer/ILayoutEditorView";
import {ActionBarController} from "../../ActionBars/ActionBarController";
import {Bounds, View} from "mentatjs";
import {Layer} from "../../Layer/Layer";


export class EditorMode {

    modeName: string = "";

    isPanning: boolean = false;

    protected viewCanvasRef: ViewCanvas;

    selectionView: {
        view: ResizableView;
        placeholders: {
            layer_id: string,
            view: View
            swapHandle: View
        }[],
        highlights: {
            layer: Layer;
            view: View;
        }[],

        gutters: {
            direction: 'horizontal' | 'vertical',
            layer_ids: string[],
            view: View
        }[],

        actionBar: {
            controller: ActionBarController;
        }

    } = {
        view: undefined,
        placeholders: [],
        highlights: [],
        gutters: [],
        actionBar: {
            controller: undefined
        }
    }


    constructor(viewCanvasRef: ViewCanvas) {
        this.viewCanvasRef = viewCanvasRef;
    }


    enteringMode(layers: Layer[], views: (ILayoutEditorView & View)[]) {

    }

    exitingMode(layers: Layer[], views: (ILayoutEditorView & View)[]) {

    }

    layerAddedToSelection(layer: Layer, view: ILayoutEditorView & View) {

    }

    layerRemovedFromSelection(layer: Layer, view: ILayoutEditorView & View) {

    }

    layerAddedToHighlight(info: {
        layer: Layer,
        layerCalculatedBounds: Bounds,
        layerAbsoluteBounds: Bounds,
        parentLayer: Layer,
        parentLayerCalculatedBounds: Bounds,
        view: View
    }) {

    }

    layerRemovedFromHighlight(layer: Layer, view: View) {

    }

    redrawSelectionAndHighlight() {

    }


    mouseDown(event: MouseEvent, canvasX: number, canvasY: number) {

    }

    mouseUp(event: MouseEvent, canvasX: number, canvasY: number) {

    }

    mouseMove(event: MouseEvent, canvasX: number, canvasY: number) {

    }


    viewDrawn(view: ILayoutEditorView & View, layer: Layer) {

    }

    viewClick(eventInfo: CanvasEventInfo) {

    }

    viewDoubleClick(eventInfo: CanvasEventInfo) {

    }

    viewHover(eventInfo: CanvasEventInfo, hoveringIn: boolean) {

    }

    viewWillBeDragged(eventInfo: CanvasEventInfo): boolean {
        return false;
    }

    viewBeingDragged(eventInfo: CanvasEventInfo, dragData: {
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

    }

    viewWasDragged(eventInfo: CanvasEventInfo, x: number, y: number) {

    }


}