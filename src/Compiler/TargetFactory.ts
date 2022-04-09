import {ISkeletScriptBundle} from "../Document/ISkeletScriptBundle";
import {ITarget} from "./ITarget";
import {ISkeletDocument} from "../Document/ISkeletDocument";
import {kTargetKind} from "./kTargetKind";
import {kFunctionType} from "./kFunctionType";
import {ISkeletScript} from "../Document/ISkeletScript";
import {LocalizedString} from "mentatjs";


export class TargetFactory {

    // create an electron bundle
    createElectronBundle(id: string, name: LocalizedString, notes: LocalizedString, frontendTarget: ITarget, serverTarget: ITarget): ITarget {

        let ret: ITarget = {
            kind: "ITarget",
            id: id,
            targetKind: kTargetKind.bundle,
            name: name.toJSON(),
            notes: notes.toJSON(),
            targetDeps: [frontendTarget.id, serverTarget.id],
            bundles: [],
            buildSteps: [],
            routes: [],
            targetOutput: "${PROJECT_OUTDIR}/${TARGET_NAME}",
            toolchain: {
                typescript: {
                    version: "",
                    advanced: {},
                    experimental: {
                        experimentalDecorators: true,
                        emitDecoratorMetadata: true
                    },
                    linterChecks: {
                        noImplicitReturns: true,
                    },
                    moduleResolution: {
                        esModuleInterop: true
                    },
                    projectOptions: {
                        target: "ES2017",
                        jsx: "react",
                        module: "ESNext",
                        declaration: true
                    },
                    sourceMaps: {

                    },
                    strictChecks: {
                        noImplicitAny: true,
                        strictNullChecks: true,
                        strictFunctionTypes: true,
                        strictPropertyInitialization: true,
                        strictBindCallApply: true,
                        noImplicitThis: true,
                        alwaysStrict: true
                    }
                }
            }
        };
        return ret;
    }



    // create a nodejs service
    static createBackEndTarget(doc: ISkeletDocument, id: string, name: LocalizedString, notes: LocalizedString): ISkeletDocument {
        let ret: ITarget = {
            kind: "ITarget",
            id: id,
            targetKind: kTargetKind.backendService,
            name: name.toJSON(),
            notes: notes.toJSON(),
            targetDeps: [],
            bundles: [],
            buildSteps: [],
            targetOutput: "${PROJECT_OUTPUTDIR}/${TARGET_NAME}",
            routes: [],
            toolchain: {
                typescript: {
                    version: "",
                    advanced: {},
                    experimental: {
                        experimentalDecorators: true,
                        emitDecoratorMetadata: true
                    },
                    linterChecks: {
                        noImplicitReturns: true,
                    },
                    moduleResolution: {
                        esModuleInterop: true
                    },
                    projectOptions: {
                        target: "ES2017",
                        module: "ESNext",
                        declaration: true
                    },
                    sourceMaps: {

                    },
                    strictChecks: {
                        noImplicitAny: true,
                        strictNullChecks: true,
                        strictFunctionTypes: true,
                        strictPropertyInitialization: true,
                        strictBindCallApply: true,
                        noImplicitThis: true,
                        alwaysStrict: true
                    }
                }
            }
        };

        // add scripts
        let scripts = doc.resources;
        let scriptBundle: ISkeletScriptBundle;
        for (let i = 0; i < doc.resources.length; i += 1) {
            if (doc.resources[i].mime === "skelet/scriptbundle") {
                scriptBundle = doc.resources[i].data as ISkeletScriptBundle;
            }
        }


        let appVC: ISkeletScript = {
            kind: "ISkeletScriptFile",
            id: "ServerApp",
            targetKind: kTargetKind.backendService,
            title: "ServerApp",
            path: "/src/",
            hiddenImportSection: "import * as restify from \"restify\";",
            classInfo: {doImplements: [], doInherits: ""},
            type: "class",
            functions: []
        }




        appVC.functions = [];
        appVC.functions.push({
            kind: "IFunction",
            id: "global",
            action_type: kFunctionType.server_global,
            optional: false,
            server_side: true,
            return_type: "void",
            parameters: [],
            modifiers: [],
            trad_id: "IBE_GLOBAL",
            help_trad_id: "IBE_GLOBAL_HELP",
            triggered_by: [""],
            triggers: [],
            value: "",
            deletable: false,
            editable: true,
            renamable: false,
            language: "ts"
        });
        appVC.functions.push({
            kind: "IFunction",
            id: "setupServer",
            action_type: kFunctionType.server_function,
            optional: false,
            server_side: false,
            return_type: "void",
            parameters: [],
            modifiers: [],
            trad_id: "IBE_SETUP",
            help_trad_id: "IBE_SETUP_HELP",
            triggered_by: ["global"],
            triggers: [],
            value: "",
            deletable: false,
            editable: true,
            renamable: false,
            language: "ts"
        });

        scriptBundle.scripts.push(appVC);


        ret.buildSteps = [];
        ret.buildSteps.push({
            id: "typescript",
            name: {
                kind: "ILocalizedString",
                id: "TRAD_TSC_COMPILE",
                fromDictionary: "general",
                languages: {}
            },
            run: "tsc"
        });

        ret.bundles = [scriptBundle.id];

        doc.projectSettings.targets.push(ret);
        return doc;
    }

