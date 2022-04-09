import {Layer} from "../Layer/Layer";
import {instanceOfLayerData} from "./instanceOfLayerData";


export function instanceOfLayer(object: any): object is Layer {
    return instanceOfLayerData(object._data);
}