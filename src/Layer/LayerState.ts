import {LayerStateType} from "mentatjs";
import {LayerOverride} from "./LayerOverride";


export interface LayerState {
    id: string;
    title: string;
    isDefaultState: boolean;
    type: LayerStateType;
    localization: string;
    responsiveStep: {
        width: number;
    }
    overrides: LayerOverride[];
}
