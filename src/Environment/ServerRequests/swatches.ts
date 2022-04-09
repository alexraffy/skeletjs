

import {HTTPRequest} from "./request";
import {ISkeletServerResponse} from "../ISkeletServerResponse";
import {ColorBookInfo} from "../../Loader/ColorPalette/ColorBookInfo";
import {SkeletEnvironment} from "../SkeletEnvironment";


/*
export function serverRequest_Swatches(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            swatches: (ret: IServerResponse_Swatches) => {
                env.SwatchesList = ret.swatches;
                resolve(true);
            },
            error: (message: string, description: string) => {
                resolve(false)
            }
        }

        HTTPRequest(ServerRequestURI_Swatches, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_Swatches = res.response;
                    delegate.swatches(ret);
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
export function serverRequest_SwatchInfo(env: SkeletEnvironment, path: string): Promise<ColorBookInfo> {
    return new Promise<ColorBookInfo>((resolve, reject) => {
        let delegate = {
            swatchInfo: (ret: IServerResponse_SwatchInfo) => {
                resolve(ret.info);
            },
            error: (message: string, description: string) => {
                reject({ message: message, description: description});
            }
        }
        let request = {
            path: path
        } as IServerRequest_SwatchInfo;
        HTTPRequest(ServerRequestURI_SwatchInfo, "POST", request, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_SwatchInfo = res.response;
                    delegate.swatchInfo(ret);
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