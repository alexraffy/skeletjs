import {ColorBookInfo} from "../Loader/ColorPalette/ColorBookInfo";
import {FontInfo} from "../Loader/Font/FontInfo";
import {IDictionaryLocalizedString, LayerProperty} from "mentatjs";
import {IFunction} from "../Compiler/IFunction";
import {IShortcutsConfig} from "../Shortcuts/checks";
import {HistorySnapshot} from "../Session/history";
import {ISkeletDocument} from "../Document/ISkeletDocument";
import {LayerData} from "../Layer/LayerData";
import {kBackgroundTaskStatus} from "./kBackgroundTaskStatus";
import {kBackgroundTaskType} from "./kBackgroundTaskType";
import {IAuthSession} from "../Session/IAuthSession";


export var ServerRequestURI_BaseURI: string = "https://skelet.app";


// AUTH
export const ServerRequestURI_Auth: string = "/api/v1/auth";
export interface IServerRequest_Auth {
    email: string;
    password: string;
}
export interface IServerResponse_Auth {
    valid: boolean,
    token?: string;
    user_guid?: string;
    persistent_token?: string;
    persistent_token_expiration?: string;
    user_salutation?: string;
    account_name?: string;
}

// DOCUMENT
export const ServerRequestURI_Document: string = "/api/v1/document";
export interface IServerRequest_Document {
    document_short: string;
    title: string;
    isPrivate: boolean;
}
export interface IServerResponse_Document {
    document_guid: string;
    session_token: string;
    document_short: string;
    title: string;
    private: boolean;
}

export const ServerRequestURI_DocumentWorker: string = "/api/v1/documentWorker";
export interface IServerRequest_DocumentWorker {
    token: string;
    session_token: string;
}
export interface IServerResponse_DocumentWorker {
    websocket_address: string;
    websocket_port: number;

}



// SETTINGS

export const ServerRequestURI_Settings: string = "/api/v1/settings";
export interface IServerResponse_Settings {
    system: {id: string, [key:string]:any}[],
    custom: {id: string, [key:string]:any}[]
}
export const ServerRequestURI_WriteSettings: string = "/api/v1/writeSettings";
export interface IServerRequest_WriteSettings {
    settings: {
        system: { id: string, [key: string]: any }[],
        custom: { id: string, [key: string]: any }[]
    }
}
export interface IServerResponse_WriteSettings {
    system: {id: string, [key:string]:any}[],
    custom: {id: string, [key:string]:any}[]
}


// PLUGINS

export interface IServerPlugin {
    skeletPluginStoreID: string;
    name: string;
    description: string;
    author: string;
    link: string;
    email: string;
    folder: string;
    files: {path: string; mime: string, content: string | ArrayBuffer }[];
    dependencies: string[];
    enabled: boolean;
}





export interface INPMEntry {
    title: string;
    version: string;
    resolved?: string;
}






export const ServerRequestURI_FileDownload: string = "/api/v1/fileDownload";
export interface IServerRequestURI_FileDownloadRequest {
    sessionId: string;
    fileRequested: string;
}


export const ServerRequestURI_FileUpload: string = "/api/v1/fileUpload";




export const ServerRequestURI_LangDict: string = "/api/v1/langDictionary";
export type IServerResponse_LangDict = IDictionaryLocalizedString;

export const ServerRequestURI_TradDict: string = "/api/v1/tradDictionary";
export type IServerResponse_TradDict = IDictionaryLocalizedString;


export const ServerRequestURI_NewDocument: string = "/apì/v1/newDocument";
export interface IServerRequest_NewDocument {
    user: IAuthSession;
}
export interface IServerResponse_NewDocument {
    document_short: string;
}




//// WEB SOCKET MESSAGES
export const WSRAuthenticatePlease: string = "WSRAuthenticatePlease";
export interface IWSRAuthenticatePleaseResponse {
    id: number;
}
export const WSRAuthenticate: string = "WSRAuthenticate";
export interface IWSRAuthenticateRequest {
    id: number;
    info: IAuthSession;
}
export interface IWSRAuthenticateResponse {
    con_id: number;
}



