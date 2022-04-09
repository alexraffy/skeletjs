import {isDefined} from "mentatjs";
import {ISkeletWebSocketResponse} from "../Environment/ISkeletWebSocketResponse";


export function instanceOfISkeletWebSocketResponse(object: any): object is ISkeletWebSocketResponse {
    return isDefined(object) && isDefined(object.id) && isDefined(object.message);
}