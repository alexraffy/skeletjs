
import {HTTPRequest} from "./request";

import {ISkeletServerResponse} from "../ISkeletServerResponse";
import {SkeletEnvironment} from "../SkeletEnvironment";

/*
export function serverRequest_TypescriptLibs(env: SkeletEnvironment, version: string, files: string[]): Promise<{valid: boolean, ret?: { version: string, files: {file:string; data:string}[] }}> {
    return new Promise<{valid: boolean, ret?:{ version: string, files: {file:string; data:string}[] }}>((resolve, reject) => {
        let delegate = {
            ret: (ret: IServerResponse_TypescriptLibs) => {
                resolve({valid: true, ret: ret});
            },
            error: (message: string, description: string) => {
                resolve({valid: false})
            }
        }
        let request: IServerRequest_TypescriptLibs = {
            sessionId: env.sessionId,
            version: version,
            files: files
        };
        HTTPRequest(ServerRequestURI_TypescriptLibs, "POST", request, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_TypescriptLibs = res.response;
                    delegate.ret(ret);
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
