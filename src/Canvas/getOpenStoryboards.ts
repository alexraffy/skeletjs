import {isDefined, View, ViewController} from "mentatjs";
import {SkeletResource} from "../Document/SkeletResource";
import {FloatingWindow} from "../Windows/FloatingWindow";
import {panel_id} from "../Palettes/panel_id";
import {PaletteWindow} from "../Palettes/PaletteWindow";
import {kDockGroup} from "../Palettes/kDockGroup";
import {Session} from "../Session/Session";


export function getOpenStoryboards(): {resource: SkeletResource, window: FloatingWindow, panel: panel_id, view: View, viewController: ViewController}[] {
    let ret = [];

    for (let i = 0; i < Session.instance.FloatingWindows.length; i += 1) {
        let fw = Session.instance.FloatingWindows[i];
        if (isDefined(fw)) {
            let paletteWindow = fw as PaletteWindow;
            if (fw.dockGroup === kDockGroup.documents) {
                let panelsInfo = paletteWindow.panelsInfo();
                for (let j = 0; j < panelsInfo.length; j += 1) {
                    let pi = panelsInfo[j];
                    if ((pi.id as string).startsWith("file:")) {
                        let resource = Session.instance.currentDocument.findResourceWithId(pi.id as string);
                        if (isDefined(resource)) {
                            if (resource.mime === "skelet/workspace") {
                                ret.push(
                                    {
                                        resource: resource,
                                        window: fw,
                                        panel: resource.id,
                                        view: pi.view,
                                        viewController: pi.viewController
                                    }
                                );
                            }
                        }
                    }
                }

            }
        }
    }


    return ret;
}
