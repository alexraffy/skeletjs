import {Layer} from "./Layer";
import {Bounds, isDefined, LayerProperty, Logging, NUConvertToPixel, px, safeCopy} from "mentatjs";
import {getAnchorValue} from "./getAnchorValue";
import {boundsOnCanvas} from "./boundsOnCanvas";


export function calculateBounds(node: Layer, requestBy: string, onCanvas: boolean = false): Bounds {
    if (isDefined(node) === false) {
        Logging.warn("calculateBounds expects a node");
        return undefined;
    }

    if (node.special_id === "workspace.views") {
        return new Bounds(0, 0, 9600, 9600);
    }

    let bounds = node.bounds();
    let anchors = node.anchors();

    if (Logging.enableLogging === true) {
        const str = node.id + ".getBounds(\"" + requestBy + "\");";
        Logging.log(str);
    }

    if (node.isPage === true) {
        //if (onCanvas === true) {
        return bounds;
        //}
        return {
            kind: "Bounds",
            x: px(0),
            y: px(0),
            width: bounds.width,
            height: bounds.height,
            unit: bounds.unit,
            position: bounds.position,
            rotation: bounds.rotation,
            elevation: bounds.elevation
        };

    }

    const parentNode = node.parentLayer;
    let parentBounds = undefined;
    let parentLayerProperties: LayerProperty[] = [];
    if (parentNode === undefined) {
        Logging.warn(node.id + " has no parentNode");
        return bounds;
    } else {
        if (requestBy !== "parentView") {
            parentBounds = calculateBounds(parentNode, requestBy, onCanvas);
        } else {
            parentBounds = new Bounds(0,0,0,0);
        }
    }
    if ((anchors === undefined) || (anchors === null)) {
        if (onCanvas === true) {
            return boundsOnCanvas(node, safeCopy(bounds));
        } else {
            return bounds;
        }
    }
    if ((anchors["top"].active === false) && (anchors["left"].active === false) &&
        (anchors["right"].active === false) && (anchors["bottom"].active === false) &&
        (anchors["width"].active === false) && (anchors["height"].active === false)
    ) {
        if (onCanvas === true) {
            return boundsOnCanvas(node, safeCopy(bounds));
        } else {
            return bounds;
        }
    }

    const defaultBounds = bounds;
    if (Logging.enableLogging === true) {
        Logging.log(node.id + ".defaultBounds " );
        Logging.dir(defaultBounds);
    }

    let newBounds = undefined;
    // left + width = right
    let left = getAnchorValue(node, "left");
    let width = getAnchorValue(node,  "width");
    let right = getAnchorValue(node,  "right");

    if (Logging.enableLogging === true) {
        Logging.log(node.id + ".anchorLeft = ");
        if (left === undefined) { Logging.log("anchorLeft = null"); } else { Logging.log("value is " + left); }
        if (width === undefined) { Logging.log("anchorWidth = null"); } else { Logging.log("value is " + width); }
        if (right === undefined) { Logging.log("anchorRight = null"); } else { Logging.log("value is " + right); }

    }


    if (left === undefined) {
        if ((width !== undefined) && (right !== undefined)) {
            left = px(NUConvertToPixel(right).amount - NUConvertToPixel(width).amount);
        } else if (width !== undefined) {
            // just use the default x
            left = NUConvertToPixel(defaultBounds.x);
            right = px(NUConvertToPixel(left).amount + NUConvertToPixel(width).amount);
        } else if (right !== undefined) {
            // just use the default x
            left = NUConvertToPixel(defaultBounds.x);
            width = px(NUConvertToPixel(right).amount - NUConvertToPixel(left).amount);
        } else if ((width === undefined) && (right === undefined)) {
            left = NUConvertToPixel(defaultBounds.x);
            width = NUConvertToPixel(defaultBounds.width);
            right = px(NUConvertToPixel(defaultBounds.x).amount + NUConvertToPixel(defaultBounds.width).amount);
        }
    } else if (width === undefined) {
        if ((left !== undefined) && (right !== undefined)) {
            width = px(NUConvertToPixel(right).amount - NUConvertToPixel(left).amount);
        } else if (left !== undefined) {
            // just use the default width
            width = NUConvertToPixel(defaultBounds.width);
            right = px(NUConvertToPixel(left).amount + NUConvertToPixel(width).amount);
        } else if (right !== undefined) {
            left = NUConvertToPixel(defaultBounds.x);
            width = px(NUConvertToPixel(right).amount - NUConvertToPixel(left).amount);
        } else if ((left === undefined) && (right === undefined)) {
            left = NUConvertToPixel(defaultBounds.x);
            width = NUConvertToPixel(defaultBounds.width);
            right = px(NUConvertToPixel(defaultBounds.x).amount + NUConvertToPixel(defaultBounds.width).amount);
        }
    } else if (right === undefined) {
        if ((left !== undefined) && (width !== undefined)) {
            right = px(NUConvertToPixel(left).amount + NUConvertToPixel(width).amount);
        } else if (left !== undefined) {
            width = NUConvertToPixel(defaultBounds.width);
            right = px(NUConvertToPixel(left).amount + NUConvertToPixel(width).amount);
        } else if (width !== undefined) {
            left = NUConvertToPixel(defaultBounds.x);
            right = px(NUConvertToPixel(left).amount + NUConvertToPixel(width).amount);
        } else if ((left === undefined) && (width === undefined)) {
            left = NUConvertToPixel(defaultBounds.x);
            width = NUConvertToPixel(defaultBounds.width);
            right = px(NUConvertToPixel(defaultBounds.x).amount + NUConvertToPixel(defaultBounds.width).amount);
        }
    }

    // top + height = bottom
    let top = getAnchorValue(node, "top");
    let height = getAnchorValue(node, "height");
    let bottom = getAnchorValue(node, "bottom");

    if (Logging.enableLogging === true) {
        Logging.log(node.id + ".anchorTop = " + (top === undefined) ? "null" : top);
        Logging.log(node.id + ".anchorHeight = " + (height === undefined ) ? "null" : height);
        Logging.log(node.id + ".anchorBottom = " + (bottom === undefined ) ? "null" : bottom);
    }

    if (top === undefined) {
        if ((height !== undefined) && (bottom !== undefined)) {
            top = px(NUConvertToPixel(bottom).amount - NUConvertToPixel(height).amount);
        } else if (height !== undefined) {
            // just use the default x
            top = NUConvertToPixel(defaultBounds.y);
            bottom = px(NUConvertToPixel(top).amount + NUConvertToPixel(height).amount);
        } else if (bottom !== undefined) {
            // just use the default x
            top = NUConvertToPixel(defaultBounds.y);
            height = px(NUConvertToPixel(bottom).amount - NUConvertToPixel(top).amount);
        } else if ((height === undefined) && (bottom === undefined)) {
            top = NUConvertToPixel(defaultBounds.y);
            height = NUConvertToPixel(defaultBounds.height);
            bottom = px(NUConvertToPixel(defaultBounds.y).amount + NUConvertToPixel(defaultBounds.height).amount);
        }
    } else if (height === undefined) {
        if ((top !== undefined) && (bottom !== undefined)) {
            height = px(NUConvertToPixel(bottom).amount - NUConvertToPixel(top).amount);
        } else if (top !== undefined) {
            // just use the default width
            height = NUConvertToPixel(defaultBounds.height);
            bottom = px(NUConvertToPixel(top).amount + NUConvertToPixel(height).amount);
        } else if (bottom !== undefined) {
            top = NUConvertToPixel(defaultBounds.y);
            height = px(NUConvertToPixel(bottom).amount - NUConvertToPixel(top).amount);
        } else if ((top === undefined) && (bottom === undefined)) {
            top = NUConvertToPixel(defaultBounds.y);
            height = NUConvertToPixel(defaultBounds.height);
            bottom = px(NUConvertToPixel(defaultBounds.y).amount + NUConvertToPixel(defaultBounds.height).amount);
        }
    } else if (bottom === undefined) {
        if ((top !== undefined) && (height !== undefined)) {
            bottom = px(NUConvertToPixel(top).amount + NUConvertToPixel(height).amount);
        } else if (top !== undefined) {
            height = NUConvertToPixel(defaultBounds.height);
            bottom = px(NUConvertToPixel(top).amount + NUConvertToPixel(height).amount);
        } else if (height !== undefined) {
            top = NUConvertToPixel(defaultBounds.y);
            bottom = px(NUConvertToPixel(top).amount + NUConvertToPixel(height).amount);
        } else if ((top === undefined) && (height === undefined)) {
            top = NUConvertToPixel(defaultBounds.y);
            height = NUConvertToPixel(defaultBounds.height);
            bottom = px(NUConvertToPixel(defaultBounds.y).amount + NUConvertToPixel(defaultBounds.height).amount);
        }
    }
    newBounds = {
        kind: "Bounds",
        x: (left),
        y: (top),
        width: (width),
        height: (height),
        unit: "px",
        position: "absolute",
        rotation: defaultBounds.rotation,
        elevation: defaultBounds.elevation
    };

    if (onCanvas === true) {

        newBounds = boundsOnCanvas(node, newBounds);
    }


    if (Logging.enableLogging === true) {
        Logging.log(node.id + ".newBounds = ");
        Logging.dir(newBounds);
    }
    return newBounds;
}