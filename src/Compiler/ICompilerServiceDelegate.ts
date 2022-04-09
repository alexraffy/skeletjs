import {ICompilationResult} from "./ICompilationResult";

export interface ICompilerServiceDelegate {
    compilationStep(step: string, data: ICompilationResult[]);
}
