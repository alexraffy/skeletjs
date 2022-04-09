import {ITarget} from "../Compiler/ITarget";


export function instanceOfITarget(object: any): object is ITarget {
    return object.kind === "ITarget";
}



















