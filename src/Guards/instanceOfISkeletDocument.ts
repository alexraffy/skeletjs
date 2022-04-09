import {ISkeletDocument} from "../Document/ISkeletDocument";

export function instanceOfISkeletDocument(object: any): object is ISkeletDocument {
    return object.kind === "ISkeletDocument";
}