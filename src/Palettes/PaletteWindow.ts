import {FloatingWindow} from "../Windows/FloatingWindow";
import {panel_id} from "./panel_id";
import {
    Application,
    Bounds, Btn, fillParentBounds,
    generateV4UUID, getLocalizedString, isDefined,
    NavigationController,
    NavigationControllerDelegate, NUConvertToPixel, Point, Popover,
    PopoverDelegate,
    px,
    Size, Tabs, View, ViewController
} from "mentatjs";
import {findPanelInfo} from "./findPanelInfo";
import {SkLogger} from "../Logging/SkLogger";
import {kNotifications} from "../Session/kNotifications";
import {kDockGroup} from "./kDockGroup";
import {PanelFullInfo} from "./PanelFullInfo";
import {FloatingWindowDelegate} from "../Windows/FloatingWindowDelegate";
import {ContextMenuViewController} from "./ContextMenuViewController";
import {Session} from "../Session/Session";


export class PaletteWindow extends FloatingWindow {

    private _viewTabBar: Tabs;
    private _viewToolWindowContentContainer: View;
    private _viewMenuIcon: Btn;

    private panels_VC: { viewContainer: View; panel_id: panel_id; navigationController: NavigationController; viewController: ViewController}[] = [];
    private _collapsed: boolean = false;

    private _selectedPanel: string = "";

    public previousPalette?: PaletteWindow;
    public nextPalette?: PaletteWindow;


    constructor() {
        super();
    }

    get isCollapsed(): boolean {
        return this._collapsed;
    }

    setCollapsed(val: boolean) {
        this._collapsed = val;
    }

    static get collapsedHeight() {
        return 30;
    }

    init(id: string,
         origin: Point,
         size: Size,
         rootView: View,
         options: {
             isToolWindow: boolean,
             viewControllerClass?: typeof ViewController,
             windowDelegate?: FloatingWindowDelegate,
             resizeable: boolean,
             minSize?: Size;
             maxSize?: Size;
             dockGroup?: kDockGroup,
         } = {
             isToolWindow: false,
             resizeable: false,
             dockGroup: kDockGroup.none
         }) {
        super.init(id, origin, size, rootView, options);
        this.inactiveBaseZIndex = 920;
        this.activeBaseZIndex = 930;
        this.previousPalette = undefined;
        this.nextPalette = undefined;
        if (this.dockGroup === kDockGroup.documents) {
            this.inactiveBaseZIndex = 890;
            this.activeBaseZIndex = 895;
        }
        this._view.styles = Session.instance.theme.titleBarStyle;
        this._view.processStyleAndRender("", []);
        this.drawPalette();

        this.setActive(false, false);
    }

    private drawPalette() {

        this._viewMenuIcon = new Btn();
        this._viewMenuIcon.boundsForView = function (parentBounds) {
            return new Bounds(NUConvertToPixel(parentBounds.width).amount - 22, 0, 20, 20);
        };
        this._viewMenuIcon.fontFamily = "FontAwesome5ProRegular";
        this._viewMenuIcon.fontWeight = "300";
        this._viewMenuIcon.text = "&#xf0c9;";
        this._viewMenuIcon.dontCacheStyle = true;
        this._viewMenuIcon.initView(generateV4UUID());
        this._view.attach(this._viewMenuIcon);
        this._viewMenuIcon.setActionDelegate(this, "onMenu");


        this._viewTabBar = new Tabs();
        this._viewTabBar.boundsForView = function (parentBounds) {
            return new Bounds(0, 0, NUConvertToPixel(parentBounds.width).amount - 30,
                px(20));
        }
        this._viewTabBar.dataSource = [];
        this._viewTabBar.dontCacheStyle = true;
        this._viewTabBar.styles = Session.instance.theme.titleBarStyle;
        this._viewTabBar.initView(generateV4UUID());
        this._view.attach(this._viewTabBar);
        this._viewTabBar.setActionDelegate(this, "onPanelSelectedChanged");

        this._viewToolWindowContentContainer = new View();
        this._viewToolWindowContentContainer.boundsForView = function (parentBounds) {
            return new Bounds(0, 20, NUConvertToPixel(parentBounds.width).amount, NUConvertToPixel(parentBounds.height).amount - 20);
        }
        this._viewToolWindowContentContainer.dontCacheStyle = true;
        this._viewToolWindowContentContainer.initView("toolWindowContentContainer_"+generateV4UUID());
        this._view.attach(this._viewToolWindowContentContainer);




    }