export const WSRDocument: string = "WSRDocument";
export interface IWSRDocumentRequest {

}
export interface IWSRDocumentResponse {
    document: ISkeletDocument
}

// PLUGINS

export const WSRPlugins: string = "WSRPlugins";
export interface IWSRPluginsResponse {
    librairies: IServerPlugin[]
}


export const WSRPluginToggle: string = "WSRPluginToggle";
export interface IWSRPluginToggleRequest {
    pluginId: string;
    enabled: boolean;
}




// SWATCHES
export const WSRSwatches: string = "WSRSwatches";
export interface IServerSwatch {
    id: string;
    text: string;
    isReadonly: boolean;
    isUser: boolean;
    isDocument: boolean;
}
export interface IWSRSwatchesResponse {
    swatches: IServerSwatch[];
}
export const WSRSwatchInfo: string = "WSRSwatchInfo";
export interface IWSRSwatchInfoRequest {
    path: string;
}
export interface IWSRSwatchInfoResponse {
    info: ColorBookInfo;
}


// FONTS
export const WSRFonts: string = "WSRFonts";
export interface IWSRFontsRequest {
    id: number;
}
export interface IWSRFontsResponse {
    fonts: ArrayBuffer;
}
export const WSRFontsFavourites: string = "WSRFontsFavourites";
export interface IWSRFontsFavouritesRequest {
    id: number;
}
export interface IWSRFontsFavouritesResponse {
    favourites: string[]
}

// NPM

export const WSRNPMAgent: string = "WSRNPMAgent";
export interface IWSRNPMAgentResponse {
    id: number;
    agent: string;
}


export const WSRNPMList: string = "WSRNPMList";
export interface IWSRNPMListRequest {
    id: number;
}
export interface IWSRNPMListResponse {
    rows: INPMEntry[]
}


export const WSRNPMInstall: string = "WSRNPMInstall";
export interface IWSRNPMInstallRequest {
    id: number;
    module: string
}
export interface IWSRNPMInstallResponse {

}

export const WSRNPMUninstall: string = "WSRNPMUninstall";
export interface IWSRNPMUninstallRequest {
    id: number;
    module: string
}
export interface IWSRNPMUninstallResponse {

}



export const WSRClipboardFormats: string = "WSRClipboardFormats";
export interface IWSRClipboardFormatsResponse {
    formats: {text: string, mime: string}[];
}

export const WSRClipboardWrite: string = "WSRClipboardWrite";
export interface IWSRClipboardWriteRequest {
    id: number;
    type: "selection" | "clipboard";
    content: string;
}


export const WSRPaths: string = "WSRPaths";
export interface IWSRPathsResponse {
    id: number;
    pathAppData: string;
    pathSwatches: string;
    pathPlugins: string;
    pathNodeModules: string;
    pathFontCache: string;
    pathLibraryCache: string;
    pathTemp: string;
}


export const WSRGetTypescriptLibs: string = "WSRGetTypescriptLibs";
export interface IWSRGetTypescriptLibsRequest {
    id: number;
    target: number;
}
export interface IWSRGetTypescriptLibsResponse {
    target: number;
    files: {file: string, data: string}[];
}





// MAIN WINDOW

export const WSRSetWindowId: string = "setWindowId";
export interface IWSRSetWindowIdResponse {
    id: number;
    open: string;
    filename?: string;
}

export const WSRCloseApplication: string = "skelet.close";
export const WSROpenLink: string = "skelet.openWeb";
export interface IWSROpenLink {
    link: string;
}
export const WSRShowPreviewRequest: string = 'skelet.showPreview';
export const WSRShowExportRequest: string = 'skelet.showExport';
export const WSRWindowReady: string = 'skelet.WindowReadyNow';
export const WSRNewEditorRequest: string = 'windowManager.newFile';
export const WSRShortcut: string = "shortcut";
export interface IWSRShortcut {
    event: string;
}

