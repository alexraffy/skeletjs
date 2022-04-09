import {SkeletEnvironment} from "./SkeletEnvironment";
import {DictionaryLocalizedString, isDefined, Logging} from "mentatjs";
import {SkeletWebSocket} from "./SkeletWebSocket";
import {serverRequest_LangDict, serverRequest_TradDict} from "./ServerRequests/langDict";
import {serverRequest_Settings} from "./ServerRequests/settings";
import {kBreakerState, newBreakerWithPromises} from "flowbreaker";

var global;
var _environment: SkeletEnvironment = undefined;

export function setupEnvironment(mentatjs: typeof import("mentatjs"), skelet: any, circuitBreakerEvent: (status: kBreakerState) => void): Promise<SkeletEnvironment> {
    return new Promise( (resolve, reject) => {
        let env: SkeletEnvironment = {
            Plugins: [],
            Assets: [],
            Components: [],
            Controls: [],
            CustomActions: [],
            CustomProperties: [],
            CustomPropertiesType: [],
            endPoint: "",
            Exporters: [],
            Fonts: {
                favs: [], loaded: [], rows: []
            },
            PanelsFullInfo: [],

            windowId: "",
            isElectron: false,
            isGUI: false,
            isLinux: false,
            isMacOSX: false,
            isWindows: false,
            pathAppData: "",
            pathSwatches: "",
            pathFontCache: "",
            pathLibraryCache: "",
            pathNodeModules: "",
            pathPlugins: "",
            pathTemp: "",


            lastExporter: "",
            Symbols: [],
            SymbolsCache: [],
            SystemSettings: [],
            sessionId: "",
            SwatchesList: [],
            PropertiesDataSources: [],
            jsLibraries: {
                mentatjs: mentatjs,
                skelet: skelet
            },
            currentLocale: "en-US",
            lang: new DictionaryLocalizedString("lang.master", []),
            trad: new DictionaryLocalizedString("skelet.traductions", [])
        };
        _environment = env;

        if (isDefined(global)) {
            global["skeletEnvironment"] = env;
        }
        if (typeof window !== "undefined") {
            window["skeletEnvironment"] = env;
        }

        Logging.log("******************************");
        Logging.log("Checking Skelet environment...");

        let ws = new SkeletWebSocket();

        // remove requests
        //                  () => { return serverRequest_Paths(env); },
        //                  () => { return serverRequest_Plugins(env); },
        //                  () => { return serverRequest_Swatches(env); },
        //                  () => { return serverRequest_Fonts(env); },
        //                  () => { return serverRequest_FontsFavourites(env); }

        newBreakerWithPromises(
            [
                () => { return serverRequest_LangDict(env); },
                () => { return serverRequest_TradDict(env); },
                () => { return serverRequest_Settings(env); },
            ],
            () => {
                resolve(env);
            },
            (state) => {
                circuitBreakerEvent(state)
            }
        );




    });
}

