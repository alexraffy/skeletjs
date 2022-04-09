import {Bounds, NumberWithUnit, View} from "mentatjs";
import {Layer} from "../Layer/Layer";


export class DragPayload {
    nodes: {
        node: Layer;
        nodeBounds: Bounds;
        view: View;
        parentNode: Layer;
        parentBounds: Bounds;
        deltaX: number;
        deltaY: number;
    }[];

    selectedNodesBounds: Bounds;

    alignmentLines: { x?: NumberWithUnit, y?: NumberWithUnit, node: Layer, isParent: boolean, testOrigin?: string, magnet: string[], attachLine: View}[];

    stopX: boolean = false;
    stopY: boolean = false;

    constructor() {
        this.nodes = [];
        this.selectedNodesBounds = {kind: "Bounds"};
        this.alignmentLines = [];
        this.stopX = false;
        this.stopY = false;

    }

}

