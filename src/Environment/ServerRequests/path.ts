
import {HTTPRequest} from "./request";
import {SkeletEnvironment} from "../SkeletEnvironment";
import {ISkeletServerResponse} from "../ISkeletServerResponse";

/*
export function serverRequest_Paths(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            paths: (ret: IServerResponse_Paths) => {
                env.pathAppData = ret.pathAppData;
                env.pathPlugins = ret.pathPlugins;
                env.pathNodeModules = ret.pathNodeModules;
                env.pathLibraryCache = ret.pathLibraryCache;
                env.pathFontCache = ret.pathFontCache;
                env.pathSwatches = ret.pathSwatches;
                env.pathTemp = ret.pathTemp;
                resolve(true);
            },
            error: (errorCode: string, errorDescription: string) => {
                resolve(false);
            }
        }

        HTTPRequest(ServerRequestURI_Paths, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_Paths = res.response;
                    delegate.paths(ret);
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