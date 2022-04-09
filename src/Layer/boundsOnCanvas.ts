import {Layer} from "./Layer";
import {instanceOfLayer} from "../Guards/instanceOfLayer";
import {assert, Bounds, isDefined, NUConvertToPixel, px, safeCopy} from "mentatjs";


export function boundsOnCanvas(node: Layer, newBounds: Bounds): Bounds {
    assert(instanceOfLayer(node), "boundsOnCanvas expects a layer and bounds as parameters.");
    let parentLayer = node.parentLayer;
    let ret = safeCopy(newBounds);


    while (isDefined(parentLayer) && parentLayer.special_id !== "workspace.views") {
        let pbounds = parentLayer.bounds();
        if (pbounds) {
            ret.x = px( NUConvertToPixel(ret.x).amount + NUConvertToPixel(pbounds.x).amount);
            ret.y = px( NUConvertToPixel(ret.y).amount + NUConvertToPixel(pbounds.y).amount);
        }
        parentLayer = parentLayer.parentLayer;
    }
    return ret;
}

