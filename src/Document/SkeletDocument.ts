import {instanceOfISkeletDocument} from "../Guards/instanceOfISkeletDocument";
import {ISkeletDocument} from "./ISkeletDocument";
import {
    assert,
    DictionaryLocalizedString, generateV4UUID,
    instanceOfIDictionaryLocalizedString,
    isDefined, LayerProperty,
    LocalizedString
} from "mentatjs";
import {HistorySnapshot, HistorySnapshotGroup} from "../Session/history";
import {SkeletResource} from "./SkeletResource";
import {ProjectSettings} from "./ProjectSettings";
import {ColorBookInfo} from "../Loader/ColorPalette/ColorBookInfo";
import {SkeletScriptBundle} from "./SkeletScriptBundle";
import {ISkeletScriptBundle} from "./ISkeletScriptBundle";

import {Workspace} from "./Workspace";
import {LayerData} from "../Layer/LayerData";
import {IWSRSnapshotWriteRequest, WSRSnapshotWrite} from "../Environment/ServerCommands";
import {SkeletWebSocket} from "../Environment/SkeletWebSocket";
import {WorkspaceData} from "./WorkspaceData";
import {ISkeletResource} from "./ISkeletResource";
import {instanceOfLayerData} from "../Guards/instanceOfLayerData";
import {Layer} from "../Layer/Layer";
import {LayerSymbolProperty} from "../Layer/LayerSymbolProperty";
import {ITarget} from "../Compiler/ITarget";


export class SkeletDocument {

    private data: ISkeletDocument;
    private _intlString: DictionaryLocalizedString;
    //workspaces: Workspace[];
    snapshots: HistorySnapshotGroup[] = [];
    resources: SkeletResource[] = [];

    get version(): string {
        return this.data.version;
    }
    get loaded(): boolean {
        return this.data.loaded;
    }
    get fontsUsed(): string[] {
        return this.data.fontsUsed;
    }
    get notifications(): {message: LocalizedString, action: {code: string, title: LocalizedString, param: any}[]}[] {
        return this.data.notifications;
    }
    get projectSettings(): ProjectSettings {
        return this.data.projectSettings;
    }
    get swatches(): SkeletResource[] {
        let ret: SkeletResource[] = [];
        for (let i = 0; i < this.resources.length; i ++) {
            if (this.resources[i].mime === "skelet/colorbookinfo") {
                ret.push(this.resources[i]);
            }
        }
        return ret;
    }

    get currentOpenedFileID(): string {
        return this.data.editing_file;
    }
    set currentOpenedFileID(value: string) {
        this.data.editing_file = value;
    }


    get currentOpenedFileIsWorkspace(): boolean {
        for (let i = 0; i < this.files.length; i += 1) {
            if (this.files[i].id === this.currentOpenedFileID) {
                if (this.files[i].mime === "skelet/workspace") {
                    return true;
                }
            }
        }
        return false;
    }
    get currentOpenedFileMime(): string {
        for (let i = 0; i < this.files.length; i += 1) {
            if (this.files[i].id === this.currentOpenedFileID) {
                return this.files[i].mime;
            }
        }
        return "";
    }

    findResourceWithId(id: string): SkeletResource {
        for (let i = 0; i < this.resources.length; i += 1) {
            if (this.resources[i].id === id ) {
                return this.resources[i];
            }
        }
        return undefined;
    }

    getAssetsResourcesList(): SkeletResource[] {
        let ret: SkeletResource[] = [];
        let skipMimeTypes = ["skelet/projectsettings", "skelet/scriptbundle", "skelet/dictionary", "skelet/palette", "skelet/workspace", "skelet/deps"];
        for (let i = 0; i < this.resources.length; i ++) {
            if (skipMimeTypes.includes(this.resources[i].mime)) {
                continue;
            }
            ret.push(this.resources[i]);
        }
        return ret;
    }

    get files(): SkeletResource[] {
        return this.resources;
    }

    get scriptBundles(): SkeletScriptBundle[] {
        let ret = [];
        this.resources.forEach((r) => {
            if (r.mime === "skelet/scriptbundle") {
                ret.push( SkeletScriptBundle.fromStruct(r.data as ISkeletScriptBundle));
            }
        });

        return ret;
    }

    getBundle( id: string ): SkeletScriptBundle | undefined {
        for (let i = 0; i < this.resources.length; i += 1) {
            if ((this.resources[i].mime === "skelet/scriptbundle") && (this.resources[i].data as ISkeletScriptBundle).id === id) {
                return SkeletScriptBundle.fromStruct(this.resources[i].data as ISkeletScriptBundle);
            }
        }
        return undefined;
    }


