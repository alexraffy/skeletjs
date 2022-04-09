import {Bounds, Logging, NUConvertToPixel, NumberWithUnit, px} from "mentatjs";
import {SkLogger} from "../Logging/SkLogger";
import {Layer} from "./Layer";


export function stretchNodeBoundsToAvailableSpace(containerNode: Layer, node: Layer, set: boolean): Bounds {
    let nodeBounds = node.bounds();

    const parentBounds = containerNode.bounds();

    const nodesX: {id: string, value: NumberWithUnit, bounds?: Bounds}[] = [];
    const nodesY: {id: string, value: NumberWithUnit, bounds?: Bounds}[] = [];
    const nodesWidth: { id: string, value: NumberWithUnit, bounds?: Bounds}[] = [];
    const nodesHeight: {id: string, value: NumberWithUnit, bounds?: Bounds}[] = [];

    let x,y,w, h = 0;

    for (let j = 0; j < containerNode.children.length; j++) {
        if (containerNode.children[j].id === node.id) {
            continue;
        }
        if (Logging.enableLogging === true) {
            SkLogger.write("siblingNode bounds: ");
            console.dir(containerNode.children[j].bounds);

        }
        const siblingNodeBounds = containerNode.children[j].bounds();


        if (NUConvertToPixel(siblingNodeBounds.y).amount < NUConvertToPixel(nodeBounds.y).amount) {
            nodesY.push({ id: containerNode.children[j].id, value: NUConvertToPixel(siblingNodeBounds.y), bounds: siblingNodeBounds });
            if (NUConvertToPixel(siblingNodeBounds.y).amount + NUConvertToPixel(siblingNodeBounds.height).amount < NUConvertToPixel(nodeBounds.y).amount) {
                nodesY.push({
                    id: containerNode.children[j].id,
                    value: px(NUConvertToPixel(siblingNodeBounds.y).amount + NUConvertToPixel(siblingNodeBounds.height).amount),
                    bounds: siblingNodeBounds
                });
            }
        }

        if (NUConvertToPixel(siblingNodeBounds.x).amount < NUConvertToPixel(nodeBounds.x).amount) {
            nodesX.push({ id: containerNode.children[j].id, value: NUConvertToPixel(siblingNodeBounds.x), bounds: siblingNodeBounds });
            if (NUConvertToPixel(siblingNodeBounds.x).amount + NUConvertToPixel(siblingNodeBounds.width).amount < NUConvertToPixel(nodeBounds.x).amount) {
                nodesX.push({
                    id: containerNode.children[j].id,
                    value: px(NUConvertToPixel(siblingNodeBounds.x).amount + NUConvertToPixel(siblingNodeBounds.width).amount),
                    bounds: siblingNodeBounds
                });
            }
        }

    }
    nodesY.push({ id: "parentView", value: px(0) });
    nodesX.push({ id: "parentView", value: px(0) });
    if (Logging.enableLogging === true) {
        SkLogger.write("nodes higher:");
        console.dir(nodesY);
    }
    if (nodesY.length > 0) {
        nodesY.sort(function (b, a) {
            return (a.value.amount - b.value.amount);
        });
        y = nodesY[0].value.amount;
    } else {
        y = 0;
    }
    if (nodesX.length > 0) {
        nodesX.sort(function (b, a) {
            return (a.value.amount - b.value.amount)
        });
        x = nodesX[0].value.amount;
    } else {
        x = 0;
    }
    // calculate height
    for (let j = 0; j < containerNode.children.length; j++) {
        if (containerNode.children[j].id === node.id) {
            continue;
        }
        const siblingNodeBounds = containerNode.children[j].bounds();

        if (NUConvertToPixel(siblingNodeBounds.y).amount > y) {
            nodesHeight.push({ id: containerNode.children[j].id, value: NUConvertToPixel(siblingNodeBounds.y), bounds: siblingNodeBounds });
        }

        if (NUConvertToPixel(siblingNodeBounds.x).amount > NUConvertToPixel(nodeBounds.x).amount) {
            nodesWidth.push({ id: containerNode.children[j].id, value: NUConvertToPixel(siblingNodeBounds.x), bounds: siblingNodeBounds });

        }

    }
    nodesWidth.push({ id: "parentView", value: NUConvertToPixel(parentBounds.width) });
    nodesHeight.push({ id: "parentView", value: NUConvertToPixel(parentBounds.height) });

    if (nodesHeight.length > 0) {
        nodesHeight.sort(function (b, a) {
            return (a.value.amount - b.value.amount);
        });
        h = nodesHeight[0].value.amount - y;
    } else {
        h = NUConvertToPixel(parentBounds.height).amount - y;
    }
    if (nodesWidth.length > 0) {
        nodesWidth.sort(function (b, a) {
            return (a.value.amount - b.value.amount)
        });
        w = nodesWidth[0].value.amount - x;
    } else {
        w = NUConvertToPixel(parentBounds.width).amount - x;
    }



    if (set === true) {
        nodeBounds.x = px(x);
        nodeBounds.y = px(y);
        nodeBounds.width = px(w);
        nodeBounds.height = px(h);
        node.setPropertyValue("view.bounds", nodeBounds);
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
