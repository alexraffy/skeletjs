import {Asset} from "./Asset";
import {ITarget} from "../Compiler/ITarget";


export interface ProjectSettings {
    kind: "ProjectSettings";
    project_guid: string;
    title: string;
    info: {
        pluginsUsed: {pluginId: string, pluginName: string, pluginVersion: string}[];
        controlsCount: number;
        fontsUsed: string[];
    };
    scripts: {id: string, filename: string, isNPMDep: boolean, npmName: string, npmVersion: string}[];
    assets: Asset[];
    components: {id: string, title: string, filename: string}[];
    targets: ITarget[];
    outputDirectory: string;
}
