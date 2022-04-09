import {ISkeletServerResponse} from "../Environment/ISkeletServerResponse";
import {isDefined} from "mentatjs";

export function instanceOfISkeletServerResponse(object: any): object is ISkeletServerResponse {
    return isDefined(object) && isDefined(object.valid) && isDefined(object.request) &&
        (isDefined(object.response) || isDefined(object.error));
}