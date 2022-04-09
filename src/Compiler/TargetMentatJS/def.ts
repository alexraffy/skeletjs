import {kFunctionType} from "../kFunctionType";
import {IFunction} from "../IFunction";


export class TargetMentatJS {

    targets(): string[] {
        return ["electron", "web"];
    }

    initProject() {
        let server = {
            
        }
    }


}





const global_init: IFunction = {
    kind: "IFunction",
    id: "global_init",
    action_type: kFunctionType.frontend_global,
    optional: true,
    server_side: false,
    return_type: "void",
    parameters: [],
    modifiers: [],
    trad_id: "IFE_GLOBAL_INIT",
    help_trad_id: "IFE_GLOBAL_INIT_HELP",
    triggered_by: ["server_init"],
    triggers: ["init"],
    value: "",
    deletable: false,
    editable: true,
    renamable: false,
    language: "ts"
}
const init: IFunction = {
    kind: "IFunction",
    id: "init",
    action_type: kFunctionType.frontend_init,
    optional: false,
    server_side: false,
    return_type: "void",
    parameters: [],
    modifiers: [],
    trad_id: "IFE_INIT",
    help_trad_id: "IFE_INIT_HELP",
    triggered_by: ["global_init"],
    triggers: [],
    value: "",
    deletable: false,
    editable: true,
    renamable: false,
    language: "ts"
}

const fns_project = [global_init];
const fns_view = [init];
