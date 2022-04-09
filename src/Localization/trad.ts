import {assert, getLocalizedString, isDefined} from "mentatjs";
import {getEnvironment} from "../Environment/getEnvironment";


export function trad(stringId: string): string {
    assert(typeof stringId === "string" && stringId !== "", "trad called with an empty parameter.");
    let ret = "";
    let tradEntry = getEnvironment().trad.get(stringId);
    if (isDefined(tradEntry)) {
        let lsd = getLocalizedString(tradEntry, [getEnvironment().currentLocale]);
        ret += lsd.content;
    }
    return ret;
}
