
import {HTTPRequest} from "./request";

import {ISkeletServerResponse} from "../ISkeletServerResponse";

/*
export function serverRequest_ClipboardAvailableFormats(): Promise<{text: string, mime: string} | undefined> {
    return new Promise<{text: string; mime: string}>( (resolve, reject) => {
        let delegate = {
            clipboard: (ret: IServerResponse_ClipboardFormats) => {
                // image
                if (ret.formats.length === 0) {
                    resolve(undefined);
                } else {
                    resolve(ret.formats[0]);
                }
            },
            error: (message: string, description: string) => {
                resolve(undefined);
            }
        }

        HTTPRequest(ServerRequestURI_ClipboardFormats, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_ClipboardFormats = res.response;
                    delegate.clipboard(ret);
                } else {
                    delegate.error(res.error, res.errorDescription);
                }
            },
            error(e: Error) {
                delegate.error(e.name, e.message);
            }
        });
    });
}


 */
/*
export function serverRequest_ClipboardWrite(content: string, type: "selection" | "clipboard" ): Promise<boolean> {
    return new Promise<boolean>( (resolve, reject) => {
        let delegate = {
            clipboard: (ret: any) => {
                resolve(true);
            },
            error: (message: string, description: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_ClipboardWrite, "POST", { content: content, type: type} as IServerRequest_ClipboardWrite, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    delegate.clipboard(res.response);
                } else {
                    delegate.error(res.error, res.errorDescription);
                }
            },
            error(e: Error) {
                delegate.error(e.name, e.message);
            }
        });
    });
}
*/