    get targets(): ITarget[] {
        return this.data.projectSettings.targets;
    }

    get intlStrings(): DictionaryLocalizedString {
        if (isDefined(this._intlString)) {
            return this._intlString;
        }
        this._intlString = DictionaryLocalizedString.fromStruct(this.data.intlStrings);
        return this._intlString;
    }

    constructor(flatDoc: ISkeletDocument) {
        assert(instanceOfISkeletDocument(flatDoc), "SkeletDocument expects a ISkeletDocument as parameter.");
        this.data = flatDoc;
        this.snapshots = [];
        for (let i = 0; i < this.data.resources.length; i += 1) {
            let sr = SkeletResource.fromStruct(this.data.resources[i]);
            this.resources.push(sr);
            if (this.data.resources[i].mime === "skelet/workspace") {
                this.snapshots.push({
                    workspace_guid: this.data.resources[i].id,
                    snapshots: []
                });
            }

        }

        if (isDefined(flatDoc.intlStrings) && instanceOfIDictionaryLocalizedString(flatDoc.intlStrings)) {
            this._intlString = DictionaryLocalizedString.fromStruct(flatDoc.intlStrings)
        } else {
            this._intlString = new DictionaryLocalizedString("intlString", []);
        }
    }

    get currentWorkspace(): Workspace {
        if (this.resources.length === 0) {
            return undefined;
        }
        if (this.currentOpenedFileIsWorkspace === false) {
            return undefined;
        }
        return this.files.find((f: SkeletResource) => { return f.id === this.currentOpenedFileID;}).data as Workspace;
    }

    takeSnapshot(title: string) {
        let snap: HistorySnapshot = {
            id: generateV4UUID(),
            document_guid: this.projectSettings.project_guid,
            workspace_guid: this.currentOpenedFileID,
            time: + new Date(),
            title: title
        };
        let data :LayerData[] = this.currentWorkspace.layersTree.flatten();
        let content = JSON.stringify(data);
        SkeletWebSocket.instance.send(WSRSnapshotWrite, {
            snapshotInfo: snap,
            content: content
        } as IWSRSnapshotWriteRequest)

    }

    snapshotsListForCurrentWorkspace(): HistorySnapshot[] {
        if (isDefined(this.currentWorkspace)) {
            let group = this.snapshots.find((group) => {
                return group.workspace_guid === this.currentOpenedFileID;
            });
            if (isDefined(group)) {
                return group.snapshots;
            }
        }
        return [];
    }

    addWorkspace(workspace_guid: string, title: string): Workspace {
        let wd = new WorkspaceData();
        wd.workspace_guid = workspace_guid;
        wd.title = title;
        wd.layers = [new LayerData("Views", "group", null)];
        wd.layers[0].special_id = "workspace.views";
        let newResource: ISkeletResource = {
            kind: "ISkeletResource",
            id: workspace_guid,
            mime: "skelet/workspace",
            data: wd,
            compileOptions: {
                compile: false
            },
            includeInResources: false,
            last_modified: (+ new Date()).toString(),
            stringData: "",
            title: title
        };
        this.data.resources.push(newResource);
        let sr = SkeletResource.fromStruct(newResource);
        this.resources.push(sr);
        this.snapshots.push({
            workspace_guid: wd.workspace_guid,
            snapshots: []
        });
        return sr.data as Workspace;
    }

    addWorkspaceWithLayers(workspace_guid: string, title: string, layers: LayerData[]): Workspace {
        assert(isDefined(layers) && Array.isArray(layers) &&
            layers.every((l) => { return instanceOfLayerData(l);}), "SkeletDocument.addWorkspaceWithLayers expects an array of LayerData.");

        let wd = new WorkspaceData();
        wd.workspace_guid = workspace_guid;
        wd.title = title;
        wd.layers = layers;
        let newResource: ISkeletResource = {
            kind: "ISkeletResource",
            id: workspace_guid,
            mime: "skelet/workspace",
            data: wd,
            compileOptions: {
                compile: false
            },
            includeInResources: false,
            last_modified: (+ new Date()).toString(),
            stringData: "",
            title: title
        };
        this.data.resources.push(newResource);
        let sr = SkeletResource.fromStruct(newResource);
        this.resources.push(sr);
        this.snapshots.push({
            workspace_guid: wd.workspace_guid,
            snapshots: []
        });
        return sr.data as Workspace;
    }


