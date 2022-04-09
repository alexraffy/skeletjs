import {SkeletComponent} from "../Plugin/SkeletComponent";

export function instanceOfSkeletComponent(object: any): object is SkeletComponent {
    return object.kind === "SkeletComponent";
}