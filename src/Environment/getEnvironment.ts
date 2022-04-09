
import {isDefined} from "mentatjs";
import {SkeletEnvironment} from "./SkeletEnvironment";

var global;
var _environment: SkeletEnvironment = undefined;

export function getEnvironment(): SkeletEnvironment {
    if (isDefined(global)) {
        if (isDefined(global["skeletEnvironment"])) {
            return global["skeletEnvironment"];
        } else {
            return _environment;
        }
    }
    if (typeof window !== "undefined") {
        if (isDefined(window["skeletEnvironment"])) {
            return window["skeletEnvironment"];
        } else {
            return _environment;
        }
    }
}

