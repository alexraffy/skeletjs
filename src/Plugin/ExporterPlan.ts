import {ExportPayload} from "./ExportPayload";
import {ExporterDelegate} from "./ExporterDelegate";
import {ExporterPlanStep} from "./ExporterPlanStep";


export interface ExporterPlan {
    payload: ExportPayload,
    currentStep: number;
    steps: ExporterPlanStep[];
    results: {
        id: string;
        type: "content",
        contentData: {
            mime: string;
            title: string;
            filename: string;
            type: 'file' | 'string' | 'uint8'
            tempFilePath: string;
            stringData: string;
            uintArray: Uint8Array;
        },
        meta: {
            [key:string]: any;
        }
    }[]
    delegate?: ExporterDelegate;
    custom: any;
}
