import {LayerView} from "../Layer/LayerView";
import {isDefined} from "mentatjs";


export function instanceOfLayerView(object: any): object is LayerView {
    return isDefined(object) && isDefined(object.exportProperties);
}