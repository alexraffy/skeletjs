import {
    IServerResponse_LangDict,
    IServerResponse_TradDict,
    ServerRequestURI_LangDict,
    ServerRequestURI_TradDict
} from "../ServerCommands";
import {HTTPRequest} from "./request";
import {ISkeletServerResponse} from "../ISkeletServerResponse";
import {SkeletEnvironment} from "../SkeletEnvironment";
import {DictionaryLocalizedString} from "mentatjs";


export function serverRequest_LangDict(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            response: (ret: IServerResponse_LangDict) => {
                env.lang.appendDict(DictionaryLocalizedString.fromStruct(ret));
                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_LangDict, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_LangDict = res.response;
                    delegate.response(ret);
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


export function serverRequest_TradDict(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            response: (ret: IServerResponse_TradDict) => {
                env.trad.appendDict(DictionaryLocalizedString.fromStruct(ret));
                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_TradDict, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_TradDict = res.response;
                    delegate.response(ret);
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



