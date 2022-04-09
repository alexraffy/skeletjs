import {Layer} from "./Layer";
import {isDefined} from "mentatjs";


export function copyTextStyle(node: Layer) {
    if (!isDefined(node)) {
        return null;
    }

    let property_textStyle = node.property("label.textStyle");

    return {
        textStyle: property_textStyle.value
    };
}
