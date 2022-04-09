import {instanceOfISkeletScript} from "./instanceOfISkeletScript";
import {SkeletScript} from "../Document/SkeletScript";

export function instanceOfSkeletScript(object: any): object is SkeletScript {
    return instanceOfISkeletScript(object._data);
}