import {kTargetKind} from "./kTargetKind";
import {ILocalizedString} from "mentatjs";
import {IBuildStep} from "./IBuildStep";
import {IRoute} from "../Document/IRoute";


export interface ITarget {
    kind: "ITarget";
    id: string;
    targetKind: kTargetKind;
    name: ILocalizedString;
    notes: ILocalizedString;
    targetOutput: string;
    targetDeps: string[];
    bundles: string[];
    //files: ITargetFile[];
    buildSteps: IBuildStep[];
    routes: IRoute[];
    toolchain: {
        typescript: {
            version: string;
            strictChecks: {
                alwaysStrict?: boolean;
                noImplicitAny?: boolean;
                noImplicitThis?: boolean;
                strict?: boolean;
                strictBindCallApply?: boolean;
                strictFunctionTypes?: boolean;
                strictNullChecks?: boolean;
                strictPropertyInitialization?: boolean;
            };
            linterChecks: {
                noFallthroughCasesInSwitch?: boolean;
                noImplicitReturns?: boolean;
                noPropertyAccessFromIndexSignature?: boolean;
                noUncheckedIndexedAccess?: boolean;
                noUnusedLocals?: boolean;
                noUnusedParameters?: boolean;
            };
            advanced: {
                allowUnreachableCode?: boolean;
                allowUnusedLabels?: boolean;
                assumeChangesOnlyAffectDirectDependencies?: boolean;
                charset?: string;
                declarationDir?: string;
                diagnostics?: boolean;
                disableReferenceProjectLoad?: boolean;
                disableSizeLimit?: boolean;
                disableSolutionSearching?: boolean;
                disableSourceOfProjectReferenceRedirect?: boolean;
                emitBOM?: boolean;
                emitDeclarationOnly?: boolean;
                explainFiles?: boolean;
                extendedDiagnostics?: boolean;
                forceConsistentCasingInFileNames?: boolean;
                generateCpuProfile?: boolean;
                importsNotUsedAsValues?: "remove" | "preserve" | "error";
                jsxFactory?: string;
                jsxFragmentFactory?: string;
                jsxImportSource?: string;
                keyofStringsOnly?: boolean;
                listEmittedFiles?: boolean;
                listFiles?: boolean;
                maxNodeModuleJsDepth?: number;
                newLine?: string;
                noEmitHelpers?: boolean;
                noEmitOnError?: boolean;
                noErrorTruncation?: boolean;
                noImplicitUseStrict?: boolean;
                noLib?: boolean;
                noResolve?: boolean;
                noStrictGenericChecks?: boolean;
                preserveConstEnums?: boolean;
                reactNamespace?: string;
                resolveJsonModule?: boolean;
                skipDefaultLibCheck?: boolean;
                skipLibCheck?: boolean;
                stripInternal?: boolean;
                suppressExcessPropertyErrors?: boolean;
                suppressImplicitAnyIndexErrors?: boolean;
                traceResolution?: boolean;
                useDefineForClassFields?: boolean;
                preserveWatchOutput?: boolean;
                pretty?: boolean;
            };
            projectOptions: {
                allowJS?: boolean;
                checkJs?: boolean;
                composite?: boolean;
                declaration?: boolean;
                declarationMap?: boolean;
                downlevelIteration?: boolean;
                importHelpers?: boolean;
                incremental?: boolean;
                isolatedModules?: boolean;
                jsx?: 'react' | 'react-jsx' | 'react-jsxdev' | 'preserve' | 'react-native';
                lib?: string[];
                module?: string;
                noEmit?: boolean;
                removeComments?: boolean;
                sourceMap?: boolean;
                target?: string;
                tsBuildInfoFile?: boolean;
            };
            moduleResolution: {
                allowSyntheticDefaultImports?: boolean;
                allowUmdGlobalAccess?: boolean;
                baseUrl?: string;
                esModuleInterop?: boolean;
                moduleResolution?: "node" | "classic";
                paths?: { [key:string]: string[] };
                preserveSymlinks?: boolean;
                rootDirs?: string[];
                typeRoots?: string[];
                types?: string[];
            };
            sourceMaps: {
                inlineSourceMap?: boolean;
                inlineSources?: boolean;
                mapRoot?: string;
                sourceRoot?: string;
            }
            experimental: {
                emitDecoratorMetadata?: boolean;
                experimentalDecorators?: boolean;
            }
        };

    }
}
