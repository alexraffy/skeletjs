import {ISkeletResource} from "../Document/ISkeletResource";

export function instanceOfISkeletResource(object: any): object is ISkeletResource {
    return object.kind === "ISkeletResource";
}