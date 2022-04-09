import {SkeletEnvironment} from "../SkeletEnvironment";
import {
    IServerRequest_DocumentWorker,
    IServerResponse_DocumentWorker,
    ServerRequestURI_DocumentWorker
} from "../ServerCommands";
import {HTTPRequest} from "./request";
import {ISkeletServerResponse} from "../ISkeletServerResponse";


export function serverRequest_DocumentWorker(env: SkeletEnvironment, token: string, session_token: string): Promise<IServerResponse_DocumentWorker> {
    return new Promise<IServerResponse_DocumentWorker>( (resolve, reject) => {
        let payload: IServerRequest_DocumentWorker = {
            token: token,
            session_token: session_token
        };

        HTTPRequest(ServerRequestURI_DocumentWorker, "POST", payload, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_DocumentWorker = res.response;
                    resolve(ret);
                } else {
                    reject({});
                }
            },
            error(e: Error) {
                reject({});
            }
        });
    });
}