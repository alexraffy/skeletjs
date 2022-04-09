import {instanceOfISkeletDocument} from "./instanceOfISkeletDocument";
import {SkeletDocument} from "../Document/SkeletDocument";

export function instanceOfSkeletDocument(object: any): object is SkeletDocument {
    return instanceOfISkeletDocument(object.data);
}