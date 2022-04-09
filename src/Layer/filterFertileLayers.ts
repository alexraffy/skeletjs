import {Layer} from "./Layer";
import {Bounds} from "mentatjs";


export function filterFertileLayers(layers: { layer: Layer; depth: number; bounds: Bounds }[]): { layer: Layer; depth: number; bounds: Bounds }[] {
    return layers.filter( (layerInfo: { layer: Layer; depth: number; bounds: Bounds }) => {
        return layerInfo.layer.canHaveChildren === true;
    });
}




