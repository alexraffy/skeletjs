import {
    Application,
    BaseClass, Border,
    BorderRadius, BorderSide, Bounds, Btn,
    Fill, fillParentBounds,
    generateV4UUID, isDefined,
    NavigationController, NUConvertToPixel, Point,
    px,
    safeCopy, setProps,
    Shadow,
    Size, View, ViewController, ViewStyle
} from "mentatjs";

import {kDockGroup} from "../Palettes/kDockGroup";
import {FloatingWindowDelegate} from "./FloatingWindowDelegate";
import {Session} from "../Session/Session";
import {ViewResizeDelegate} from "../Canvas/ViewResizeDelegate";


export class FloatingWindow extends BaseClass implements ViewResizeDelegate{
    id: string;


    protected _origin: Point = new Point(px(0), px(0));
    protected _minSize: Size = undefined;
    protected _maxSize: Size = undefined;
    protected _isToolWindow: boolean = false;
    protected _isDocked: boolean = false;
    protected _isModal: boolean = false;
    protected _dockId: string = "";
    protected _dockGroup: kDockGroup = kDockGroup.none;
    protected _resizeable: boolean = false;
    protected _size: Size;
    protected _rootView: View;

    protected _blackView: View;
    protected _viewBackground: View;

    protected _viewContainer: View;
    protected _viewTitleBar: View;
    protected _btnClose: Btn;
    protected _view: View;

    protected _viewResizeHandle: View;

    protected _navigationController: NavigationController;
    protected viewControllerClass: typeof ViewController;
    protected windowDelegate: FloatingWindowDelegate;

    protected heightForNormalWindow: number = 20;
    protected heightForUndockedToolbar: number = 15;
    protected heightForDockedToolbar: number = 10;


    inactiveBaseZIndex: number = 1000;
    activeBaseZIndex: number = 1010;

