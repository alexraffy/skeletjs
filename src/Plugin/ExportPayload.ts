import {LocalizedString} from "mentatjs";


export interface ExportPayload {
    exporterId: string;
    layersId: string[];
    options: { id: string; localizedTitle: LocalizedString; value: string, type: 'string' | 'dropdown' | 'boolean', dataSource?: {id: string, localizedTitle: LocalizedString}[] }[];
}
