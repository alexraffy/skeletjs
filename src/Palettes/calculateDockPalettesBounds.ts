import {kDockSide} from "./kDockSide";
import {Bounds, NUConvertToPixel} from "mentatjs";
import {FloatingWindowDockManager} from "./FloatingWindowDockManager";


export function calculateDockPalettesBounds(dockSide: kDockSide): {id: string, dock: string, order: number, bounds: Bounds}[] {
    let ret = [];
    let x = 0;
    let w = 280;
    const docks = FloatingWindowDockManager.instance.findDocksWithSide(dockSide);
    let parentBounds = FloatingWindowDockManager.instance.absoluteBoundsForDockSide(dockSide);
    let totalHeightAvailable = NUConvertToPixel(parentBounds.height).amount;
    let preDockMargin = 0;
    let postDockMargin = 0;

    let preWindowDockMargin = 2;
    let postWindowDockMargin = 2;

    let y = 0;

    // pre and post block margin on docks in the middle
    totalHeightAvailable = totalHeightAvailable - ( (docks.length > 1) ? (preDockMargin * (docks.length-1)) + ((docks.length -1) * postDockMargin) : 0);

    docks.forEach( (d) => {
        let minTotal = 0;
        let maxTotal = 0;
        let currentTotal = 0;
        d.windows.forEach( (w) => {
            let possible = w.possibleHeights(true);
            minTotal += possible.min;
            maxTotal += possible.max;
            currentTotal += possible.current;
        });
    });





    return ret;
}

