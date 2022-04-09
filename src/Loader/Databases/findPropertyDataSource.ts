import {PropertyDataSource} from "./PropertyDataSource";
import {SkeletEnvironment} from "../../Environment/SkeletEnvironment";


export function findPropertyDataSource(env: SkeletEnvironment, dsID: string): PropertyDataSource | undefined {
    for (let i = 0; i < env.PropertiesDataSources.length; i += 1) {
        if (env.PropertiesDataSources[i].id == dsID) {
            return env.PropertiesDataSources[i];
        }
    }
    return undefined;
}
