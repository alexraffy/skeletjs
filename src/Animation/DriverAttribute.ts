export class DriverAttribute {
    id: string;
    layer_id: string;
    property_id: string | 'bounds.x' | 'bounds.y' | 'bounds.width' | 'bounds.height';
    value: any;
    easing: any;
}
