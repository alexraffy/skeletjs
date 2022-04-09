import {IFunction} from "../Compiler/IFunction";

export function instanceOfIFunction(object: any): object is IFunction {
    return object.kind === "IFunction";
}