    attachPaletteBelow(p: PaletteWindow) {
        if (this.id === p.id) { return;}
        this.nextPalette = p;
        p.previousPalette = this;
        this.nextPalette.isDocked = true;
        this.updatePaletteBelow();
    }


    detachFromPaletteAbove() {
        if (isDefined(this.previousPalette)) {
            this.previousPalette.nextPalette = undefined;
            this.previousPalette = undefined;
        }
    }


    setOriginAndSize(o: Point, s: Size) {
        super.setOriginAndSize(o, s);
        let pi = Session.instance.PalettesInfo.find((p) => { return p.id === this.id;});
        if (isDefined(pi)) {
            pi.origin = this.origin.copy();
            pi.size = this.size.copy();
        }
    }

    updatePaletteBelow() {
        let origin = this.origin.copy();
        let size = this.size.copy();

        if (isDefined(this.nextPalette)) {
            let p = Point.fromStruct(
                {
                    x: px(NUConvertToPixel(origin.x).amount),
                    y: px(NUConvertToPixel(origin.y).amount + NUConvertToPixel(size.height).amount)
                }
            );
            let s = Size.fromStruct(
                {
                    width: px(NUConvertToPixel(size.width).amount),
                    height: this.nextPalette.size.height
                }
            );
            this.nextPalette.setOriginAndSize(p, s);

            SkLogger.write(`PaletteWindow.updatePaletteBelow ${this.nextPalette.id} ${p.x.amount},${p.y.amount} ${s.width.amount},${s.height.amount}`);

            //this.nextPalette.refresh();
            this.nextPalette.updatePaletteBelow();
        }

    }


    refresh() {
        super.refresh();
        this._viewTabBar.processStyleAndRender("", []);
        this._viewMenuIcon.processStyleAndRender("", []);
        this._viewToolWindowContentContainer.doResizeFrameOnly(true);
        for (let i = 0; i < this.panels_VC.length; i += 1) {
            this.panels_VC[i].viewContainer.doResize(true);
        }
        if (isDefined(this.nextPalette)) {
            this.updatePaletteBelow();
        }
    }



    private onMenu(sender) {
        Application.instance.notifyAll(this, kNotifications.noticeBodyClicked);

        let panel_id: string = this._viewTabBar.selectedId;
        let panel_info: PanelFullInfo = findPanelInfo(panel_id);
        if (!isDefined(panel_info)) {
            return;
        }

        let num_menu_items = panel_info.menuDataSourceFunc(panel_id).length;

        if (num_menu_items === 0) {
            return;
        }


        let width = 10 + 200;
        let height = 10 + num_menu_items * 24 + (num_menu_items) * 10;



        let popoverRef = new Popover();
        popoverRef.styles = Session.instance.theme.popoverStyle;
        popoverRef.width = px(width);
        popoverRef.height = px(height);
        popoverRef.initPopover("panelMenu", Application.instance.rootView, sender);

        let delegate: PopoverDelegate & NavigationControllerDelegate & {panelInfo: PanelFullInfo} = {
            panelInfo: panel_info,
            popoverRef: popoverRef,
            popoverWasClosed(popover: Popover, status: any) {

            },

            popoverReceivedStatus(popover: Popover, viewController: ViewController, status: any) {
                if (isDefined(status) && status.valid === true) {
                    if (isDefined(status.selectedId)) {
                        let selectedId = status.selectedId;
                        let panel_id: string = this.panelInfo.panel_id;
                        if (isDefined(panel_info.menuSelectionHandleFunc)) {
                            let ret = panel_info.menuSelectionHandleFunc(panel_id, panel_info.menuDataSourceFunc(panel_id), selectedId);
                            if (ret === true) {
                                this.popoverRef.closeWithStatus({valid: false});
                            }
                        }
                    }
                }
            },
            viewControllerWasLoadedSuccessfully(viewController: ViewController) {
                let panel_id: string = this.panelInfo.panel_id;

                (viewController as ContextMenuViewController).popoverRef = this.popoverRef;
                (viewController as ContextMenuViewController).dataSource = this.panelInfo.menuDataSourceFunc(panel_id);
                this.popoverRef.navigationController.present(viewController, {animated: false});
            }
        }
        popoverRef.setActionDelegate(delegate, "popoverWasClosed");
        popoverRef.navigationController.instantiateViewController("ContextMenuViewController", ContextMenuViewController, delegate);

    }


