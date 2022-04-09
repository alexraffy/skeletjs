import {View} from "mentatjs";


export interface CustomPropertyType {
    type: string;
    height: number;
    propertyCell: typeof View;
    handlerFunction: any
}
