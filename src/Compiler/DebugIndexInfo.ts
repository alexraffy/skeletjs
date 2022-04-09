


export interface DebugIndexInfo {
    debugKind: "body" | "classDecl" | "variableDecl" | "functionDecl" | "functionLine";
    lineIndex: number;
    charIndex: number;
    bundleId: string;
    scriptId: string;
    functionId?: string;
    targetIndex: number;
}