    get selectedPanelID(): panel_id {
        return this._selectedPanel as panel_id;
    }

    get panelIds(): panel_id[] {
        let ret: panel_id[] = [];
        for (let i = 0; i < this.panels_VC.length; i += 1) {
            ret.push (this.panels_VC[i].panel_id);
        }
        return ret;
    }

    panelsInfo(): {
        id: panel_id;
        view: View;
        viewController: ViewController;
    }[] {
        let ret : {
            id: panel_id;
            view: View;
            viewController: ViewController;
        }[] = [];
        for (let i = 0; i < this.panels_VC.length; i += 1) {
            ret.push(
                {
                    id: this.panels_VC[i].panel_id,
                    view: this.panels_VC[i].viewContainer,
                    viewController: this.panels_VC[i].viewController
                }
            );
        }
        return ret;
    }

    getSizesForPanel(panelID: panel_id): { value: Size, minSize: Size, maxSize: Size } {

        let info = findPanelInfo(panelID);
        if (isDefined(info)) {
            let value = new Size(px(info.min_width), px(info.min_height));
            let palette = Session.instance.PalettesInfo.find((p) => { return p.id === this.id;});
            if (isDefined(palette)) {
                if (palette.selectedPanel === panelID) {
                    value = new Size(palette.size.width, palette.size.height);
                }
            }
            return {
                value: value,
                minSize: new Size(px(info.min_width), px(info.min_height)),
                maxSize: new Size(px(info.max_width), px(info.max_height))
            };
        }
        return undefined;
    }



    setSelectedPanel(panel: panel_id) {
        this._viewTabBar.setSelectedId(panel);
        this.onPanelSelectedChanged(this._viewTabBar);
    }


    private onPanelSelectedChanged(sender) {
        let isMinizedAction = false;
        let panel_id = (sender as Tabs).selectedId;
        this._selectedPanel = panel_id;
        for (let i = 0; i < this.panels_VC.length; i += 1) {
            if (this.panels_VC[i].panel_id === panel_id) {
                this.panels_VC[i].viewContainer.setVisible(true);
            } else {
                this.panels_VC[i].viewContainer.setVisible(false);
            }
        }

        // if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate[this.actionDelegateEventName])) {
        //     if (isMinizedAction) {
        //         this.actionDelegate[this.actionDelegateEventName](this, {eventName: 'max', target: undefined});
        //     } else {
        //         this.actionDelegate[this.actionDelegateEventName](this, {eventName: 'requirePanel', target: panel_id});
        //     }
        // }

        // update the menu
        let panel_info: PanelFullInfo = findPanelInfo(panel_id);
        if (!isDefined(panel_info)) {
            this._viewMenuIcon.setVisible(false);
        } else {
            // menu
            if (panel_info.menuDataSourceFunc(panel_id).length > 0) {
                this._viewMenuIcon.setVisible(true);
            }
            // resize
            this.resizeTo(Size.fromStruct({width: this._size.width, height:  px(panel_info.value_height)}));

        }
        this.refresh();

    }

