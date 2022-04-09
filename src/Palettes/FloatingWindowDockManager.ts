import {
    Application,
    BaseClass, Border,
    BorderSide,
    Bounds,
    Fill,
    generateV4UUID,
    isDefined,
    NUConvertToPixel,
    View
} from "mentatjs";
import {kDockSide} from "./kDockSide";
import {FWDMPaletteBoundsFN} from "./FWDMPaletteBoundsFN";
import {FloatingWindow} from "../Windows/FloatingWindow";
import {FWDMDock} from "./FWDMDock";
import {kDockGroup} from "./kDockGroup";


export class FloatingWindowDockManager extends BaseClass {

    private static _instance: FloatingWindowDockManager = undefined;

    private highlightsViews: View[] = [];
    private docks: FWDMDock[];

    private contentContainer: View;
    private documentContainer: View;
    private docksContainers: { group: kDockGroup, side: kDockSide, view: View}[] = [];

    constructor() {
        super();
        FloatingWindowDockManager._instance = this;
        this.docks = [];
    }

    static get instance(): FloatingWindowDockManager {
        if (!isDefined(FloatingWindowDockManager._instance)) {
            return new FloatingWindowDockManager();
        }
        return FloatingWindowDockManager._instance;
    }

    init(contentContainer: View, documentContainer: View, leftDockContainer: View, rightDockContainer: View) {
        this.contentContainer = contentContainer;
        this.documentContainer = documentContainer;
        this.docksContainers = [
            {group: kDockGroup.properties, side: "left", view: leftDockContainer},
            {group: kDockGroup.properties, side: "right", view: rightDockContainer}
        ]
    }


    findDockWithId(id: string): FWDMDock {
        for (let i = 0; i < this.docks.length; i += 1) {
            if (this.docks[i].id === id) {
                return this.docks[i];
            }
        }
        return undefined;
    }

    findDocksWithSide(side: kDockSide): FWDMDock[] {
        let ret: FWDMDock[] = [];
        this.docks.forEach( (d) => {
            if (d.side === side) {
                ret.push(d);
            }
        });
        return ret;
    }

    absoluteBoundsForDockSide(side: kDockSide): Bounds {
        let contentBounds = this.contentContainer.getRealBounds();
        let h = NUConvertToPixel(contentBounds.height).amount;

        if (side === "left") {
            return new Bounds(NUConvertToPixel(contentBounds.x).amount + 2, NUConvertToPixel(contentBounds.y).amount + 2, this.widthForDockSide("left"), h);
        }
        if (side === "right") {
            const w = this.widthForDockSide("right")
            return new Bounds( NUConvertToPixel(contentBounds.width).amount - 2 - w , NUConvertToPixel(contentBounds.y).amount + 2, w, h);
        }
        if (side === "center") {
            const leftWidth = this.widthForDockSide("left");
            const rightWidth = this.widthForDockSide("right");
            let w = this.widthForDockSide("center");

            return new Bounds( NUConvertToPixel(contentBounds.x).amount + 2 + leftWidth + 2, NUConvertToPixel(contentBounds.y).amount + 2, w, h);
        }

    }

    boundsForDockSide(side: kDockSide): Bounds {
        if (!isDefined(this.contentContainer)) {
            return new Bounds(2, 2, 2, 2);
        }
        let contentBounds = this.contentContainer.getBounds("", false);
        let h = NUConvertToPixel(contentBounds.height).amount;

        if (side === "left") {
            return new Bounds(2, 2, this.widthForDockSide("left"), h);
        }
        if (side === "right") {
            const w = this.widthForDockSide("right")
            return new Bounds( NUConvertToPixel(contentBounds.width).amount - 2 - w , 2, w, h);
        }
        if (side === "center") {
            const leftWidth = this.widthForDockSide("left");
            const rightWidth = this.widthForDockSide("right");
            let w = this.widthForDockSide("center");

            return new Bounds( 2 + leftWidth + 2, 2, w, h);
        }

    }


    widthForDockSide(side: kDockSide): number {
        if ((side === "center") || (side === "center-bottom") || (side === "bottom")) {
            if (!isDefined(this.contentContainer)) {
                return 2;
            }
            let contentBounds = this.contentContainer.getBounds("", false);
            if (side === "bottom") {
                return NUConvertToPixel(contentBounds.width).amount - 4
            }
            return NUConvertToPixel(contentBounds.width).amount - 8 - this.widthForDockSide("left") - this.widthForDockSide("right");
        }
        const docks = this.findDocksWithSide(side);
        if (docks.length === 0 || docks[0].windows.length === 0) {
            return 2;
        }
        return 280;
    }


