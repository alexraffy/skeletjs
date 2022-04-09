import {LayerState} from "../Layer/LayerState";
import {isDefined} from "mentatjs";


export function instanceOfLayerState(object: any): object is LayerState {
    return isDefined(object) && isDefined(object.id) &&
        isDefined(object.title) && isDefined(object.isDefaultState) &&
        isDefined(object.type) && isDefined(object.overrides);

}
