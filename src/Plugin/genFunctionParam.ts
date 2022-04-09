import {IFunctionParam} from "../Compiler/IFunctionParam";


export function genFunctionParam(id: string, type: string, optional, value: any): IFunctionParam {
    let ret: IFunctionParam = {
        kind: "IFunctionParam",
        id: id,
        type: type,
        trad_id: "",
        help_trad_id: "",
        optional: optional,
        defaultValue: value
    };
    return ret;
}