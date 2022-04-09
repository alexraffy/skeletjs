
import {Layer} from "./Layer";
import {moveLayerUp} from "./moveLayerUp";


export function moveLayerTop(node: Layer, parentNode: Layer): boolean {
    let cont = true;
    while (cont) {
        cont = moveLayerUp(node, parentNode);
    }
    return true;

}