import {Layer} from "./Layer";
import {assert, Bounds, isDefined, Logging, NUConvertToPixel, NumberWithUnit, px} from "mentatjs";
import {instanceOfLayer} from "../Guards/instanceOfLayer";


export function getAnchorValue(node: Layer, side: 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height' | 'centerv' | 'centerh'): NumberWithUnit {
    assert(instanceOfLayer(node) && side !== undefined, "getAnchorValue expects a layer and a string as parameters.");

    let bounds: Bounds = node.bounds();
    let anchors = node.anchors();

    if (anchors[side] === undefined) {
        if (Logging.enableLogging === true) {
            Logging.log("node " + node.id + " has no anchor for side " + side);
        }
        return undefined;
    }
    if (anchors[side].active === false) {
        if (Logging.enableLogging === true) {
            Logging.log("node " + node.id + " has no anchor active for side " + side);
        }
        return undefined;
    }
    if ((side === "width") || (side === "height")) {
        if (Logging.enableLogging === true) {
            Logging.log("node " + node.id + " constant for " + side + " anchor");
            Logging.log(anchors[side].constant);
        }
        return anchors[side].constant;
    }
    if (anchors[side].target === "") {
        if (Logging.enableLogging === true) {
            Logging.log("node " + node.id + " has no anchor target");
        }
        return undefined;
    }


    if (!isDefined(node.parentLayer)) {
        if (Logging.enableLogging === true) {
            Logging.log("node " + node.id + " has no parentNode");
        }
        return undefined;
    }

    if ((side === "centerv") || (side === "centerh")) {
        if (Logging.enableLogging === true) {
            Logging.log("node " + node.id + " " + side + " anchor");
        }

        if (Logging.enableLogging === true) {
            Logging.log("calculating bounds for parent of node " + node.id);
        }
        const parentBounds = node.parentLayer.calculatedBounds();
        if (Logging.enableLogging === true) {
            Logging.log("result bounds for parentBounds");
            Logging.dir(parentBounds);
        }

        if (side === "centerv") {
            let height = NUConvertToPixel(bounds.height);
            // do we have height anchor
            if (isDefined(anchors["height"]) && anchors["height"].active === true) {
                height = (anchors["height"].constant);
            }
            return px(NUConvertToPixel(parentBounds.height).amount / 2 - (height.amount) / 2);
        }
        if (side === "centerh") {
            let width = NUConvertToPixel(bounds.width);
            // do we have a width anchor
            if (isDefined(anchors["width"]) && anchors["width"].active === true) {
                width = NUConvertToPixel(anchors["width"].constant);
            }
            return px(NUConvertToPixel(parentBounds.width).amount / 2 - NUConvertToPixel((width)).amount / 2);
        }


    }



    if (anchors[side].target === "parentView") {
        if (Logging.enableLogging === true) {
            Logging.log("calculating bounds for parent of node " + node.id);
        }
        const parentBounds = node.parentLayer.calculatedBounds();
        if (Logging.enableLogging === true) {
            Logging.log("result bounds for parentBounds");
            Logging.dir(parentBounds);
        }


        if (anchors[side].targetSide === "leading") {
            return NUConvertToPixel(anchors[side].constant);
        }
        if (anchors[side].targetSide === "trailing") {
            if ((side === "left") || (side === "right")) {
                return px(NUConvertToPixel(parentBounds.width).amount + NUConvertToPixel(anchors[side].constant).amount);
            }
            if ((side === "top") || (side === "bottom")) {
                return px(NUConvertToPixel(parentBounds.height).amount + NUConvertToPixel(anchors[side].constant).amount);
            }
        }
        Logging.warn("Anchor " + side + " for view " + node.id + " does not specify a valid constraint");
        return undefined;
    } else {

        if (Logging.enableLogging === true) {
            const str = "MentatJS.LayoutEditor.Code.getAnchorValue(\"" + node.id + "\",\"" + side + "\") for target " + node.anchors[side].target;
            Logging.log(str);
        }

        const view = node.parentLayer.find(anchors[side].target);
        if (view === undefined) {
            Logging.warn("Anchor " + side + " for view " + this.id + " does not specify a target");
            return undefined;
        }

        const viewBounds = view.calculatedBounds();

        if (Logging.enableLogging === true) {
            Logging.log("bounds found for " + anchors[side].target + " = " + viewBounds);
        }

        if (viewBounds === undefined) {
            Logging.warn("Anchor " + side + " for view " + node.id + " does not specify a target with valid bounds.");
            return undefined;
        }
        if (anchors[side].targetSide === "leading") {
            if ((side === "left") || (side === "right")) {
                return px(NUConvertToPixel(viewBounds.x).amount + NUConvertToPixel(anchors[side].constant).amount);
            }
            if ((side === "top") || (side === "bottom")) {
                return px(NUConvertToPixel(viewBounds.y).amount + NUConvertToPixel(anchors[side].constant).amount);
            }

        }
        if (anchors[side].targetSide === "trailing") {
            if ((side === "left") || (side === "right")) {
                return px(NUConvertToPixel(viewBounds.x).amount + NUConvertToPixel(viewBounds.width).amount + NUConvertToPixel(anchors[side].constant).amount);
            }
            if ((side === "top") || (side === "bottom")) {
                return px(NUConvertToPixel(viewBounds.y).amount + NUConvertToPixel(viewBounds.height).amount + NUConvertToPixel(anchors[side].constant).amount);
            }
        }
        Logging.warn("Anchor " + side + " for view " + node.id + " does not specify a valid constraint");
        return undefined;
    }
}
