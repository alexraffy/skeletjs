import {FontInfo} from "./FontInfo";
import {getEnvironment} from "../../Environment/getEnvironment";
import {SkLogger} from "../../Logging/SkLogger";


export function loadTypeface(font: FontInfo) {

    let postscriptName = font.postscriptName;
    let path = font.urlPath;


    if (!getEnvironment().Fonts.loaded.includes(postscriptName)) {

        //if (Session.instance.isWindows) {
        // uri = 'url(file://' + path + ')';
        while (path.indexOf('\\') > -1) {
            path = path.replace('\\', '/');
        }
        let uri = 'url(file://' + encodeURI(path) + ')';
        //}
        SkLogger.write(uri);
        // @ts-ignore
        var new_font = new FontFace(postscriptName, uri);
        new_font.load().then(function (loaded_face) {
            // @ts-ignore
            document.fonts.add(loaded_face);
            getEnvironment().Fonts.loaded.push(postscriptName);
        }).catch(function (error) {
            // error occurred
            SkLogger.write("An error occured loading a font " + error.message);
        });
    }

}