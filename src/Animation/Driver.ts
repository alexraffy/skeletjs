import {Border, BorderRadius, Fill} from "mentatjs";
import {DriverAttribute} from "./DriverAttribute";


export class Driver {
    id: string;
    layer_id: string;
    property_id: string  | 'bounds.x' | 'bounds.y' | 'bounds.width' | 'bounds.height';
    defaultValue: number | string | Fill | Border | BorderRadius;
    keys: {driverValue: any, attributes: DriverAttribute[]}[];
}