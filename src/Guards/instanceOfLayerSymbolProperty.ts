import {LayerSymbolProperty} from "../Layer/LayerSymbolProperty";


export function instanceOfLayerSymbolProperty(object: any): object is LayerSymbolProperty {
    return object.kind === "LayerSymbolProperty";
}