    constructor() {
        super();
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
                    isModal?: boolean
                } = {
                    isToolWindow: false,
                    resizeable: false,
                    dockGroup: kDockGroup.none,
                    isModal: false
                }) {

        this.id = id;
        this._origin = origin.copy();
        this._size = size.copy();
        this._rootView = rootView;
        this._isToolWindow = options.isToolWindow;
        this._minSize = isDefined(options.minSize) ? options.minSize.copy() : undefined;
        this._maxSize = isDefined(options.maxSize) ? options.maxSize.copy() : undefined;
        this._isModal = isDefined(options.isModal) ? options.isModal : false;
        this._resizeable = options.resizeable;

        this.dockGroup = options.dockGroup;
        this.initViews();
        this._navigationController = new NavigationController();
        this._navigationController.initNavigationControllerWithRootView("VC" + this.id, this._view);
        if (isDefined(options.windowDelegate)) {
            this.windowDelegate = options.windowDelegate;
        } else {
            this.windowDelegate = {
                viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                    viewController.keyValues["floatingWindow"] = this;

                    viewController["floatingWindow"] = this;

                    this._navigationController.present(viewController, {animated: false});
                },
                floatingWindowWasClosed: (id: string, ret: any) => {

                }
            }
        }
        Session.instance.FloatingWindows.push(this);
        if (isDefined(options.viewControllerClass)) {
            this.viewControllerClass = options.viewControllerClass;
            this._navigationController.instantiateViewController("VC"+this.id, this.viewControllerClass, this.windowDelegate);
        }
        this.setActive(false, false);

    }
    get navigationController(): NavigationController { return this._navigationController; }
    get isToolWindow(): boolean { return this._isToolWindow; }
    get isDocked(): boolean { return this._isDocked; }
    set isDocked(value: boolean) { this._isDocked = value;}
    get dockId(): string { return this._dockId; }
    set dockId(value: string) { this._dockId = value; }
    get dockGroup(): kDockGroup { return this._dockGroup;}
    set dockGroup(group: kDockGroup) { this._dockGroup = group;}
    get view(): View {
        return this._view;
    }

    titleBarHeight(): number {
        if (this.isToolWindow === true) {
            return (this.isDocked === true) ? this.heightForDockedToolbar : this.heightForUndockedToolbar;
        }
        return this.heightForNormalWindow;
    }

    contentSize(): Size {
        let size = this._size.copy();
        size.height = px(NUConvertToPixel(size.height).amount - this.titleBarHeight());
        return size;
    }

    heightIfDocked(): number {
        return this.heightForDockedToolbar + NUConvertToPixel(this.contentSize().height).amount;
    }

    possibleHeights(docked: boolean): {current: number, min: number, max: number} {
        if (docked) {
            return {
                current: this.heightIfDocked(),
                min: this.heightForDockedToolbar + (isDefined(this._minSize) ? NUConvertToPixel(this._minSize.height).amount : 0),
                max: this.heightForDockedToolbar + (isDefined(this._maxSize) ? NUConvertToPixel(this._maxSize.height).amount : NUConvertToPixel(Application.instance.rootView.getBounds("").height).amount - this.heightForDockedToolbar)
            }
        } else {
            return {
                current: NUConvertToPixel(this._size.height).amount,
                min: this.heightForUndockedToolbar + (isDefined(this._minSize) ? NUConvertToPixel(this._minSize.height).amount : 0),
                max: this.heightForUndockedToolbar + (isDefined(this._maxSize) ? NUConvertToPixel(this._maxSize.height).amount : NUConvertToPixel(Application.instance.rootView.getBounds("").height).amount - this.heightForUndockedToolbar)
            }
        }
    }


    get origin(): Point {
        return this._origin.copy();
    }

    get size(): Size {
        return this._size.copy();
    }

    setOriginAndSize(o: Point, s: Size) {
        this._origin = o.copy();
        this._size = s.copy();
        this.refreshPos();




    }

    setActive(value:boolean, propagate: boolean = true) {
        let base = 900;

        if (value) {
            base = this.activeBaseZIndex;
        } else {
            base = this.inactiveBaseZIndex;
        }
        this._viewBackground.getDefaultStyle().zIndex = base.toString();

        this._viewContainer.getDefaultStyle().zIndex = (base+1).toString();

        this._viewTitleBar.getDefaultStyle().zIndex = (base+2).toString();
        this._view.getDefaultStyle().zIndex = (base+2).toString();
        this._viewResizeHandle.getDefaultStyle().zIndex = (base+3).toString();

        this._viewBackground.setLayerHeight(base.toString());
        this._viewContainer.setLayerHeight((base+1).toString())
        this._viewTitleBar.setLayerHeight((base+2).toString());
        this._view.setLayerHeight((base+2).toString());
        this._viewResizeHandle.setLayerHeight((base+3).toString());

        if (propagate) {
            let wins = Session.instance.FloatingWindows;
            for (let i = 0; i < wins.length; i += 1) {
                let w = wins[i];
                if (w.id !== this.id) {
                    w.setActive(false, false);
                }
            }
        }

    }

    refreshPos() {
        this._viewBackground.doResizeFrameOnly();
        this._viewContainer.doResizeFrameOnly();
        this._viewTitleBar.doResizeFrameOnly();
        this._view.doResizeFrameOnly();
        this._viewResizeHandle.doResizeFrameOnly();
    }

    refresh() {
        if (this.isToolWindow === false) {
            this._viewBackground.borderRadius = new BorderRadius(5, 5, 5, 5);
            this._viewContainer.borderRadius = new BorderRadius(5, 5, 5, 5);
            this._viewTitleBar.borderRadius = new BorderRadius(5, 5, 0, 0);
            this._view.borderRadius = new BorderRadius(0, 0, 5, 5);
        } else {
            this._viewBackground.borderRadius = new BorderRadius(0, 0, 0, 0);
            this._viewContainer.borderRadius = new BorderRadius(0, 0, 0, 0);
            this._viewTitleBar.borderRadius = new BorderRadius(0, 0, 0, 0);
            this._view.borderRadius = new BorderRadius(0, 0, 0, 0);
        }
        this._viewBackground.processStyleAndRender("", []);
        this._viewContainer.processStyleAndRender("", []);
        this._viewTitleBar.processStyleAndRender("", []);

        this._btnClose.processStyleAndRender("", []);


        this._view.doResizeFrameOnly(true);

        this._viewResizeHandle.processStyleAndRender("", []);

        if (this.isDocked === true) {
            this._viewBackground.setVisible(false);
            this._btnClose.setVisible(false);
        } else {
            this._viewBackground.setVisible(true);
            this._btnClose.setVisible(true);
        }

    }

    protected initViews() {

        if (this._isModal === true) {
            let black = new View();
            black.boundsForView = function (parentBounds) {
                return fillParentBounds(parentBounds);
            }
            black.fills = [new Fill(true, "color", "normal", "rgba(0, 0, 0, 0.5)")];
            black.getDefaultStyle().zIndex = (this.activeBaseZIndex -1).toString();
            black.initView(generateV4UUID());
            Application.instance.rootView.attach(black);
            this._blackView = black;

        }


        this._viewBackground = new View();
        this._viewBackground.boundsForView = (parentBounds: Bounds) => {
            return new Bounds(
                NUConvertToPixel(this._origin.x).amount - 1,
                NUConvertToPixel(this._origin.y).amount - 1,
                NUConvertToPixel(this._size.width).amount + 2,
                NUConvertToPixel(this._size.height).amount + 2
            )
        };
        this._viewBackground.dontCacheStyle = true;
        this._viewBackground.fills = [new Fill(true, "gradient", "normal", "linear-gradient(\n" +
            "to bottom,\n" +
            "rgba(134, 134, 134, 1.0),\n" +
            "rgba(84, 84, 84, 1.0)\n" +
            ")")];
        this._viewBackground.viewWasAttached = () => {


        }


        this._viewBackground.initView(`fw_${this.id}_viewBackground`);
        this._rootView.attach(this._viewBackground);

        this._viewContainer = new View();
        this._viewContainer.dontCacheStyle = true;
        this._viewContainer.boundsForView = ( parentBounds) => {
            return new Bounds(
                NUConvertToPixel(this._origin.x).amount,
                NUConvertToPixel(this._origin.y).amount,
                NUConvertToPixel(this._size.width).amount,
                NUConvertToPixel(this._size.height).amount
            )
        }
        this._viewContainer.viewWasAttached = () => {
            this._viewTitleBar = new View();
            this._viewTitleBar.boundsForView = (parentBounds) => {
                return new Bounds(0, 0,
                    NUConvertToPixel(this._size.width).amount, this.titleBarHeight());
            }
            this._viewTitleBar.viewWasAttached = () => {
                let btn = new Btn();
                btn.boundsForView = (parentBounds) => {
                    if (this.isToolWindow === false) {
                        return new Bounds(5, 5, 10, 10);
                    } else {
                        return new Bounds(5, NUConvertToPixel(parentBounds.height).amount / 2 - 6 / 2, 6, 6);
                    }
                }
                btn.isFullyRound = true;
                btn.fontFamily = 'FontAwesome5ProRegular';
                btn.fontSize = 9;
                btn.initView(generateV4UUID());
                this._viewTitleBar.attach(btn);
                btn.setAction(() => {
                    this.close({"valid":false});
                });
                this._btnClose = btn;
            }
            this._viewTitleBar.dontCacheStyle = true;
            this._viewTitleBar.fills = [new Fill(true, "gradient", "normal", "linear-gradient(0deg, rgb(54, 54, 54), rgb(65, 65, 65))")];
            this._viewTitleBar.borders = [new Border(true, 1, "solid", "rgba(20,20,20,0.4)",BorderSide.bottom)];
            this._viewTitleBar.initView(`fw_${this.id}_viewTitleBar`);
            this._viewContainer.attach(this._viewTitleBar);


            this._view = new View();
            this._view.boundsForView = (parentBounds) => {
                return new Bounds(0,
                    0 + this.titleBarHeight(),
                    NUConvertToPixel(this.contentSize().width).amount,
                    NUConvertToPixel(this.contentSize().height).amount);
            }
            let viewStyle = setProps(new ViewStyle(),
                {
                    fills: [new Fill(true, "color", "normal", Session.instance.theme.panelBackgroundColor)],
                    overflow: "hidden"
                } as ViewStyle);

            if (this.isToolWindow === false) {
                viewStyle.borderRadius = new BorderRadius(0, 0, 5, 5);
            }
            this._view.styles = [viewStyle];
            this._view.dontCacheStyle = true;
            this._view.initView(`fw_${this.id}_wv`);
            this._viewContainer.attach(this._view);

            this._view.setClickDelegate({
                onClick: () => {
                    this.setActive(true, true);
                }
            }, "onClick");
        }
        this._viewContainer.initView(`fw_${this.id}_viewBackground`)
        this._rootView.attach(this._viewContainer);


        this._viewTitleBar.isDraggable = true;
        this._viewTitleBar.setDraggable(true);
        this._viewTitleBar.dragDelegate = this;


        this._viewResizeHandle = new View();
        this._viewResizeHandle.boundsForView = (parentBounds) => {
            return new Bounds(
                NUConvertToPixel(this._origin.x).amount + NUConvertToPixel(this.contentSize().width).amount - 10,
                NUConvertToPixel(this._origin.y).amount + this.titleBarHeight() + NUConvertToPixel(this.contentSize().height).amount - 10,
                0,
                0);
        }
        this._viewResizeHandle.dontCacheStyle = true;
        this._viewResizeHandle.getDefaultStyle().extraCss = "border-bottom: 10px solid black;border-left: 10px solid transparent;";
        this._viewResizeHandle.initView(`fw_${this.id}_handle`);
        this._rootView.attach(this._viewResizeHandle);
        this._viewResizeHandle.isDraggable = true;
        this._viewResizeHandle.setDraggable(true);


        this._viewResizeHandle.dragDelegate = {
            //@ts-ignore
            viewRef: this,
            viewWillBeDragged(parentView: View, options?: { event: Event }): any {
                (this.viewRef as FloatingWindow).viewWillBeResized(this.viewRef._view);
            },
            viewIsBeingDragged(view: View, options?: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }): any {
                let fw = (this.viewRef as FloatingWindow);
                let o = fw.origin.copy();
                let s = fw.size.copy();
                s.height.amount -= options.offsetY;
                s.width.amount -= options.offsetX;
                if (s.width.amount < 30) {
                    s.width.amount = 30;
                }
                if (s.height.amount < fw.titleBarHeight() + 10) {
                    s.height.amount = fw.titleBarHeight() + 10;
                }
                let b = new Bounds(
                    NUConvertToPixel(o.x).amount, NUConvertToPixel(o.y).amount, NUConvertToPixel(s.width).amount, NUConvertToPixel(s.height).amount);
                (this.viewRef as FloatingWindow).viewIsBeingResized(this.viewRef._view, b, options);
                o.set(px(NUConvertToPixel(b.x).amount), px(NUConvertToPixel(b.y).amount));
                s = new Size(px(NUConvertToPixel(b.width).amount), px(NUConvertToPixel(b.height).amount));
                fw.setOriginAndSize(o, s);

                fw._view.doResize(true);
            },
            viewWasDragged(view: View, options?: { event: Event; x: number; y: number }): any {

            }
        };


    }


    close(ret: any) {
        if (isDefined(this._navigationController)) {
            this._navigationController.destroy();
            this._navigationController = undefined;
        }
        if (isDefined(this._blackView)) {
            this._blackView.detachItSelf();
        }

        this._viewTitleBar.setDraggable(false);

        this._viewBackground?.detachItSelf();
        this._viewResizeHandle?.detachItSelf();
        this._view?.detachItSelf();
        this._viewTitleBar?.detachItSelf()
        this._viewContainer?.detachItSelf();
        this._viewBackground = null;
        this._viewResizeHandle = null;
        this._viewTitleBar = null;
        this._viewContainer = null;
        this._view = null;

        if (isDefined(this.windowDelegate) && isDefined(this.windowDelegate.floatingWindowWasClosed)) {
            this.windowDelegate.floatingWindowWasClosed(this.id, ret);
        }
        let idx = -1;
        for (let i = 0; i < Session.instance.FloatingWindows.length; i += 1) {
            if (Session.instance.FloatingWindows[i].id === this.id) {
                idx = i;
                break;
            }
        }
        if (idx > -1) {
            Session.instance.FloatingWindows.splice(idx, 1);
        }
    }


    resizeTo(size: Size) {
        this._size = size.copy();
        this.refresh();
    }

    viewWillBeDragged(parentView: View, options?: { event: Event }): any {
        this.setActive(true);

    }

    viewIsBeingDragged(view: View, options?: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }): any {
        let origin = this.origin;
        let x = px(NUConvertToPixel(origin.x).amount - options.offsetX);
        let y = px(NUConvertToPixel(origin.y).amount - options.offsetY);
        let size = this.size;
        this.setOriginAndSize(new Point(x, y), new Size(size.width, size.height));




    }
    viewWasDragged(view: View, options?: { event: Event; x: number; y: number }): any {


    }

    viewWillBeResized(view: View) {

    }

    viewIsBeingResized(view: View, bounds: Bounds, eventData: { event: Event; x: number; y: number; offsetX: number; offsetY: number; mouseVelocity: { linear: number; x: number; y: number } }) {

    }
    viewWasResized(view: View) {

    }

}