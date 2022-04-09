import {getEnvironment} from "../Environment/getEnvironment";


export function declareSkeletPlugin(classDecl: any) {

    //try {
    let s = Object.assign(new classDecl(), {});
    getEnvironment().Plugins.push(s);

    //} catch (eee) {
    //    Logging.log(eee.message);
    //}

}