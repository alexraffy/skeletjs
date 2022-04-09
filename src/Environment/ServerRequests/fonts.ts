
import {HTTPRequest} from "./request";
import {SkeletEnvironment} from "../SkeletEnvironment";
import {findPropertyDataSource} from "../../Loader/Databases/findPropertyDataSource";
import {ISkeletServerResponse} from "../ISkeletServerResponse";
import {PropertyDataSource} from "../../Loader/Databases/PropertyDataSource";


/*
export function serverRequest_Fonts(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            fonts: (ret: IServerResponse_Fonts) => {
                env.Fonts.rows = ret.fonts;
                env.Fonts.loaded = ["-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif"];


                let fonts = JSON.parse(JSON.stringify(env.Fonts.rows));

                let dsExists = findPropertyDataSource(env,"label.fonts");
                if (dsExists) {
                    dsExists.dataSource = fonts;
                } else {
                    let dsFonts = new PropertyDataSource();
                    dsFonts.id = "label.fonts";
                    dsFonts.userEditable = false;
                    dsFonts.dataSource = fonts;

                    env.PropertiesDataSources.push(dsFonts);
                }

                //getEnvironment().Fonts.rows = ret.fonts;
                resolve(true);
            },
            error: (message: string, description: string) => {
                resolve(false)
            }
        }

        HTTPRequest(ServerRequestURI_Fonts, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_Fonts = res.response;
                    delegate.fonts(ret);
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
export function serverRequest_FontsFavourites(env: SkeletEnvironment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let delegate = {
            fonts: (ret: IServerResponse_FontsFavourites) => {

                env.Fonts.favs = ret.favourites;

                //getEnvironment().Fonts.rows = ret.fonts;
                resolve(true);
            },
            error: (message: string, description: string) => {
                resolve(false)
            }
        }

        HTTPRequest(ServerRequestURI_FontsFavourites, "GET", {}, {
            data(response: string) {
                let res: ISkeletServerResponse = JSON.parse(response);
                if (res.valid === true) {
                    let ret: IServerResponse_FontsFavourites = res.response;
                    delegate.fonts(ret);
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