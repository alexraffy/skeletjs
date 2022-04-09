import {isDefined} from "mentatjs";
import {ISkeletWebSocketRequest} from "../Environment/ISkeletWebSocketRequest";

export function instanceOfISkeletWebSocketRequest(object: any): object is ISkeletWebSocketRequest {
    return isDefined(object) && isDefined(object.id) && isDefined(object.message);
}