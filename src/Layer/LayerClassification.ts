import {Layer} from "./Layer";


export interface LayerClassification {
    layer: Layer,
    isSelected: boolean,
    isDirectContainer: boolean,
    isAContainer: boolean,
    isSibling: boolean
    isDescendent: boolean,
    isObfuscated: boolean,
    isDirectChild: boolean
}

