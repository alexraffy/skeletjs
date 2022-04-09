import {IFunctionParam} from "../Compiler/IFunctionParam";


export function instanceOfIFunctionParam(object: any): object is IFunctionParam {
    return object.kind === "IFunctionParam";
}