export const WSRMenuRefresh: string = "menu.view.workspaces.refresh";
export interface IWSRMenuRefresh {
    id: number;
    modified: boolean;
    inLayoutEditor: boolean;
    workspaces: {
        workspace_guid: string;
        title: string;
    }[];
    current_workspace: string;
    documents: {
        document_guid: string;
        title: string;
    }[];
    current_document: string;
    selectedItems: {
        type: string;
        hasTextStyle: boolean;
        textStyle: LayerProperty;
    }[]
}

export const WSRShowOpenDialog: string = "skelet.showOpenDialog";
export interface IWSRShowOpenDialogRequest {
    title: string;
    filters: {
        name:string;
        extensions:string[]}[];
    defaultPath?: string;
    properties?: ("openFile" | "openDirectory" | "multiSelections" |
        "showHiddenFiles" | "createDirectory" | "promptToCreate" |
        "noResolveAliases" | "treatPackageAsDirectory" | "dontAddToRecent")[];
    // Message to display above input boxes. MACOS
    message?: string;
    securityScopedBookmarks?: boolean;
    buttonLabel?: string;
}
export const WSRShowOpenDialogResponse: string = "skelet.showOpenDialog.result";
export interface IWSRShowOpenDialogResponse {
    filename: string;
    length: number;
    fileToRequest: string;
}

export const WSRShortcutsList: string = "skelet.shortcuts.list";
export const WSRShortcutsListResponse: string = "skelet.shortcuts.list.response";
export interface IWSRShortcutsListResponse {
    data: IShortcutsConfig;
}





// BACKGROUND TASK

export const WSRBackgroundTaskTick: string = "WSRBackgroundTaskTick";
export interface IWSRBackgroundTaskTick {
    taskId: string;
    taskType: kBackgroundTaskType;
    title: string
    message: string;
    current: number;
    max: number;
    status: kBackgroundTaskStatus;
    result: any;
}

export const WSRBackgroundTaskUpdateFromClient : string = "BackgroundTask.updateTaskFromBrowser";
export interface IWSRBackgroundTaskUpdateFromClientRequest {
    id: number;
    status: kBackgroundTaskStatus;
    taskType: kBackgroundTaskType;
    current: number;
    max: number;
    title: string;
    message: string;
}

export const WSRBackgroundTaskLaunchFromClient: string = "WSRBackgroundTaskLaunchFromClient";
export interface IWSRBackgroundTaskLaunchFromClientRequest {
    id: number;
    taskId: "TypescriptAvailableVersions" | "TypescriptInstall"
    stringParam1: string;
}


// CAPTURE SCREEN

export const WSRCloseCacheLibraryWindow: string = 'cacheLibrary.close';

export const WSRCaptureCacheRequestMessage: string = "WSRCaptureCacheRequestMessage";
export interface IWSRCaptureCacheRequestMessage {
    id: number;
    folder: string;
    filename: string;
}
export const WSRCaptureCacheResponseMessage = "WSRCaptureCacheResponseMessage";

// TRANSFER DATA

export const WSRWorkspaceDataRequest = "skelet.noticeRequestWorkspaceData";
export interface IWSRWorkspaceDataRequest {
    id: number;
    requestingWindowId?: number;
    dataRequested: string[];
}
export const WSRWorkspaceDataResponse = "skelet.noticeRequestWorkspaceDataResponse";
export interface IWSRWorkspaceDataResponse {
    id: number;
    dataRequested: string[];
    requestingWindowId: number;
    data: LayerData[];
}

export const WSRPreviewDataRequest = "skelet.noticePreviewUpdateRequested";
export interface IWSRPreviewDataRequest {
    id: number;
    previewWindowId?: number;
}
export const WSRPreviewDataResponse = "skelet.noticePreviewUpdate";
export interface IWSRPreviewDataResponse {
    id: number;
    previewWindowId: number;
    pages: LayerData[];
}

// RECENT DOCUMENTS

