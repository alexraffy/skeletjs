import {FontInfo} from "../Loader/Font/FontInfo";

import {CustomPropertyType} from "./CustomPropertyType";
import {SkeletExporter} from "../Plugin/SkeletExporter";
import {PanelFullInfo} from "../Palettes/PanelFullInfo";
import {Layer} from "../Layer/Layer";
import {PropertyDataSource} from "../Loader/Databases/PropertyDataSource";
import {DictionaryLocalizedString} from "mentatjs";
import {Asset} from "../Document/Asset";
import {SkeletControl} from "../Plugin/SkeletControl";
import {SkeletComponent} from "../Plugin/SkeletComponent";
import {SkeletPlugin} from "../Plugin/SkeletPlugin";
import {IServerSwatch} from "./ServerCommands";


export interface SkeletEnvironment {
    Fonts: { favs: string[], loaded: string[], rows: FontInfo[] };

    // OS Info
    windowId: string;
    isGUI: boolean;
    isWindows: boolean;
    isLinux: boolean;
    isMacOSX: boolean;
    isElectron: boolean;

    pathAppData: string;
    pathSwatches: string;
    pathPlugins: string;
    pathNodeModules: string;
    pathFontCache: string;
    pathLibraryCache: string;
    pathTemp: string;


    // web
    endPoint: string;
    sessionId: string;

    // full list of controls, components and blocks
    Controls: { group: string, controls: SkeletControl[]}[];

    // Plugins and added properties, actions
    Components: SkeletComponent[];
    Plugins: SkeletPlugin[];
    CustomProperties: any;
    CustomPropertiesType: CustomPropertyType[];
    CustomActions: any;
    Exporters: SkeletExporter[];
    lastExporter: string;

    // Panels info
    PanelsFullInfo: PanelFullInfo[];

    // settings for the app and plugin settings
    SystemSettings: any;

    // Images and other Resources
    Assets: Asset[];

    // Cache to avoid going through different workspaces tree struct to find a symbol info
    SymbolsCache: {
        symbolID: string
        title: string,
        nodeRef: Layer
    }[];

    Symbols: any[];


    SwatchesList: IServerSwatch[];

    PropertiesDataSources: PropertyDataSource[];


    jsLibraries: {
        mentatjs: any;
        skelet: any;
    }

    currentLocale: string;

    // Dictionaries
    lang: DictionaryLocalizedString;
    trad: DictionaryLocalizedString;

}


