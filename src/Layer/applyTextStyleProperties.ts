import {PropertyTextStyle, View} from "mentatjs";


export function applyTextStyleProperties(view: any, property_id: string, textStyleProperty: PropertyTextStyle) {
    if (property_id === "label.textStyle") {
        let style = (view as View).getDefaultStyle();
        style.textStyle = textStyleProperty;

    }
}