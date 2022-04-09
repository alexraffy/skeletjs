import {kDockSide} from "./kDockSide";
import {Bounds, isDefined, NUConvertToPixel} from "mentatjs";
import {FloatingWindowDockManager} from "./FloatingWindowDockManager";
import {FWDMDock} from "./FWDMDock";
import {kDockGroup} from "./kDockGroup";
import {Session} from "../Session/Session";


export function FWDMPaletteBoundsFN(dockSide: kDockSide, dockGroup: kDockGroup, excludes: string[], parentBounds: Bounds): {id: string; dock: string; order:number;  bounds: Bounds}[] {

    let x = 0;
    let w = 280;
    let ret: {id: string, order: number, dock: string, bounds: Bounds}[] = [];
    let leftDock = FloatingWindowDockManager.instance.findDockWithId("left");
    //let centerDock = FloatingWindowDockManager.instance.findDockWithId("center");
    let rightDock = FloatingWindowDockManager.instance.findDockWithId("right");

    if (!isDefined(leftDock)) {
        return [];
    }

    let leftDockBounds = FloatingWindowDockManager.instance.absoluteBoundsForDockSide("left");
    let rightDockBounds = FloatingWindowDockManager.instance.absoluteBoundsForDockSide("right");

    let docks: FWDMDock[] = [leftDock, rightDock];

    let processedFW: string[] = [];

    for (let i = 0; i < docks.length; i += 1) {
        let dockId = docks[i].id;
        if (docks[i].group !== dockGroup) {
            continue;
        }
        if (dockId === "left") {
            x = 0;
            w = 280;
            if (docks[i].windows.length === 0) {
                w = 20;
                ret.push({
                    id: "dock",
                    dock: "left",
                    order: 0,
                    bounds: new Bounds(x, NUConvertToPixel(leftDockBounds.y).amount, w,
                        NUConvertToPixel(leftDockBounds.height).amount)
                });
            }
        }
        if (dockId === "right") {
            x = NUConvertToPixel(parentBounds.width).amount - 280;
            w = 280;
            if (docks[i].windows.length === 0) {
                x = NUConvertToPixel(parentBounds.width).amount - 20;
                w = 20;
                ret.push({
                    id: "dock",
                    dock:"right",
                    order: 0,
                    bounds: new Bounds(x, NUConvertToPixel(leftDockBounds.y).amount, w,
                        NUConvertToPixel(leftDockBounds.height).amount)
                });
            }
        }
        if (dockId === "center") {
            x = 0;
            w = NUConvertToPixel(parentBounds.width).amount;
            if (leftDock.windows.length > 0) {
                x = 280;
                w = w - 280;
            }
            if (rightDock.windows.length > 0) {
                w = w - 280;
            }
            //if (centerDock.windows.length === 0) {
            //    ret.push({id: "dock", dock: "center", order: 0, bounds: new Bounds(x, NUConvertToPixel(leftDockBounds.y).amount, w, 20)});
            //}
        }

        for (let j = 0; j < docks[i].windows.length; j += 1) {
            ret.push({
                id: "insertBefore" + docks[i].windows[j].id,
                order: j,
                dock: docks[i].id,
                bounds: new Bounds(x, NUConvertToPixel(docks[i].windows[j].origin.y).amount - 2, w, 4)
            });
            ret.push({
                id: "addToWindow" + docks[i].windows[j].id,
                order: j,
                dock: docks[i].id,
                bounds: new Bounds(x, NUConvertToPixel(docks[i].windows[j].origin.y).amount + 10, w, NUConvertToPixel(docks[i].windows[j].size.height).amount - 10)
            });
            processedFW.push(docks[i].windows[j].id);
        }
        if (docks[i].windows.length > 0) {
            ret.push({
                id: "insertAfter" + docks[i].windows.length,
                order: docks[i].windows.length,
                dock: docks[i].id,
                bounds: new Bounds(x,
                    NUConvertToPixel(docks[i].windows[docks[i].windows.length - 1].origin.y).amount + NUConvertToPixel(docks[i].windows[docks[i].windows.length - 1].size.height).amount,
                    w,
                    4)
            });
        }
    }

    for (let i = 0; i < Session.instance.FloatingWindows.length; i += 1) {
        let fw = Session.instance.FloatingWindows[i];
        if (fw.dockGroup !== dockGroup) {
            continue;
        }
        if (!processedFW.includes(fw.id) && !excludes.includes(fw.id)) {
            ret.push({
                id: "addTo" + fw.id,
                dock: fw.id,
                order: 0,
                bounds: new Bounds(fw.origin.x, fw.origin.y, fw.size.width, fw.size.height)
            });
        }
    }

    return ret;
}


