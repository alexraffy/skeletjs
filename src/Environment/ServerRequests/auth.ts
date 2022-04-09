import {SkeletEnvironment} from "../SkeletEnvironment";
import {HTTPRequest} from "./request";
import {ISkeletServerResponse} from "../ISkeletServerResponse";
import {IServerRequest_Auth, IServerResponse_Auth, ServerRequestURI_Auth} from "../ServerCommands";


export function serverRequest_Authenticate(env: SkeletEnvironment, email: string, password: string): Promise<IServerResponse_Auth> {
    return new Promise<IServerResponse_Auth>((resolve, reject) => {
        let delegate = {
            settings: (ret: IServerResponse_Auth) => {
                resolve(ret);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve({valid: false});
            }
        }

        let payload: IServerRequest_Auth = {
            email: email,
            password: password
        };

        HTTPRequest(ServerRequestURI_Auth, "POST", payload, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_Auth = res.response;
                    delegate.settings(ret);
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
