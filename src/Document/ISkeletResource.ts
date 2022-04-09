
import {WorkspaceData} from "./WorkspaceData";
import {ColorBookInfo} from "../Loader/ColorPalette/ColorBookInfo";
import {IDictionaryLocalizedString} from "mentatjs";
import {ISkeletScriptBundle} from "./ISkeletScriptBundle";
import {ProjectSettings} from "./ProjectSettings";
import {IDatabase} from "../Loader/Databases/IDatabase";
import {ICompileOptions} from "./ICompileOptions";
import {Asset} from "./Asset";
import {SkeletComponent} from "../Plugin/SkeletComponent";


export interface ISkeletResource {
    kind: "ISkeletResource";
    id: string;
    title: string;
    mime: string;
    stringData: string;
    data: WorkspaceData | ColorBookInfo | IDictionaryLocalizedString | Asset | SkeletComponent | ISkeletScriptBundle | ProjectSettings | IDatabase;
    last_modified: string;
    compileOptions: ICompileOptions;
    includeInResources: boolean;
}