import {IFunctionParam} from "../Compiler/IFunctionParam";
import {IFunction} from "../Compiler/IFunction";
import {kFunctionType} from "../Compiler/kFunctionType";


export function genFunction(id: string, server_side: boolean, return_type: string,
                            params: IFunctionParam[], value: string, deletable: boolean,
                            editable: boolean, renamable: boolean, language: string): IFunction {
    let ret: IFunction = {
        kind: "IFunction",
        id: id,
        action_type: kFunctionType.frontend_function,
        optional: false,
        return_type: return_type,
        server_side: server_side,
        help_trad_id: "",
        trad_id: "",
        triggered_by: [],
        triggers: [],
        parameters: params,
        modifiers: [],
        value: value,
        deletable: deletable,
        editable: editable,
        renamable: renamable,
        language: language
    }
    return ret;
}

