
import {HTTPRequest} from "./request";
import {SkeletEnvironment} from "../SkeletEnvironment";

import {isDefined} from "mentatjs";
import {ISkeletServerResponse} from "../ISkeletServerResponse";

/*
export function serverRequest_Plugins(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>( (resolve, reject) => {
        let delegate = {
            counter: 0,
            scriptDownloaded: () => {
                delegate.counter --;
                if (delegate.counter <= 0) {
                    resolve(true);
                }
            },

            pluginFail: (id: string) => {

            },

            plugins: (list: IServerResponse_Plugins) => {

                if (!isDefined(list) || !isDefined(list.librairies)) {
                    return reject(false);
                }

                list.librairies.forEach( (p) => {
                    if (p.enabled) {
                        p.files.forEach( (f) => {
                            if (f.mime === "text/css") {
                                if (env.isGUI) {
                                    let style = document.createElement('style');
                                    style.type = 'text/css';
                                    if ((style as any).styleSheet) {
                                        (style as any).styleSheet = f.content;
                                    } else {
                                        style.appendChild(document.createTextNode(f.content));
                                    }
                                    let head = document.head || document.getElementsByTagName('head')[0];
                                    head.appendChild(style);
                                }
                            }
                            if (f.mime === "text/javascript") {
                                if (env.isGUI) {
                                    delegate.counter += 1;
                                    let scriptTag = document.createElement("script");
                                    scriptTag.type = "text/javascript";
                                    scriptTag.appendChild(document.createTextNode(f.content));
                                    scriptTag.onload = (e) => {
                                        delegate.scriptDownloaded();
                                    };
                                    let head = document.head || document.getElementsByTagName('head')[0];
                                    head.appendChild(scriptTag);
                                } else {
                                    delegate.counter += 1;
                                    console.log(`Executing script ${f.path}`);
                                    try {
                                        let contentString = f.content.toString();
                                        let skeletcore = env.jsLibraries.skelet
                                        let mentatjs = env.jsLibraries.mentatjs;
                                        eval(contentString);
                                    } catch (eExec) {
                                        console.log("Error executing script");
                                        console.log(eExec.message);
                                        console.dir(eExec.stack);
                                        delegate.pluginFail(p.skeletPluginStoreID);
                                    }
                                    delegate.scriptDownloaded();
                                }
                            }
                        });
                    }
                })

            },

            error: (message: string, description: string) => {
                resolve(true);
            }
        }

        HTTPRequest(ServerRequestURI_Plugins, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_Plugins = res.response;
                    delegate.plugins(ret);
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
export function serverRequest_PluginToggle(env: SkeletEnvironment, pluginId: string, enabled: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            callback: (ret: any) => {

                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }
        let request: IServerRequest_PluginToggle = {
            pluginId: pluginId,
            enabled: enabled
        };

        HTTPRequest(ServerRequestURI_PluginToggle, "POST", request, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret = res.response;
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

