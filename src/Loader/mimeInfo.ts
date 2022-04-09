import * as mimedb from "mime-db"


export function mimeInfo(mime: string): {source: string, compressible?: boolean, extensions?: string[]} {
    return mimedb[mime];
}