    addDock(id: string, side: kDockSide, group: kDockGroup, divisible: {horizontally: boolean, vertically: boolean}) {

        let d = new FWDMDock(id, group, side, divisible);
        this.docks.push(d);
        d.init();

        this.clear();
        this.resizeContainers();
    }

    resizeContainers() {
        this.docksContainers.forEach( (dc) => {
            dc.view.doResize(true);
        });
        this.documentContainer.doResize(true);
    }


    private dockCandidatesZones(dockGroup: kDockGroup): {id: string, dock: string, order: number, bounds: Bounds}[] {
        let processLeft: boolean = this.widthForDockSide("left") !== 2;
        let processRight: boolean = this.widthForDockSide("right") !== 2;
        let ret = [];
        if (dockGroup !== kDockGroup.properties) {
            return [];
        }
        if (!processLeft) {
            ret.push({
                id: generateV4UUID(),
                dockSide: "left",
                dock: "left",
                order: 0,
                bounds: this.boundsForDockSide("left")
            });
        }

        if (!processRight) {
            ret.push({
                id: generateV4UUID(),
                dockSide: "right",
                dock: "right",
                order: 0,
                bounds: this.boundsForDockSide("right")
            });
        }

        if (processLeft) {
            let docks = this.findDocksWithSide("left");
            docks.forEach( (d) => {

            })
        }

    }


    prepViews(fwDockGroup: kDockGroup, exclude: string[]) {
        for (let i =0; i < this.highlightsViews.length; i += 1) {
            this.highlightsViews[i].detachItSelf();
        }
        this.highlightsViews = [];
        let parentBounds = Application.instance.rootView.getBounds("");
        let bounds: {id: string; dock: string, order: number, bounds: Bounds}[] = FWDMPaletteBoundsFN("left", fwDockGroup, exclude, parentBounds);
        for (let i = 0; i < bounds.length; i += 1) {
            if (exclude.includes(bounds[i].id)) {
                continue;
            }
            let v = new View();
            v.keyValues["special_id"] = bounds[i].id;
            v.keyValues["dock"] = bounds[i].dock;
            v.keyValues["bounds"] = bounds[i].bounds;
            v.boundsForView = function (parentBounds) {
                return this.keyValues["bounds"] as Bounds;
            }
            //v.fills = [new Fill(true, "color", "normal", "rgba(217, 131, 176, 0.5)")]; // PANTONE  231 XGC
            v.borders = [new Border(true, 1, "solid", "rgba(217, 131, 176, 0.5)", BorderSide.all)];
            v.zIndex = "1010";
            v.initView("dock_views_" + bounds[i].id);
            Application.instance.rootView.attach(v);
            this.highlightsViews.push(v);
        }
    }
    clear() {
        for (let i =0; i < this.highlightsViews.length; i += 1) {
            this.highlightsViews[i].detachItSelf();
        }
        this.highlightsViews = [];
    }
    testHit(fw: FloatingWindow, x: number, y: number, clear: boolean): boolean {
        let viewHovered: View = undefined;
        for (let i = 0; i < this.highlightsViews.length; i += 1) {
            let b = this.highlightsViews[i].keyValues["bounds"];
            if ((b.x.amount) < ((x) + (0)) && ((b.x.amount) + (b.width.amount)) > (x) &&
                (b.y.amount) < ((y) + (0)) && ((b.y.amount) + (b.height.amount)) > (y))
            {
                if (this.highlightsViews[i].isDOMHovering === false) {
                    this.highlightsViews[i].isDOMHovering = true;
                    this.highlightsViews[i].fills = [new Fill(true, "color", "normal", "rgba(217, 131, 176, 0.5)")]; // PANTONE  231 XGC
                    this.highlightsViews[i].borders = [new Border(true, 1, "solid", "rgba(217, 131, 176, 1.0)", BorderSide.all)];
                    this.highlightsViews[i].processStyleAndRender("", []);

                }
                viewHovered = this.highlightsViews[i];
            } else {
                if (this.highlightsViews[i].isDOMHovering === true) {
                    this.highlightsViews[i].isDOMHovering = false;
                    this.highlightsViews[i].fills = []; // PANTONE  231 XGC
                    this.highlightsViews[i].borders = [new Border(true, 1, "solid", "rgba(217, 131, 176, 0.5)", BorderSide.all)];
                    this.highlightsViews[i].processStyleAndRender("", []);
                }
            }
        }

        if (isDefined(viewHovered) && clear === true) {
            let dock = viewHovered.keyValues["dock"];
            if (["left", "right", "center"].includes(dock)) {
                let d = this.findDockWithId(dock);
                d.dock(fw);
            } else {
                // window

            }
        }
        return false;
    }




}


