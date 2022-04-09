

import {IFunction} from "../Compiler/IFunction";
import {kTargetKind} from "../Compiler/kTargetKind";


export interface ISkeletScript {
    kind: "ISkeletScriptFile";
    id: string;
    title: string;
    targetKind: kTargetKind;
    functions: IFunction[];
    hiddenImportSection: string;
    type: "class" | "text";
    path: string;
    classInfo: {
        doInherits: string;
        doImplements: string[];
    }
}