import {Layer} from "../Layer/Layer";


export interface IExporter {
    processNode(node: Layer, title: string, depth: number, attach: string);
}

