import {ISkeletScript} from "./ISkeletScript";


export interface ISkeletScriptBundle {
    kind: "ISkeletScriptBundle";
    id: string;
    title: string;
    scripts: ISkeletScript[];
}
