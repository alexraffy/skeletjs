import {generateV4UUID, isDefined, LocalizedString} from "mentatjs";
import {GUIThemeDark} from "../Theme/GUIThemeDark";
import {IPropertyPanelTextStyleHandler} from "../Palettes/PanelTextStylePropertyHandler";
import {FloatingWindow} from "../Windows/FloatingWindow";
import {ViewCanvas} from "../Canvas/ViewCanvas";
import {IDockInfo} from "../Palettes/IDockInfo";
import {SkeletDocument} from "../Document/SkeletDocument";
import {GUITheme} from "../Theme/GUITheme";
import {CustomPropertyType} from "../Environment/CustomPropertyType";
import {SkeletEnvironment} from "../Environment/SkeletEnvironment";
import {IWindowInfo} from "../Palettes/IWindowInfo";
import {IAuthSession} from "./IAuthSession";


declare var global;

export class Session {

    static _instance: Session = null;

    static get instance(): Session {
        if (isDefined(global)) {
            if (isDefined(global["skeletSession"])) {
                return global["skeletSession"];
            } else {
                return new Session();
            }
        } else {
            if (isDefined(window["skeletSession"])) {
                return window["skeletSession"];
            } else {
                return new Session();
            }
        }
    }

    constructor() {
        if (Session._instance === null) {
            Session._instance = this;
        }
        if (isDefined(global)) {
            global["skeletSession"] = this;
        } else {
            window["skeletSession"] = this;
        }
        this.ClipBoard = {
            textStyle: [],
            frameStyle: [],
            webClipBoard: []
        };

        this.CustomPropertiesType = [];

        this.currentMode = 'layers';
        this.endPoint = "";

        this.theme = new GUIThemeDark();
        this.DocksInfo = [];
        this.PalettesInfo = [];
        this.FloatingWindows = [];

        this.documents = [];

    }

    environment: SkeletEnvironment;
    documents: SkeletDocument[];
    currentDocument: SkeletDocument;
    CustomPropertiesType: CustomPropertyType[];

    // Environment

    isDarkMode: boolean = true;

    // Special Statuses
    isEditingText: boolean = false;
    isEditingGradient: boolean = false;

    currentMode: 'layers' | 'assets';

    endPoint: string = '';

    websocket_address: string = "";
    websocket_port: number = 0;

    // identify the authenticated user, the current sessionId (which document is being currently worked on)
    sessionInfo: IAuthSession = {valid: false};
    // Clipboard info
    ClipBoard: {
        textStyle: any[],
        frameStyle: any[],
        webClipBoard: any[];
    };

    // current tool
    selectedTool: 'selector' | 'frame' | 'image' | 'label' = 'selector';



    // current file info
    modified: string = "";
    filename: string = "";
    currentTitle: string = "";
    project_guid: string = "";
    skelet_version: number = 10;
    load_counter: number = 0;
    // Panel Properties handlers
    PropertyPanelTextStyleHandler: IPropertyPanelTextStyleHandler;

    unknownFonts: string[] = [];
    unknownPlugins: {pluginID: string, pluginName: string, pluginVersion: string, versionRequired: string}[] = [];
    unknownDeps: {name: string, versionRequired: string}[] = [];

    DocksInfo: IDockInfo[] = [];
    PalettesInfo: IWindowInfo[] = [];
    FloatingWindows: FloatingWindow[] = [];
    selectedDocumentWindow: FloatingWindow = undefined;
    selectedPaletteWindow: FloatingWindow = undefined;
    canvases: ViewCanvas[] = [];


    theme: GUITheme;

    Notifications: { title: LocalizedString; message: LocalizedString; timestamp: string}[] = [];


    getCurrentCanvas(): ViewCanvas | undefined {
        for (let i = 0; i < this.canvases.length; i += 1) {
            if (this.canvases[i].documentRef.projectSettings.project_guid === this.currentDocument.projectSettings.project_guid) {
                if (this.canvases[i].workspaceRef.workspace_guid === this.currentDocument.currentOpenedFileID) {
                    return this.canvases[i];
                }
            }
        }
        return undefined;
    }

    private skeletworker: Worker;

    private webWorkerMessageHandler: {id: string , kind: string, fn: (message:any) => void}[] = [];

    addWebWorkerMessageHandler( kind: string, fn: any): string {
        let id = generateV4UUID();
        this.webWorkerMessageHandler.push({
            id: id,
            kind: kind,
            fn: fn
        });
        return id;
    }

    removeWebWorkerMessageHandler(id: string) {
        let idx = this.webWorkerMessageHandler.findIndex( (m) => { return m.id === id;});
        if (idx > -1) {
            this.webWorkerMessageHandler.splice(idx);
        }
    }


    startWebWorker() {
        this.skeletworker = new Worker('https://skelet.app/skeletworker.js');
        this.skeletworker.onmessage = (messageEvent) => {
            try {
                let msg = messageEvent.data;
                console.log("Received from web worker", msg);
                this.webWorkerMessageHandler.forEach( (mh) => {
                    if (mh.kind === msg.kind) {
                        try {
                            mh.fn(msg);
                        } catch (handlerError) {
                            console.log(handlerError.message);
                            console.dir(handlerError.stack);
                        }
                    }
                });
            } catch (eee) {
                console.log("WebWorker Error: ", eee.message);
                console.dir(eee.stack);
            }
        }

    }

    sendWebWorker(message: any) {
        this.skeletworker.postMessage(message);
    }

}