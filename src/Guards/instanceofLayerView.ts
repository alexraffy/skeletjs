import {LayerView} from "../Layer/layerView";
import {isDefined} from "mentatjs";


export function instanceOfLayerView(object: any): object is LayerView {
    return isDefined(object) && isDefined(object.exportProperties);
}