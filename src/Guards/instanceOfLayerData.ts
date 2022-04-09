import {LayerData} from "../Layer/LayerData";


export function instanceOfLayerData(object: any): object is LayerData {
    return object.kind === "LayerData";
}