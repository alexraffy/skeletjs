import {SkeletEnvironment} from "../SkeletEnvironment";
import {HTTPRequest} from "./request";
import {findPropertyDataSource} from "../../Loader/Databases/findPropertyDataSource";

import {PropertyDataSource} from "../../Loader/Databases/PropertyDataSource";
import {ISkeletServerResponse} from "../ISkeletServerResponse";

/*
export function serverRequest_NPMAgent(env: SkeletEnvironment): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let delegate = {
            callback: (ret: IServerResponse_NPMAgent) => {

                resolve(ret.agent);
            },
            error: (errorCode: string, errorDescription: string) => {
                reject({message: errorCode, description: errorDescription});
            }
        }

        HTTPRequest(ServerRequestURI_NPMAgent, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_NPMAgent = res.response;
                    delegate.callback(ret);
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
export function serverRequest_NPMList(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            callback: (ret: IServerResponse_NPMList) => {

                let ds: {id: string, text: string; version: string; resolved?: string}[] = ret.rows.map((value) => {
                    return {
                        id: value.title,
                        text: value.title,
                        version: value.version,
                        resolved: value.resolved
                    };
                });

                let dsExists = findPropertyDataSource(env,"npm.list");
                if (dsExists) {
                    dsExists.dataSource = ds;
                } else {
                    let dsFonts = new PropertyDataSource();
                    dsFonts.id = "npm.list";
                    dsFonts.userEditable = false;
                    dsFonts.dataSource = ds;

                    env.PropertiesDataSources.push(dsFonts);
                }
                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_NPMList, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_NPMList = res.response;
                    delegate.callback(ret);
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
export function serverRequest_NPMInstall(env: SkeletEnvironment, moduleName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            callback: (ret: IServerResponse_NPMInstall) => {

                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }
        let request: IServerRequest_NPMInstall = {
            sessionId: env.sessionId,
            module: moduleName
        };

        HTTPRequest(ServerRequestURI_NPMInstall, "POST", request, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_NPMInstall = res.response;
                    delegate.callback(ret);
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
export function serverRequest_NPMUninstall(env: SkeletEnvironment, moduleName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            callback: (ret: IServerResponse_NPMUninstall) => {

                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }
        let request: IServerRequest_NPMUninstall = {
            sessionId: env.sessionId,
            module: moduleName
        };

        HTTPRequest(ServerRequestURI_NPMUninstall, "POST", request, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_NPMUninstall = res.response;
                    delegate.callback(ret);
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