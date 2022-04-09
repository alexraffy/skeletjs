import {Layer} from "./Layer";
import {getEnvironment} from "../Environment/getEnvironment";


export function findSymbolNode(symbol_id: string): Layer | undefined {
    "use strict";
    for (let w = 0; w < getEnvironment().SymbolsCache.length; w += 1) {
        if (getEnvironment().SymbolsCache[w].symbolID === symbol_id) {
            return getEnvironment().SymbolsCache[w].nodeRef;
        }
    }
    return undefined;
}
