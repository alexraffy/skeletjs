import {mimeInfo} from "./mimeInfo";
import {isDefined} from "mentatjs";
import * as mimedb from "mime-db"

export function getMimeFromExtension(extension: string): string {
    const keys = Object.keys(mimedb);
    for (let key in keys) {
        let mime = mimeInfo(keys[key]);
        if (isDefined(mime.extensions) && mime.extensions.includes(extension)) {
            return keys[key];
        }
    }
    return undefined;
}
