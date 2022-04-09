



import {
    createDefaultMapFromNodeModules,
    createSystem, createVirtualCompilerHost,
    createVirtualTypeScriptEnvironment,
    knownLibFilesForCompilerOptions
} from "@typescript/vfs"

import * as ts from "typescript"

import {Modifier, NodeArray, ParameterDeclaration} from "typescript";
import {ICompilerServiceDelegate} from "./ICompilerServiceDelegate";
import {SkeletDocument} from "../Document/SkeletDocument";
import {ITarget} from "./ITarget";
import {ICompilationResult} from "./ICompilationResult";
import {Application, getLocalizedString, isDefined, LocalizedString} from "mentatjs";
import {SkeletEnvironment} from "../Environment/SkeletEnvironment";
import {ISkeletScript} from "../Document/ISkeletScript";
import {kTargetKind} from "./kTargetKind";
import {compileScript} from "./compileScript";
import {IFunction} from "./IFunction";
import {IFunctionParam} from "./IFunctionParam";
import {kFunctionType} from "./kFunctionType";
import {SkeletWebSocket} from "../Environment/SkeletWebSocket";
import {
    IWSRGetTypescriptLibsRequest,
    IWSRGetTypescriptLibsResponse,
    WSRGetTypescriptLibs
} from "../Environment/ServerCommands";
import {Session} from "../Session/Session";




function getModifiers(sf: ts.SourceFile, modifiers: NodeArray<Modifier>): string[] {
    let ret: string[] = [];
    if (modifiers !== undefined) {
        for (let i = 0; i < modifiers.length; i += 1) {
            ret.push(modifiers[i].getText(sf));
        }
    }
    return ret;
}

function getParametersFromDecl(sf: ts.SourceFile, parameters: NodeArray<ParameterDeclaration>): IFunctionParam[] {
    let ret = [];
    // get parameter type
    if (parameters === undefined) {
        return ret;
    }
    for (let i = 0; i < parameters.length; i += 1) {
        let p  = parameters[i];
        const paramName = p.name.getText(sf);
        const typeName = p.type.getText(sf);
        let isOptional = false;
        let defaultValue = undefined;
        if (p.initializer !== undefined) {
            defaultValue = p.initializer.getText(sf);
        }
        if (p.questionToken !== undefined) {
            if (p.questionToken.getText(sf) === "?") {
                isOptional = true;
            }
        }


        ret.push({
            kind: "IFunctionParam",
            id: paramName,
            type: typeName,
            optional: isOptional,
            trad_id: "",
            help_trad_id: "",
            defaultValue: defaultValue
        });
    }
    return ret;
}


export class CompilerService {

    delegate: ICompilerServiceDelegate;

    private static _instance: CompilerService;
    private _doc: SkeletDocument;
    private _ready: boolean = false
    private _ts: (typeof import("typescript") | undefined) = undefined;
    private _target: ts.ScriptTarget;
    private _fsMap: Map<string, string>;
    private keyValues: {
        [key: string]: any
    }[] = [];

    private targets: {
        decl: ITarget;
        compilationResults: ICompilationResult[];
        timestamp: string;
    }[] = [];

    constructor() {
        if (isDefined(CompilerService._instance)) {
            return CompilerService._instance;
        } else {
            CompilerService._instance = this;
            return this;
        }
    }
    static get instance(): CompilerService {
        if (isDefined(CompilerService._instance)) {
            return CompilerService._instance;
        } else {
            throw "CompilerService not initialized";
        }
    }

    setDocument(doc: SkeletDocument) {
        this._doc = doc;
        this.targets = [];
        doc.targets.forEach((t) => {
            this.targets.push({
                decl: t,
                compilationResults: [],
                timestamp: new Date().toISOString()
            });
        });

    }



    prep(env: SkeletEnvironment, ts: (typeof import("typescript") | undefined), target: ts.ScriptTarget, files: {file: string, data: string }[]) {
        this._ts = ts;
        this._target = target;
        this._fsMap = new Map<string, string>();

        for (let i = 0; i < files.length; i ++) {
            this._fsMap.set(files[i].file, files[i].data);
        }


    }


    setup() {
        let fsMap = new Map<string, string>();
        this._fsMap.forEach((value: string, key: string) => {
           fsMap.set("/"+key, value);
        });
        //fsMap.set("index.ts", 'const a = "Hello World"');

        const content = `/// <reference types="node" />\nimport * as path from 'path';\nclass X { a: string; }\npath.`
        fsMap.set("index.ts", content);

        const system = createSystem(fsMap)

        const compilerOpts = {}
        const env = createVirtualTypeScriptEnvironment(system, ["index.ts"], ts, compilerOpts)

        const host = createVirtualCompilerHost(system, compilerOpts, ts)

        const program = ts.createProgram({
            rootNames: [...fsMap.keys()],
            options: compilerOpts,
            host: host.compilerHost,
        })

// This will update the fsMap with new files
// for the .d.ts and .js files
        let result: ts.EmitResult = program.emit()




// Now I can look at the AST for the .ts file too
        const index = program.getSourceFile("index.ts")
        console.dir(index);

        console.log("diagnostics of emit");
        console.dir(result.diagnostics);
        console.log("global diagnostics");
        console.dir(program.getGlobalDiagnostics());
        console.log("decl diagnostics");
        console.dir(program.getDeclarationDiagnostics(index));

        console.log("semtanic diagnostics");
        console.dir(program.getSemanticDiagnostics(index));

        console.log("syntactic diagnostics");
        console.dir(program.getSyntacticDiagnostics(index));

        console.log("Document highlights");
        let docHighlights = env.languageService.getDocumentHighlights("index.ts", 0, ["index.ts"]);
        console.dir(docHighlights);
        console.log("Completions");
        let compl = env.languageService.getCompletionsAtPosition("index.ts", content.length, {});
        console.dir(compl);

        this._ready = true;
    }


