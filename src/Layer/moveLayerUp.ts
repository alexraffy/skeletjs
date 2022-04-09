import {Layer} from "./Layer";


export function moveLayerUp(node: Layer, parentNode: Layer): boolean {
    let idx = -1;
    for (let i = 0; i < parentNode.children.length; i++) {
        if (parentNode.children[i].id === node.id) {
            idx = i;
        }
    }
    if (idx === 0) {
        return false;
    }

    let previousNode = parentNode.children[idx-1];
    parentNode.children[idx -1] = node;
    parentNode.children[idx] = previousNode;

    return true;
}