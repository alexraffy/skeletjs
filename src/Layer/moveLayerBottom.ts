
import {Layer} from "./Layer";
import {moveLayerDown} from "./moveLayerDown";


export function moveLayerBottom(node: Layer, parentNode: Layer): boolean {
    let cont = true;
    while (cont) {
        cont = moveLayerDown(node, parentNode);
    }
    return true;

}