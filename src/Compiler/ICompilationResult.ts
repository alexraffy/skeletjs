import {DebugIndexInfo} from "./DebugIndexInfo";
import {kTargetKind} from "./kTargetKind";


export interface ICompilationResult {
    kind: "ICompilationResult";
    id: string;
    type: "ts" | "js" | "map" | "res";
    resMimeType: string;
    data: string;
    debugInfos: {
        indices: DebugIndexInfo[];
    }
    infos: {
        originTitle?: string;
        targetKind?: kTargetKind;
        targetId?: string;
        originKind?: "ISkeletScriptFile" | "ICompilationResult";
        originId?: string;
        timestamp?: string;
        [key:string]:any
    }
}
