import {IFunction} from "./IFunction";
import {ITarget} from "./ITarget";
import {ISkeletScript} from "../Document/ISkeletScript";
import {ICompilationResult} from "./ICompilationResult";
import {SkeletScript} from "../Document/SkeletScript";
import {kTargetKind} from "./kTargetKind";
import {kFunctionType} from "./kFunctionType";
import {generateV4UUID, isDefined} from "mentatjs";


const NEWLINE = "\n";
const TAB = "\t";


function writeDebugHeader(fn: IFunction): string {
    return "/*SH:" + fn.id + "*/";
}
function writeDebugBody(fn: IFunction): string {
    return "/*SB:" + fn.id + "*/";
}

function genTab(tabs: number) {
    let ret = "";
    for (let i = 0; i < tabs; i += 1) {
        ret += TAB;
    }
    return ret;
}


function writeFunction(tabs, fn: IFunction, server_side: boolean): {
    generatedString: string;
    functionId: string;

} {
    let ret = "";
    let modifiers = "";
    for (let i = 0; i < fn.modifiers.length; i += 1) {
        modifiers += fn.modifiers[i] + " ";
    }
    ret += genTab(tabs) + writeDebugHeader(fn) + modifiers + fn.id + "(";
    for (let i = 0; i < fn.parameters.length; i += 1) {
        let p = fn.parameters[i];
        ret += p.id;
        if (p.optional) {
            ret += "?";
        }
        if (p.type !== "") {
            ret += ":" + p.type
        }
        if (p.defaultValue !== "") {
            ret += "=" + p.defaultValue as string;
        }
        if (i < fn.parameters.length-1) {
            ret += ",";
        }
    }
    ret += ") {" + NEWLINE;
    if ((fn.server_side === true && server_side === true) || fn.server_side === false) {
        ret += writeDebugBody(fn);
        tabs++;
        let lines = fn.value.split(NEWLINE);
        for (let i = 0; i < lines.length; i += 1) {
            ret += genTab(tabs) + lines[i] + NEWLINE;
        }
        tabs--;
    } else {
        ret += "AppWebSocket.instance.send(\"EXEC\", \"" + fn.id + "\", params)" + NEWLINE;
    }
    ret += genTab(tabs) + "}" + NEWLINE;
    return { generatedString: ret, functionId: fn.id};
}


export function precomp_generate(targets: ITarget[], sc: ISkeletScript, options: { tabs: boolean }):ICompilationResult[] {
    let ret = [];

    let tabs = 0;
    let s = SkeletScript.fromStruct(sc);
    let frontend_target = targets.find((t) => { return t.targetKind === kTargetKind.frontend;});
    let backend_target = targets.find((t) => { return t.targetKind === kTargetKind.backendService;});

    let frontend_file: ICompilationResult = {
        kind: "ICompilationResult",
        id: "",
        type: "ts",
        data: "",
        resMimeType: "",
        infos: {
            originId: sc.id,
            originKind: "ISkeletScriptFile",
            originTitle: sc.title,
            timestamp: new Date().toISOString()
        },
        debugInfos: {
            indices: []
        }
    };
    let backend_file: ICompilationResult = {
        kind: "ICompilationResult",
        id: "",
        type: "ts",
        data: "",
        resMimeType: "",
        infos: {
            originId: sc.id,
            originKind: "ISkeletScriptFile",
            originTitle: sc.title,
            timestamp: new Date().toISOString()
        },
        debugInfos: {
            indices: []
        }
    };
    let plugin_file: ICompilationResult = {
        kind: "ICompilationResult",
        id: "",
        type: "ts",
        data: "",
        resMimeType: "",
        infos: {
            originId: sc.id,
            originKind: "ISkeletScriptFile",
            originTitle: sc.title,
            timestamp: new Date().toISOString()
        },
        debugInfos: {
            indices: []
        }
    };



    let functionsDefined = [];

    if (sc.targetKind === kTargetKind.frontend) {

        // hidden init
        frontend_file.data += sc.hiddenImportSection + NEWLINE;

        // init?
        let fnInit = s.findFunctionWithType(kFunctionType.frontend_init)
        if (isDefined(fnInit)) {
            frontend_file.data += writeDebugHeader(fnInit);
            frontend_file.data += writeDebugBody(fnInit);
            frontend_file.data += fnInit.value + NEWLINE
            functionsDefined.push(fnInit.id);
        }
        if (sc.type === "class") {
            frontend_file.data += "export class " + sc.title;
            if (sc.classInfo?.doInherits !== "") {
                frontend_file.data += " extends " + sc.classInfo!.doInherits;
            }
            if (isDefined(sc.classInfo?.doImplements) && sc.classInfo?.doImplements.length > 0) {
                frontend_file.data += " implements ";
                sc.classInfo?.doImplements.forEach( (s, idx) => {
                    frontend_file.data += s;
                    if (idx < sc.classInfo.doImplements.length -1) {
                        frontend_file.data += ", ";
                    }
                })
            }
            frontend_file.data += " {" + NEWLINE;

        }

        let functions = s.functions;
        for (let i = 0; i < functions.length; i += 1) {
            let f = functions[i];
            if (false === functionsDefined.includes(f.id)) {
                if (false === f.server_side) {
                    tabs += 1;
                    frontend_file.data += writeFunction(tabs, f, false);
                    tabs -= 1;
                } else {
                    tabs += 1;
                    frontend_file.data += writeFunction(tabs, f, false);
                    tabs -= 1;
                    backend_file.data += writeFunction(0, f, true);
                }
            }
        }
        if (sc.type === "class") {
            frontend_file.data += "}" + NEWLINE;
        }
    }


    if (isDefined(frontend_target)) {
        ret.push({
            id: generateV4UUID(),
            data: frontend_file.data,
            type: "ts",
            infos: {
                targetKind: kTargetKind.frontend,
                targetId: frontend_target.id,
                originId: sc.id,
                originKind: "ISkeletScriptFile"
            }
        } as ICompilationResult);
    }
    if (isDefined(backend_target)) {
        ret.push({
            id: generateV4UUID(),
            data: backend_file.data,
            type: "ts",
            infos: {
                targetKind: kTargetKind.backendService,
                targetId: backend_target.id,
                originId: sc.id,
                originKind: "ISkeletScriptFile"
            }
        } as ICompilationResult);
    }

    return ret;
}