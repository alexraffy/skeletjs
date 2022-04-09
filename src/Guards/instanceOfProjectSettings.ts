import {ProjectSettings} from "../Document/ProjectSettings";


export function instanceOfProjectSettings(object: any): object is ProjectSettings {
    return object.kind === "ProjectSettings";
}