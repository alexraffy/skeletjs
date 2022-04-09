import {precomp_generate} from "./prep_compile";
import {ITarget} from "./ITarget";
import {ISkeletScript} from "../Document/ISkeletScript";
import {ICompilationResult} from "./ICompilationResult";
import {instanceOfITarget} from "../Guards/instanceOfITarget";
import {instanceOfISkeletScript} from "../Guards/instanceOfISkeletScript";
import {assert, isDefined} from "mentatjs";


export function compileScript(targets: ITarget[], script: ISkeletScript, options): ICompilationResult[] {
    assert(
        isDefined(targets) &&
        isDefined(script) &&
        Array.isArray(targets) &&
        targets.every( (t) => { return instanceOfITarget(t);}) &&
        instanceOfISkeletScript(script),
        "compileScript expects an Array of ITarget and a ISkeletScript as parameters."
    );
    let ret: ICompilationResult[] = [];
    // generate typescript
    ret = precomp_generate(targets, script, options);

    return ret;
}
