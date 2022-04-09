import {CustomPropertyType} from "../Environment/CustomPropertyType";
import {isDefined} from "mentatjs";

export function instanceofCustomPropertyType(object: any): object is CustomPropertyType {
    return isDefined(object) && isDefined(object.type) && isDefined(object.height) && isDefined(object.propertyCell)
        && isDefined(object.handlerFunction);
}