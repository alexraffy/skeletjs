import {LocalizedString} from "mentatjs";
import {ExporterDelegate} from "./ExporterDelegate";
import {ExportPayload} from "./ExportPayload";
import {ExporterPlan} from "./ExporterPlan";
import {ExporterPlanStep} from "./ExporterPlanStep";
import {Layer} from "../Layer/Layer";


export interface SkeletExporter {
    id: string;
    name: string;
    options?(): { id: string; localizedTitle: LocalizedString; value: string, type: 'string' | 'dropdown' | 'boolean', dataSource?: {id: string, localizedTitle: LocalizedString}[] }[];
    checkExportable(layer: Layer): boolean;

    plan(payload: ExportPayload, delegate: ExporterDelegate): ExporterPlan;
    step(plan: ExporterPlan, step: ExporterPlanStep, callback: (exporter: SkeletExporter, exporterPlan: ExporterPlan) => void );
    post(exporterPlan: ExporterPlan, callback: (exporter: SkeletExporter, exporterPlan: ExporterPlan) => void);

    //exportLayer(layer: Layer, options: any, callback: (layer: Layer, error: any, result: SkeletExportInfo[])=>void): void
}