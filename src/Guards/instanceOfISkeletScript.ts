import {ISkeletScript} from "../Document/ISkeletScript";

export function instanceOfISkeletScript(object: any): object is ISkeletScript {
    return object.kind === "ISkeletScriptFile";
}