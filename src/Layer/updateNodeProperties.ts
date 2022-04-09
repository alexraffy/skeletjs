import {Layer} from "./Layer";
import {LayerView} from "./LayerView";
import {assert, generateV4UUID, safeCopy} from "mentatjs";
import {instanceOfLayer} from "../Guards/instanceOfLayer";
import {instanceOfLayerView} from "../Guards/instanceofLayerView";


export function updateNodeProperties(node: Layer, view: LayerView) {
    assert(instanceOfLayer(node) && instanceOfLayerView(view), "updateNodeProperties expects a Layer, View and string")
    let currentProperties = node.properties;
    let newProperties = view.exportProperties("");
    let i = currentProperties.length -1;
    while (i >= 0) {
        let exists = newProperties.find((prop) => { return prop.property_id === currentProperties[i].property_id;});
        if (!exists) {
            currentProperties.splice(i, 1);
        }
        i = i -1;
    }
    for (i = 0; i < newProperties.length; i += 1) {
        let exists = currentProperties.find((prop) => { return prop.property_id === newProperties[i].property_id; });
        if (!exists) {
            let newProp = safeCopy(newProperties[i]);
            newProp.id = generateV4UUID;
            currentProperties.push(newProp);

        }
    }
}