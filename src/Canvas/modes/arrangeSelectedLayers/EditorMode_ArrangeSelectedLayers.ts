import {EditorMode, } from "../EditorMode";
import {View} from "mentatjs";
import {Layer} from "../../../Layer/Layer";
import {ILayoutEditorView} from "../../../Layer/ILayoutEditorView";
import {CanvasEventInfo} from "../CanvasEventInfo";






export class EditorMode_ArrangeSelectedLayers extends EditorMode {


    enteringMode(layers: Layer[], views: (ILayoutEditorView & View)[]) {
        super.enteringMode(layers, views);
    }

    exitingMode(layers: Layer[], views: (ILayoutEditorView & View)[]) {
        super.exitingMode(layers, views);
    }

    viewClick(eventInfo: CanvasEventInfo) {
        super.viewClick(eventInfo);


    }


}