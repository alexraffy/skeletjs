import {isDefined} from "mentatjs";


export function viewStyleApplyProperties(property_id: string, value: any) {

    if (!isDefined(this)) {
        throw "viewStyleApplyProperties must be bind to a ILayoutEditorView";
    }
    this.invalidateBounds();

    let defaultStyle = this.getDefaultStyle();

    switch (property_id) {
        case "view.bounds":
            defaultStyle.bounds = value;
            break;
        case "view.opacity":
            defaultStyle.opacity = value;
            break;
        case "view.blendingMode":
            defaultStyle.blendingMode = value;
            break;
        case "view.borderRadius":
            defaultStyle.borderRadius = value;
            break;
        case "view.fills":
            defaultStyle.fills = value;
            break;
        case "view.borders":
            defaultStyle.borders = value;
            break;
        case "view.overflow":
            defaultStyle.overflow = value;
            break;
        case "view.cursor":
            defaultStyle.cursor = value;
            break;
        case "view.userSelect":
            defaultStyle.userSelect = value;
            break;
        case "view.extracss":
            defaultStyle.extraCss = value;
            break;
        case "view.shadows":
            defaultStyle.shadows = value;
            break;
    }
}
