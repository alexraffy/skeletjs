import {ProjectSettings} from "./ProjectSettings";
import {instanceOfProjectSettings} from "../Guards/instanceOfProjectSettings";
import {assert} from "mentatjs";
import {Asset} from "./Asset";


export function findAssetWithPath(ps: ProjectSettings, path: string): Asset {
    assert(instanceOfProjectSettings(ps), "findAssetWithPath expects a ProjectSettings and a string as parameters.");
    for (let i = 0; i < ps.assets.length; i += 1) {
        let a = ps.assets[i];
        if (a.path === path) {
            return a;
        }
    }
    return undefined;
}

