import {Session} from "./Session";
import {LayerData} from "../Layer/LayerData";
import {IWSRSnapshotReadRequest, WSRSnapshotRead} from "../Environment/ServerCommands";
import {isDefined} from "mentatjs";
import {SkeletWebSocket} from "../Environment/SkeletWebSocket";
import {Layer} from "../Layer/Layer";


export function setTitle(title: string, saveNeeded: boolean) {
    Session.instance.currentTitle = title;
    let t = "Skelet - ";
    t += title;
    if (saveNeeded === true) {
        t += " *";
    }
    (window as any).document.title = t;
}



export interface HistorySnapshotGroup {
    workspace_guid: string;
    snapshots: HistorySnapshot[]
}


export interface HistorySnapshot {
    id: string;
    time: number;
    title: string;
    document_guid: string;
    workspace_guid: string;
}


/*
export function compressSnapshot() {
    let json_str = JSON.stringify(Session.instance.CurrentWorkspace.data, function (key, value) {
        if (typeof value === "function") {
            if (key === "viewFactory") {
                return value.toString();
            }
        }
        return value;
    });
    let compressed = LZString.compress(json_str);
    if (Logging.enableLogging === true) {
        SkLogger.write("snapshot (" + json_str.length + " - " + compressed.length + ")");
    }
    return compressed;
}
*/


export function generateLayerTree(layers: LayerData[]): Layer {
    let containerView: Layer = undefined;
    let parentLayer: Layer = undefined;
    let orphaned: Layer[] = [];


    for (let i = 0; i < layers.length; i += 1) {
        let l = new Layer(layers[i]);
        if (i === 0 && l.special_id !== "workspace.views") {
            throw "First layer in a snapshot must be a group container";
        } else if (i === 0 && l.special_id === "workspace.views") {
            containerView = l;
            parentLayer = l;
        } else {
            parentLayer = containerView.find(l.parent_id);
            if (!isDefined(parentLayer)) {
                orphaned.push(l)
            } else {
                parentLayer.adopt(l);
                if (parentLayer.id === containerView.id) {
                    l.setPage();
                }
            }

        }
    }
    if (orphaned.length > 0) {
        console.warn("Orphaned Layers:");
        console.warn(orphaned);
    }
    return containerView;
}




export function restoreHistory(snapshot: HistorySnapshot) {

    SkeletWebSocket.instance.send(WSRSnapshotRead, {
        snapshotInfo: snapshot
    } as IWSRSnapshotReadRequest)


    //Session.instance.currentDocument.currentWorkspace.layersTree = generateLayerTree(json.rows);
    //clearAllSelection();
    //Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
    //Application.instance.notifyAll({}, "noticeNodeSelected", null);
}