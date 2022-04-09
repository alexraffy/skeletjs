import {Layer} from "./Layer";
import {isDefined} from "mentatjs";


export function copyStyle(node: Layer) {
    if (!isDefined(node)) {
        return null;
    }

    let property_fills = node.property("view.fills");
    let property_borders = node.property("view.borders");
    let property_shadows = node.property("view.shadows");

    return {
        fills: property_fills.value,
        borders: property_borders.value,
        shadows: property_shadows.value
    };
}
