import {IDictionaryLocalizedString, LocalizedString} from "mentatjs";
import {ProjectSettings} from "./ProjectSettings";
import {ISkeletResource} from "./ISkeletResource";
import {ColorBookInfo} from "../Loader/ColorPalette/ColorBookInfo";


export interface ISkeletDocument {
    kind: "ISkeletDocument";
    version: string;
    loaded: boolean;
    fontsUsed: string[];
    notifications: {message: LocalizedString, action: {code: string, title: LocalizedString, param: any}[]}[];
    projectSettings: ProjectSettings;
    resources: ISkeletResource[];
    opened_files: string[];
    intlStrings: IDictionaryLocalizedString;
    editing_file: string;

}