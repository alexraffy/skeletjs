import {isDefined, Logging} from "mentatjs";
import {SkeletExporter} from "./SkeletExporter";
import {ExporterPlan} from "./ExporterPlan";


export class ExporterDirector {
    currentStep: number = 0;

    start(exporter: SkeletExporter, exporterPlan: ExporterPlan) {


        try {
            let step = exporterPlan.steps[this.currentStep];
            let stepDone = this.stepDone.bind(this);
            exporter.step(exporterPlan, step, stepDone);

        } catch (e) {
            Logging.warn('An error occured while running the exporter.');
            Logging.dir(e);
        }
    }

    postDone(exporter: SkeletExporter, exporterPlan: ExporterPlan) {
        for (let i = 0; i < exporterPlan.results.length; i += 1) {
            if (!isDefined(exporterPlan.results[i].meta.ignore) || exporterPlan.results[i].meta.ignore === false && exporterPlan.results[i].type === "content") {
                Logging.log(exporterPlan.results[i].contentData.stringData);
            }
        }
        if (isDefined(exporterPlan.delegate)) {
            exporterPlan.delegate.exporterIsDone(exporterPlan);
        }
    }

    stepDone(exporter: SkeletExporter, exporterPlan: ExporterPlan) {
        this.currentStep += 1;



        if (this.currentStep >= exporterPlan.steps.length) {
            // is there a post ?
            if (isDefined(exporter.post)) {
                let postDone = this.postDone.bind(this);
                exporter.post(exporterPlan, postDone)
            } else if (isDefined(exporterPlan.delegate)) {
                exporterPlan.delegate.exporterIsDone(exporterPlan);
            }
        } else {
            try {
                let stepDone = this.stepDone.bind(this);
                let step = exporterPlan.steps[this.currentStep];
                exporter.step(exporterPlan, step, stepDone);

            } catch (e) {
                Logging.warn('An error occured while running the exporter.');
                Logging.dir(e);
            }
        }
    }


}
