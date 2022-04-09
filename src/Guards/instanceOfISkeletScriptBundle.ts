import {ISkeletScriptBundle} from "../Document/ISkeletScriptBundle";
import {instanceOfISkeletScript} from "./instanceOfISkeletScript";


export function instanceOfISkeletScriptBundle(object: any): object is ISkeletScriptBundle {
    return object.kind === "ISkeletScriptBundle" &&
        object.scripts.every( (s) => { return instanceOfISkeletScript(s);});
}
