import {LayerData} from "../Layer/LayerData";
import {Layer} from "../Layer/Layer";
import {assert, isDefined} from "mentatjs";
import {instanceOfLayerData} from "../Guards/instanceOfLayerData";


function generateLayerTree(layers: LayerData[]): Layer {
    assert(isDefined(layers) && Array.isArray(layers) && layers.every ((l) => { return instanceOfLayerData(l);}),
        "generateLayerTree expects an Array of LayerData as parameter.");
    let containerView: Layer = undefined;
    let parentLayer: Layer = undefined;
    let orphaned: Layer[] = [];


    for (let i = 0; i < layers.length; i += 1) {
        let l = new Layer(layers[i]);
        if (i === 0 && l.special_id !== "workspace.views") {
            throw "First layer in a snapshot must be a group container";
        } else if (i === 0 && l.special_id === "workspace.views") {
            containerView = l;
            parentLayer = l;
        } else {
            parentLayer = containerView.find(l.parent_id);
            if (!isDefined(parentLayer)) {
                orphaned.push(l)
                containerView.adopt(l);
                l.setPage();

                parentLayer = containerView;
            } else {
                parentLayer.adopt(l);
                if (parentLayer.id === containerView.id) {
                    l.setPage();

                }
            }

        }
    }
    //if (orphaned.length > 0) {
    //console.warn("Orphaned Layers:");
    //console.warn(orphaned);
    // }
    return containerView;
}




