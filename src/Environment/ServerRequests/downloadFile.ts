
import {HTTPRequest} from "./request";
import {SkeletEnvironment} from "../SkeletEnvironment";
import {IServerRequestURI_FileDownloadRequest, ServerRequestURI_FileDownload} from "../ServerCommands";


export function serverRequest_downloadFile(env: SkeletEnvironment, fileRequested: string, progressCallback: (fileRequested: string, percentage: number) => void,
                                           callback: (error: Error, data: Uint8Array) => void) {

        let request: IServerRequestURI_FileDownloadRequest = {
            sessionId: env.sessionId,
            fileRequested: fileRequested
        };

        HTTPRequest(ServerRequestURI_FileDownload, "POST", request, {
            progress(percentage: number) {
                progressCallback(fileRequested, percentage);
            },
            binaryData(data: Uint8Array) {
                callback(null, data);
            },
            error(e: Error) {
                callback(e, null);
            }
        }, true);


}