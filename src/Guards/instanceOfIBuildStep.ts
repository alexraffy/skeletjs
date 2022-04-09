import {IBuildStep} from "../Compiler/IBuildStep";
import {instanceOfILocalizedString, isDefined} from "mentatjs";

export function instanceOfIBuildStep(object: any): object is IBuildStep {
    return isDefined(object.id) && isDefined(object.name) && instanceOfILocalizedString(object.name) && isDefined(object.run);
}