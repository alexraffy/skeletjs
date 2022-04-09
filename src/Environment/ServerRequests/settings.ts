
import {HTTPRequest} from "./request";
import {SkeletEnvironment} from "../SkeletEnvironment";
import {
    IServerResponse_Settings,
    IServerResponse_WriteSettings,
    ServerRequestURI_Settings,
    ServerRequestURI_WriteSettings
} from "../ServerCommands";
import {ISkeletServerResponse} from "../ISkeletServerResponse";


export function serverRequest_Settings(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            settings: (ret: IServerResponse_Settings) => {
                env.SystemSettings = ret;
                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_Settings, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_Settings = res.response;
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


export function serverRequest_WriteSettings(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>( (resolve, reject) => {
        let delegate = {
            settings: (ret: IServerResponse_WriteSettings) => {
                resolve(true);
            },
            error: (message: string, messageDescription: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_WriteSettings, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_WriteSettings = res.response;
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