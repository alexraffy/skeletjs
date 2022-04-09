import {Workspace} from "../Document/Workspace";
import {Bounds} from "mentatjs";
import {BoundsHashMapLeaf} from "./BoundsHashMapLeaf";
import {Layer} from "../Layer/Layer";


export function generateBoundsHashMap(workspace: Workspace) {
    let tree: BoundsHashMapLeaf[] = [];
    let ret: { [key:string]: Bounds } = {};

    workspace.layersTree.children.forEach((c) => {
        let bounds = c.boundsOnCanvas();
        let leaf = {id: c.id, bounds: bounds, children: [], parent: undefined};
        let recursive = function (layer: Layer, parentLeaf: BoundsHashMapLeaf, parentLayer: Layer) {
            let b = layer.boundsOnCanvas();
            let leaf = {id: layer.id, bounds: b , children: [], parent: parentLeaf};
            ret[layer.id] = b;
            layer.children?.forEach((lc) => {
                let retleaf2 = recursive(lc, leaf, parentLayer);
                if (retleaf2 !== undefined) {
                    leaf.children.push(retleaf2);
                }
            });
            return leaf;
        }
        c.children?.forEach((c2) => {
            let retleaf = recursive(c2, leaf, undefined);
            if (retleaf !== undefined) {
                leaf.children.push(retleaf);
            }
        });
    });


    return ret;
}