    compile(extraScripts: ISkeletScript[] = undefined) {
        if (!isDefined(this._doc)) {
            return;
        }

        let generatedScripts: ICompilationResult[] = [];
        let options = {
            generateOnly: true
        };
        let targets = this._doc.targets;
        let fet = targets.find((t) => { return t.targetKind === kTargetKind.frontend;});
        let bet = targets.find((t) => { return t.targetKind === kTargetKind.backendService;});

        let bundles = this._doc.scriptBundles;
        bundles.forEach((b, i) => {
           let sc = b.scripts()
           sc.forEach( (s, isc) => {
               let retCompilation = compileScript(targets, s.toJSON(), options);
               generatedScripts.push(...retCompilation);
               if (isDefined(this.delegate)) {
                   this.delegate.compilationStep("ts", retCompilation);
               }
           });
        });

        if (isDefined(extraScripts) && extraScripts.length > 0) {
            extraScripts.forEach((es) => {
                let retCompilation = compileScript(targets, es, options);
                generatedScripts.push(...retCompilation);
                if (isDefined(this.delegate)) {
                    this.delegate.compilationStep("ts", retCompilation);
                }
            })
        }
        // save
        for (let i = 0; i < generatedScripts.length; i += 1) {
            let sc = generatedScripts[i];
            if (sc.data === "") {
                continue;
            }

            switch (sc.infos.targetKind) {
                case kTargetKind.frontend:
                    if (sc.type === "ts") {
                        let fileName = "/src/frontend/" + sc.id + ".ts";
                        this._fsMap.set(fileName, sc.data);
                    }
                    break;
                case kTargetKind.backendService:
                    if (sc.type === "ts") {
                        let fileName = "/src/backend/" + sc.id + ".ts";
                        this._fsMap.set(fileName, sc.data);
                    }
                    break;
            }
        }
        this.compileStep2(fet);
        this.compileStep2(bet);
    }

    compileStep2(target: ITarget) {
        console.log("Compiling target " + getLocalizedString(LocalizedString.fromStruct(target.name), []).content);
        let fsMap = new Map<string, string>();
        this._fsMap.forEach((value: string, key: string) => {
            fsMap.set("/"+key, value);
        });

        console.dir(fsMap);
    }



    checkNewFunctionSignature(functionSignature: string): IFunction | undefined {
        let ret: IFunction = undefined;
        // search all nodes of source file
        let sf = ts.createSourceFile("aaa.ts", `class TMP {  ${functionSignature}{} }`, ts.ScriptTarget.ES5);

        let syntaxKinds = Object.keys(ts.SyntaxKind);


        sf.forEachChild(function (node: ts.Node) {
            if (node.kind == ts.SyntaxKind.ClassDeclaration) {
                var cls: ts.ClassDeclaration = <ts.ClassDeclaration>node;
                cls.forEachChild(function (m: ts.Node) {
                    let kindString = "";
                    for (let i = 0; i < syntaxKinds.length; i += 1) {
                        if (ts.SyntaxKind[syntaxKinds[i]] === m.kind) {
                            kindString = syntaxKinds[i];
                        }
                    }

                    // Logger.instance.write("Node kind " + m.kind + " " + kindString);

                    let isSetter = m.kind === ts.SyntaxKind.SetAccessor;
                    let isGetter = m.kind === ts.SyntaxKind.GetAccessor;
                    let isMethod = m.kind === ts.SyntaxKind.MethodDeclaration;
                    let name = "";
                    let return_type = "";
                    let parameters: IFunctionParam[] = [];
                    let modifiers: string[] = [];

                    if (isSetter) {
                        let setter = <ts.SetAccessorDeclaration>m;
                        name = setter.name.getText(sf);
                        parameters = getParametersFromDecl(sf, setter.parameters);
                        modifiers = getModifiers(sf, setter.modifiers);
                        if (false === modifiers.includes("set")) {
                            modifiers.push("set");
                        }
                        return_type = "";
                    }
                    if (isGetter) {
                        let getter = <ts.GetAccessorDeclaration>m;
                        name = getter.name.getText(sf);
                        parameters = [];
                        modifiers = getModifiers(sf, getter.modifiers);
                        if (false === modifiers.includes("get")) {
                            modifiers.push("get");
                        }
                        if (getter.type !== undefined) {
                            return_type = getter.type.getText(sf);
                        }
                    }

                    if (isMethod) {
                        let method = <ts.MethodDeclaration>m;
                        name = method.name.getText(sf);
                        parameters = getParametersFromDecl(sf, method.parameters);
                        modifiers = getModifiers(sf, method.modifiers);
                        if (method.type !== undefined) {
                            return_type = method.type.getText(sf);
                        }
                    }

                    ret = {
                        kind: "IFunction",
                        id: name,
                        language: "ts",
                        parameters: parameters,
                        modifiers: modifiers,
                        editable: true,
                        renamable: false,
                        deletable: true,
                        optional: false,
                        trad_id: "",
                        help_trad_id: "",
                        triggered_by: [],
                        triggers: [],
                        server_side: false,
                        return_type: return_type,
                        action_type: kFunctionType.frontend_function,
                        value: ""
                    }

                });
            }
        });
        return ret;

    }





}