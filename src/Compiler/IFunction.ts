
import {kFunctionType} from "./kFunctionType";
import {IFunctionParam} from "./IFunctionParam";


export interface IFunction {
    kind: "IFunction";
    id: string;
    action_type: kFunctionType;
    optional: boolean;
    server_side: boolean;
    return_type: string;
    parameters: IFunctionParam[];
    modifiers: string[];
    trad_id: string;
    help_trad_id: string;
    triggered_by: string[];
    triggers: string[];
    value: string;
    deletable: boolean;
    editable: boolean;
    renamable: boolean;
    language: string;
}
