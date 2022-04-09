import {assert} from "mentatjs";


export function safeRestore(json_string: string): any {
    "use strict";
    assert(typeof json_string === "string", "safeRestore called with an invalid value");
    let json = JSON.parse(json_string, function (key, value) {
        if (key === "viewFactory") {
            return eval("(" + value + ")");
        }
        return value;
    });
    return json;
}