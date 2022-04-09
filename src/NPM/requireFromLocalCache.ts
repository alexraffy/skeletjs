import {Session} from "../Session/Session";
import {SkLogger} from "../Logging/SkLogger";


export function requireFromLocalCache(requireFunction) {

    let nodeModulesPath = Session.instance.environment.pathNodeModules;

    let str = requireFunction;
    let idx = str.indexOf('require(');
    while ( idx > -1) {
        // find the end )
        let idxEndParenthis = str.indexOf(')', idx);
        if (idx === -1) {
            console.warn("could not find end parenthesis ", str);
            return str;
        }
        let packageToImport = str.substr(idx + 8, idxEndParenthis - idx - 8);
        while (packageToImport.indexOf('"') > -1 || packageToImport.indexOf("'") > -1) {
            packageToImport = packageToImport.replace('"', "");
            packageToImport = packageToImport.replace("'", "");
        }
        SkLogger.write(packageToImport);
        let toReplace = str.substr(idx, idxEndParenthis - idx);
        str = str.replace(toReplace, "require('" + nodeModulesPath + packageToImport + "'");
        SkLogger.write(str);
        idx = str.indexOf('require(',idx + 8)
    }
    return str;
}
