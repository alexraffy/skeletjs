import {ICompilationResult} from "../Compiler/ICompilationResult";
import {isDefined} from "mentatjs";

export function instanceOfICompilationResult(object: any): object is ICompilationResult {
    return isDefined(object) && object.kind === "ICompilationResult";
}