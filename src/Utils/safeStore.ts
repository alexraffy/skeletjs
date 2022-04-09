import {assert, isDefined} from "mentatjs";


export function safeStore(baseArray: any): string {
    "use strict";
    assert(isDefined(baseArray), "safeStore called with an undefined value");
    let json_str = JSON.stringify(baseArray, function (key, value) {
        if (typeof value === "function") {
            if (key === "viewFactory") {
                return value.toString();
            }
        }
        return value;
    });
    return json_str;
}