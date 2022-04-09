import {kDockGroup} from "./kDockGroup";
import {FloatingWindow} from "../Windows/FloatingWindow";
import {panel_id} from "./panel_id";
import {Application, NUConvertToPixel, Point, px, Size} from "mentatjs";
import {FloatingWindowDockManager} from "./FloatingWindowDockManager";
import {PanelFullInfo} from "./PanelFullInfo";
import {PaletteWindow} from "./PaletteWindow";
import {kDockSide} from "./kDockSide";
import {findPanelInfo} from "./findPanelInfo";


export class FWDMDock {
    id: string;
    group: kDockGroup;
    side: kDockSide;
    private divisible: {horizontally: boolean, vertically: boolean};
    windows: FloatingWindow[];

    constructor(id: string,
                group: kDockGroup,
                side: kDockSide,
                divisible: {horizontally: boolean, vertically: boolean},
    ) {
        this.id = id;
        this.group = group;
        this.side = side;
        this.divisible = {
            horizontally: divisible.horizontally,
            vertically: divisible.vertically
        };
        this.windows = [];
    }

    init() {

    }


    dock(fw: FloatingWindow) {
        let previousSize = this.calcSizes("value", []);
        fw.dockId = this.id;
        fw.isDocked = true;
        this.windows.push(fw);

        FloatingWindowDockManager.instance.resizeContainers();

        return this.refresh(fw.id);
    }
    undock(fw: FloatingWindow) {
        let idx = -1;
        for (let i = 0; i < this.windows.length; i += 1) {
            if (this.windows[i].id === fw.id) {
                idx = i;
            }
        }
        if (idx > -1) {
            fw.isDocked = false;
            fw.dockId = "";
            fw.refresh();
            this.windows.splice(idx, 1);
        }

        FloatingWindowDockManager.instance.resizeContainers();

        this.refresh();
    }

    private calcSizes(val: "min" | "max" | "value", forceCollapsed: panel_id[]):
        {
            windows: {
                window: PaletteWindow,
                panelInfo: PanelFullInfo,
                height: number,
                canStretch: boolean,
                collapsed: boolean
            }[],
            totalHeight: number,
            totalHeightUsed: number,
            stretchable: number,
        }
    {
        let ret: {
            window: PaletteWindow,
            panelInfo: PanelFullInfo,
            height: number,
            canStretch: boolean,
            collapsed: boolean
        }[] = [];
        let stretchable = 0;
        let rootViewBounds = Application.instance.rootView.getBounds("");
        let parentBounds = FloatingWindowDockManager.instance.absoluteBoundsForDockSide(this.side);

        let totalHeight = NUConvertToPixel(parentBounds.height).amount;
        let totalHeightUsed = 0;
        let numberOfStretchable = 0;
        for (let i = 0; i < this.windows.length; i += 1) {
            let fw = this.windows[i];
            if (fw.isToolWindow) {
                // @ts-ignore
                let paletteWindow = fw as PaletteWindow;
                let panel_id = paletteWindow.selectedPanelID;
                let panelInfo = findPanelInfo(panel_id);
                let sizes = paletteWindow.getSizesForPanel(panel_id);
                let height = 0;
                let collapsed = false;
                switch (val) {
                    case "min":
                        height = NUConvertToPixel(sizes.minSize.height).amount;
                        break;
                    case "max":
                        height = NUConvertToPixel(sizes.maxSize.height).amount;
                        break;
                    case "value":
                        height = NUConvertToPixel(sizes.value.height).amount;
                }
                collapsed = paletteWindow.isCollapsed;
                if (forceCollapsed.includes(panel_id)) {
                    height = PaletteWindow.collapsedHeight;
                    collapsed = true;
                }

                if (height === -1) {
                    height = 0;
                }
                ret.push({
                    window: paletteWindow,
                    panelInfo: panelInfo,
                    height: height,
                    canStretch: panelInfo.max_height === -1,
                    collapsed: collapsed
                });
                totalHeightUsed = totalHeightUsed + height;
            }
        }

        if (numberOfStretchable > 0) {
            for (let i = 0; i < ret.length; i += 1) {
                if (ret[i].canStretch) {
                    let h = (totalHeight - totalHeightUsed) / numberOfStretchable;
                    if (h < ret[i].panelInfo.min_height) {
                        h = ret[i].panelInfo.min_height;
                    }
                    totalHeightUsed += h;
                    numberOfStretchable -= 1;
                    ret[i].height = h;
                }
            }
        }

        return {
            windows: ret,
            totalHeight: totalHeight,
            totalHeightUsed: totalHeightUsed,
            stretchable: stretchable
        }
    }




    refresh(windowID: string = "") {

        let x,y, w, h = 0;
        let rootViewBounds = Application.instance.rootView.getBounds("");
        let b = FloatingWindowDockManager.instance.absoluteBoundsForDockSide(this.side);

        x = NUConvertToPixel(b.x).amount;
        y = NUConvertToPixel(b.y).amount;
        w = NUConvertToPixel(b.width).amount;

        let calcMaxes = this.calcSizes("max", []);
        if (calcMaxes.totalHeightUsed > calcMaxes.totalHeight) {

        }
        for (let i = 0; i < calcMaxes.windows.length; i += 1) {
            let fw = calcMaxes.windows[i].window;
            let pi = calcMaxes.windows[i].panelInfo;
            let h = calcMaxes.windows[i].height;
            let c = calcMaxes.windows[i].collapsed;
            //fw.isDocked = true;
            fw.setCollapsed(c);
            fw.setOriginAndSize(new Point(px(x), px(y)), new Size(px(w), px(h)));
            y += h;
        }

    }

}

