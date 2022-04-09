import {ExporterPlan} from "./ExporterPlan";


export interface ExporterDelegate {
    exporterHasAdvancedOneStep?(exporterPlan: ExporterPlan);
    exporterIsDone?(exporterPlan: ExporterPlan)
}

