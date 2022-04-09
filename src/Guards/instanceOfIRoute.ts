import {IRoute} from "../Document/IRoute";

export function instanceOfIRoute(object: any): object is IRoute {
    return object.kind === "IRoute";
}