    static createFrontEndTarget(doc: ISkeletDocument, id: string, name: LocalizedString, notes: LocalizedString): ISkeletDocument {
        let ret: ITarget = {
            kind: "ITarget",
            id: id,
            targetKind: kTargetKind.frontend,
            name: name.toJSON(),
            notes: notes.toJSON(),
            targetDeps: [],
            bundles: [],
            buildSteps: [],
            routes: [],
            targetOutput: "${PROJECT_OUTPUTDIR}/${TARGET_NAME}",
            toolchain: {
                typescript: {
                    version: "",
                    advanced: {},
                    experimental: {
                        experimentalDecorators: true,
                        emitDecoratorMetadata: true
                    },
                    linterChecks: {
                        noImplicitReturns: true,
                    },
                    moduleResolution: {
                        esModuleInterop: true
                    },
                    projectOptions: {
                        target: "ES2017",
                        jsx: "react",
                        module: "ESNext",
                        declaration: true
                    },
                    sourceMaps: {

                    },
                    strictChecks: {
                        noImplicitAny: true,
                        strictNullChecks: true,
                        strictFunctionTypes: true,
                        strictPropertyInitialization: true,
                        strictBindCallApply: true,
                        noImplicitThis: true,
                        alwaysStrict: true
                    }
                }
            }
        };

        // add scripts
        let scripts = doc.resources;
        let scriptBundle: ISkeletScriptBundle;
        for (let i = 0; i < doc.resources.length; i += 1) {
            if (doc.resources[i].mime === "skelet/scriptbundle") {
                scriptBundle = doc.resources[i].data as ISkeletScriptBundle;
            }
        }


        let appVC: ISkeletScript = {
            kind: "ISkeletScriptFile",
            id: "AppViewController",
            targetKind: kTargetKind.frontend,
            title: "AppViewController",
            path: "/src/",
            hiddenImportSection: "import {Application, View, ViewController, NavigationController, NavigationControllerDelegate} from \"mentatjs\";",
            classInfo: {doImplements: ["NavigationControllerDelegate"], doInherits: "Application"},
            type: "class",
            functions: []
        }


        appVC.functions = [];
        appVC.functions.push({
            kind: "IFunction",
            id: "global",
            action_type: kFunctionType.frontend_global,
            optional: false,
            server_side: false,
            return_type: "void",
            parameters: [],
            modifiers: [],
            trad_id: "IFE_GLOBAL",
            help_trad_id: "IFE_GLOBAL_HELP",
            triggered_by: [""],
            triggers: [],
            value: "",
            deletable: false,
            editable: true,
            renamable: false,
            language: "ts"
        });
        appVC.functions.push({
            kind: "IFunction",
            id: "applicationWillStart",
            action_type: kFunctionType.frontend_init,
            optional: false,
            server_side: false,
            return_type: "void",
            parameters: [],
            modifiers: [],
            trad_id: "IFE_INIT",
            help_trad_id: "IFE_INIT_HELP",
            triggered_by: ["global"],
            triggers: [],
            value: "",
            deletable: false,
            editable: true,
            renamable: false,
            language: "ts"
        });

        scriptBundle.scripts.push(appVC);


        ret.buildSteps = [];
        ret.buildSteps.push({
            id: "typescript",
            name: {
                kind: "ILocalizedString",
                id: "TRAD_TSC_COMPILE",
                fromDictionary: "general",
                languages: {}
            },
            run: "tsc"
        });

        doc.projectSettings.targets.push(ret);
        return doc;
    }



}
