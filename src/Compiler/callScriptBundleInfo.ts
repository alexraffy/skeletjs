import {ISkeletScript} from "../Document/ISkeletScript";
import {instanceOfISkeletScript} from "../Guards/instanceOfISkeletScript";
import {assert, isDefined} from "mentatjs";


export function callScriptBundleFunction(f: ISkeletScript, name: string, params: any[]) {
    assert(instanceOfISkeletScript(f), "callScriptBundleFunction expects a ISkeletScript as first parameter.");
    let fn = f.functions.find((f) => { return f.id === name;});
    if (isDefined(fn)) {
        let fnToCall = undefined;
        eval("fnToCall = (...params) => { " + fn.value + "}");
        return fnToCall(...params);
    }
    return undefined;
}
