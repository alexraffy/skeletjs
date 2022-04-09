import {ILocalizedString} from "mentatjs";


export interface IBuildStep {
    id: string;
    name: ILocalizedString;
    run: string;
}