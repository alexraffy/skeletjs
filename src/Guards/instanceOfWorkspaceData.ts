import {WorkspaceData} from "../Document/WorkspaceData";


export function instanceOfWorkspaceData(object: any): object is WorkspaceData {
    return object.kind === "WorkspaceData";
}