    selectCurrentWorkspace(workspace_guid: string) {
        // TODO
        this.currentOpenedFileID = workspace_guid;

    }
    selectNextWorkspace() {
        // TODO
    }
    selectPreviousWorkspace() {
        // TODO
    }
    deleteCurrentWorkspace() {
        // TODO
    }

    deleteLayer(layer_id: string, onWorkspaceGuid: string): {
        deletedLayers: {layer_id: string, workspace_guid: string}[],
        addedLayers: {layer_id: string, workspace_guid: string}[]
        parentsLayers: {layer_id: string, workspace_guid: string}[]
    } {
        let ret = {
            deletedLayers: [],
            addedLayers: [],
            parentsLayers: []
        };
        let symbols: Layer[];
        for (let i = 0; i < this.resources.length; i += 1) {
            let res = this.resources[i];
            if (res.mime === "skelet/workspace") {
                continue;
            }
            let w = res.data as Workspace;
            if (w.workspace_guid === onWorkspaceGuid) {
                let layer = w.layersTree.find(layer_id);
                if (isDefined(layer)) {
                    let findSymbols = (symbols: Layer[], layerBase: Layer) => {
                        if (layerBase.isSymbol === true) {
                            symbols.push(layerBase);
                        }
                        for (let x = 0; x < layerBase.children.length; x += 1) {
                            findSymbols(symbols, layerBase.children[x]);
                        }
                    }
                    findSymbols(symbols, layer);
                    if (symbols.length > 0) {
                        for (let s = 0; s < symbols.length; s += 1) {
                            let sy = symbols[s];
                            // find all instances of the symbol
                            let walk = function (workspace_guid: string, parentLayer: Layer, base: Layer, symbol: Layer) {
                                if (base.isSymbolInstance && base.symbolID === symbol.id) {
                                    let copyOfSymbol = symbol.parentLayer.duplicateChild(symbol);

                                    base.symbol_properties.forEach( (symbolProp: LayerSymbolProperty) => {
                                        let subLayer = copyOfSymbol.find(symbolProp.symbol_node_id);
                                        if (isDefined(subLayer)) {

                                            base.properties.forEach( (prop: LayerProperty) => {
                                                subLayer.setPropertyValue(prop.property_id, prop.value);
                                            });
                                        }
                                    });
                                    ret.addedLayers.push({
                                        layer_id: copyOfSymbol.id,
                                        workspace_guid: workspace_guid,
                                    });
                                    ret.deletedLayers.push({
                                        layer_id: base.id,
                                        workspace_guid: workspace_guid
                                    });
                                    ret.parentsLayers.push({
                                        layer_id: base.parentLayer.id,
                                        workspace_guid: workspace_guid
                                    });
                                    let parent = base.parentLayer;
                                    parent.adopt(copyOfSymbol);
                                    parent.removeChild(base);

                                } else {
                                    for (let child_index = 0; child_index < base.children.length; child_index += 1) {
                                        walk(workspace_guid, base, base.children[child_index], symbol);
                                    }
                                }
                            }
                            this.resources.forEach( (r: SkeletResource) => {
                                if (r.mime === "skelet/workspace") {
                                    let w2 = r.data as Workspace;
                                    w2.layersTree.children.forEach((w2child: Layer) => {
                                        walk(w2.workspace_guid, w2.layersTree, w2child, sy);
                                    });
                                }
                            });
                        }
                        if (isDefined(layer)) {
                            ret.deletedLayers.push({layer_id: layer.id, workspace_guid: w.workspace_guid});
                            ret.parentsLayers.push({layer_id: layer.parentLayer.id, workspace_guid: w.workspace_guid});
                            layer.parentLayer.removeChild(layer);
                        }
                    }

                }
                break;
            }
        }

        return ret;
    }


    createNewBundle(title: string): SkeletScriptBundle {
        let res: ISkeletResource = {
            kind: "ISkeletResource",
            id: title,
            title: title,
            last_modified: new Date().toISOString(),
            includeInResources: true,
            stringData: "",
            mime: "skelet/scriptbundle",
            compileOptions: {
                compile: true
            },
            data: {
                kind: "ISkeletScriptBundle",
                id: title,
                title: title,
                scripts: []
            } as ISkeletScriptBundle
        }
        let resource = SkeletResource.fromStruct(res);
        this.resources.push(resource);
        return SkeletScriptBundle.fromStruct(resource.data as ISkeletScriptBundle);
    }





}