    addPanelIfNotExists(p: PanelFullInfo): boolean {
        try {
            let v = new View();
            v.dontCacheStyle = true;
            v.boundsForView = function (parentBounds) {
                return fillParentBounds(parentBounds);
            }
            v.initView(generateV4UUID());
            this._viewToolWindowContentContainer.attach(v);

            let nc: NavigationController = new NavigationController();
            let vc: typeof ViewController = undefined;
            // @ts-ignore
            vc = p.declViewController;

            let self = this;
            nc.initNavigationControllerWithRootView(generateV4UUID(), v);
            let delegate: NavigationControllerDelegate & { navigationController: NavigationController } = {
                navigationController: nc,
                viewControllerWasLoadedSuccessfully(viewController: ViewController): void {
                    // is there a vc init in the panelsinfo
                    if (isDefined(p.viewControllerInit)) {
                        p.viewControllerInit(viewController, p.params);
                    }

                    self.panels_VC.push({
                        viewContainer: v,
                        panel_id: p.panel_id as panel_id,
                        viewController: viewController,
                        navigationController: this.navigationController
                    });
                    this.navigationController.present(viewController, {animated: false});
                    self.panels_VC[self.panels_VC.length - 1].viewContainer.setVisible(true);
                }
            };
            for (let i = 0; i < this.panels_VC.length; i += 1) {
                this.panels_VC[i].viewContainer.setVisible(false);
            }
            nc.instantiateViewController(generateV4UUID(), vc, delegate);

            let title_string = getLocalizedString(p.localizedTitle, [Session.instance.environment.currentLocale]).content;
            let w = title_string.length * 6;
            this._viewTabBar.dataSource.push({
                id: p.panel_id,
                width: w,
                text: title_string
            });
            this._viewTabBar.selectedId = p.panel_id;
            this._viewTabBar.processStyleAndRender("", []);
            this.setSelectedPanel(p.panel_id as panel_id);

            return true;

        } catch (error) {
            SkLogger.write("EXCEPTION: ", error.message);
            SkLogger.write(error.stack);
            return false;
        }
    }


    viewWillBeDragged(parentView: View, options?: { event: Event }): any {
        this.setActive(true);

        if (isDefined(this.previousPalette)) {
            this.isDocked = false;
            this.detachFromPaletteAbove();
            this.refresh();
            this.updatePaletteBelow()
        }


        /*
        TODELETE

        if (this.dockGroup !== kDockGroup.none) {


            let b = FloatingWindowDockManager.instance.findDockWithId(this.dockId);
            if (this.isDocked === true) {
                this.isDocked = false;
                let w = 280;
                let h = 200;
                if (isDefined(this._viewTabBar)) {
                    let panel_id = this._viewTabBar.selectedId;
                    let panel_info = findPanelInfo(panel_id);
                    if (isDefined(panel_info)) {
                        w = panel_info.min_width;
                        h = panel_info.min_height;
                    }
                }
                let origin = this.origin;
                this.setOriginAndSize( new Point(px((options!.event as MouseEvent).clientX - w / 2), origin.y),
                new Size(px(w), px(h)));

                if (isDefined(b)) {
                    b.undock(this);
                }

            }
            FloatingWindowDockManager.instance.prepViews(this.dockGroup, [this.id]);
        }

         */
    }

    viewIsBeingDragged(view: View, options?: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }): any {
        let ret = super.viewIsBeingDragged(view, options);
        if (isDefined(this.nextPalette)) {
            this.updatePaletteBelow();
        }

    }

    viewWasDragged(view: View, options?: { event: Event; x: number; y: number }): any {
        let ret = super.viewWasDragged(view, options);
        let panel_id = this.selectedPanelID;

        // Update the config so the palette are in the same spot on relaunch.
        // find the dockInfo
    }

    viewIsBeingResized(view: View, bounds: Bounds, eventData: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }) {

        let w = NUConvertToPixel(bounds.width).amount;
        let h = NUConvertToPixel(bounds.height).amount;

        let sizes = this.getSizesForPanel(this.selectedPanelID);
        if (isDefined(sizes)) {
            let mW = NUConvertToPixel(sizes.minSize.width).amount;
            let mH = NUConvertToPixel(sizes.minSize.height).amount;
            let MW = NUConvertToPixel(sizes.maxSize.width).amount;
            let MH = NUConvertToPixel(sizes.maxSize.height).amount;
            if (mW !== -1 && w < mW ) {
                w = mW;
            }
            if (MW !== -1 && w > MW) {
                w = MW;
            }
            if (mH !== -1 && h < mH ) {
                h = mH;
            }
            if (MH !== -1 && h > MH) {
                h = MH;
            }

            bounds.width.amount = w;
            bounds.width.unit = "px";
            bounds.height.amount = h;
            bounds.height.unit = "px";

        }

        if (isDefined(this.nextPalette)) {
            this.updatePaletteBelow();
        }

    }


}