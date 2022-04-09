import {LayerInteractionType} from "mentatjs";


export interface LayerInteraction {
    id: string;
    title: string;
    action: LayerInteractionType;
}
