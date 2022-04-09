import {Layer} from "./Layer";


export function moveLayerDown(node: Layer, parentNode: Layer): boolean {
    let idx = -1;
    for (let i = 0; i < parentNode.children.length; i++) {
        if (parentNode.children[i].id === node.id) {
            idx = i;
        }
    }
    if (idx === parentNode.children.length -1) {
        return false;
    }

    let nextNode = parentNode.children[idx+1];
    parentNode.children[idx] = nextNode;
    parentNode.children[idx + 1] = node;

    return true;
}