export const WSRRecentRequest = 'welcome.recents.request';
export const WSRRecentResponse = "welcome.recents.response";
export interface IWSRRecentResponse {
    id: number;
    rows: {
        id: string;
        title: string;
        path: string;
        lastModified: string;
        thumbnailB64: string;
    }[]
}

export const WSRecentAdd = "welcome.recents.add";
export interface IWSRRecentAdd {
    id: number;
    filename: string;
    thumbnailB64: string;
}

// FONTS

export const WSRFontGlyphInfoRequest = "fonts.glyphInfo";
export const WSRFontGlyphInfoResponse = 'fonts.glyphInfo.result';
export interface IWSRFontGlyphInfoRequest {
    id: number;
    postscriptName: string;
    path: string;
}
export interface IWSRFontGlyphInfoResponse {
    id: number;
    postscriptName: string;
    path: string;
    valid: boolean;
    rows: {id: string, name: string}[]
}

export const WSRFontSetFav: string = "fonts.setfav";
export interface IWSRFontSetFavRequest {
    id: number;
    font: string;
    set: boolean
};


// SNAPSHOT
export const WSRSnapshotWrite = "snapshot.write";
export interface IWSRSnapshotWriteRequest {
    snapshotInfo: HistorySnapshot;
    content: string;
}
export const WSRSnapshotWriteResponse = "snapshot.write.response";
export interface IWSRSnapshotWriteResponse {
    valid: boolean;
    snapshotInfo: HistorySnapshot
}

export const WSRSnapshotRead = "snapshot.read";
export interface IWSRSnapshotReadRequest {
    snapshotInfo: HistorySnapshot
}
export const WSRSnapshotReadResponse = "snapshot.read.response";
export interface IWSRSnapshotReadResponse {
    valid: boolean;
    snapshotInfo: HistorySnapshot;
    content: string;
}


export const WSRLanguageServiceRequest = "WSRLanguageServiceRequest";
export interface IWSRLanguageServiceRequest {
    message: LSBasicMessage;
}
export const WSRLanguageServiceResponse = "WSRLanguageServiceResponse";
export interface IWSRLanguageServiceResponse {
    message: LSBasicResponse;
}

export const WSRLogger = "WSRLogger";
export interface IWSRLoggerRequest {
    message: string
}



export enum LSCommands {
    Error = "LSError",
    Open = "Open",
    TypescriptCheckNewFunctionSignature = "LSTypescriptCheckNewFunctionSignature"
}

export interface LSBasicMessage {
    seq: number;
    type: "request";
    identifier: string;
    command: LSCommands;
    arguments?: any
    id: number;
}

export interface LSBasicResponse {
    seq: number;
    type: "response" | "event",
    command?: LSCommands;
    request_seq?: number;
    identifier: string;
    success?: boolean;
    message?:string;
    event?: string;
    body?: any;
    id: number;
}

export interface LSCheckNewFunctionSignatureRequest extends LSBasicMessage {
    arguments: {
        fn: string;
    }
}

export interface LSCheckNewFunctionSignatureResponse extends LSBasicResponse {
    body: IFunction
}



export const WorkerResponse_LoadingProgress = "WorkerResponse_LoadingProgress";
export interface IWorkerResponse_LoadingProgress {
    kind: typeof WorkerResponse_LoadingProgress;
    value: number;
}

export const WorkerRequest_EnvironmentSet = "WorkerRequest_EnvironmentSet";
export interface IWorkerRequest_EnvironmentSet {
    kind: typeof WorkerRequest_EnvironmentSet;
}


export const WorkerRequest_LoadProject = "WorkerRequest_LoadProject";
export interface IWorkerRequest_LoadProject {
    kind: typeof WorkerRequest_LoadProject;
    data: Uint8Array;
}

export const WorkerResponse_LoadProject = "WorkerResponse_LoadProject";
export interface IWorkerResponse_LoadProject {
    kind: typeof WorkerRequest_LoadProject;
    data: ISkeletDocument;
}

