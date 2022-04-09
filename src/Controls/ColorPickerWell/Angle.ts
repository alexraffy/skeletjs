import {
    BorderRadius,
    Bounds,
    Fill,
    isDefined,
    NUConvertToPixel,
    PXBounds,
    View,
    ViewStyle
} from "mentatjs";
import {SkLogger} from "../../Logging/SkLogger";


export class Angle extends View {

    angle: number;
    protected circle: View;
    protected handle: View;



    viewWasAttached(): void {
        super.viewWasAttached();
        let circle = new View();
        circle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 5,
                y: 5,
                width: parentBounds.width - 10,
                height: parentBounds.width - 10,
                unit: 'px',
                position: 'absolute'
            };
        };
        circle.viewWasAttached = function () {
            let c = new View();
            c.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 2,
                    y: 2,
                    width: parentBounds.width - 4,
                    height: parentBounds.height - 4,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            let radius = (this.getBounds("").width - 4) / 2;
            c.borderRadius = new BorderRadius(radius, radius, radius, radius);
            c.fills = [new Fill(true, 'color', 'normal', "rgb(255,255,255,1)")];
            c.initView(this.id + ".c");
            this.attach(c);

        }
        circle.fills = [new Fill(true, 'color', 'normal', "rgba(150, 150, 150, 1.0)")];
        //circle.borders = [new Border(true, 3, 'solid', kGreyTint.enabled.active.primaryColor)];
        let radius = 10; //(bounds.width.amount - 10) / 2;
        circle.borderRadius = new BorderRadius(radius, radius, radius, radius);
        circle.initView(this.id + ".circle");
        this.attach(circle);

        let handle = new View();
        handle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {

            let angle = (this.parentView.angle - 90) * Math.PI / 180.0;

            let centerOfCircle = 5 + (parentBounds.width - 10) / 2;
            let radius = (parentBounds.width - 10) / 2;
            let posX = radius * Math.cos(angle);
            let posY = radius * Math.sin(angle);

            return {
                x: centerOfCircle + posX - 5,
                y: centerOfCircle + posY - 5,
                width: 10,
                height: 10,
                unit: 'px',
                position: 'absolute'
            };
        };
        handle.viewWasAttached = function () {
            let inside = new View();
            inside.pxBoundsForView= function(parentBounds: PXBounds): PXBounds {
                return {
                    x: 2,
                    y: 2,
                    width: parentBounds.width - 4,
                    height: parentBounds.height - 4,
                    unit: 'px',
                    position: 'absolute'
                }
            }
            inside.fills = [new Fill(true, 'color', 'normal', 'rgba(255,255,255,1)')];
            inside.borderRadius = new BorderRadius(3,3,3,3);
            inside.initView(this.id + ".inside");
            this.attach(inside);
        }
        handle.fills = [new Fill(true, 'color', 'normal', "rgba(150, 150, 150, 1.0)")];
        handle.borderRadius = new BorderRadius(5, 5, 5, 5);
        // handle.borders = [new Border(true, 2, 'solid', kBlueTint.enabled.active.primaryColor)];

        handle.initView(this.id + ".handle");
        this.attach(handle);

        this.circle = circle;
        this.handle = handle;

        this.handle.viewIsBeingDragged = function (view: View, options?: any) {
            if (options && options.mouseVelocity) {

                let angle = this.parentView.angle;
                let velocity = (options.mouseVelocity.linear / 50.00);
                let vecX = options.offsetX;
                let vecY = options.offsetY;
                let add: number = 0;
                SkLogger.write(`vec(${vecX},${vecY}) velocity(${velocity})`);
                if (angle >= 0) {
                    if (vecY > 0) {
                        add = velocity
                    } else {
                        add = -velocity;
                    }
                }
                if (angle < 0) {
                    if (vecY > 0) {
                        add = -velocity;
                    } else {
                        add = velocity;
                    }
                }


                this.parentView.angle = parseInt((this.parentView.angle - add).toString());
                if (this.parentView.angle > 360) {
                    this.parentView.angle = 360;
                }
                if (this.parentView.angle < -360) {
                    this.parentView.angle = -360;
                }
                // SkLogger.write(this.parentView.angle);
                (this as View).invalidateBounds();
                (this as View).processStyleAndRender("", []);

                if (isDefined(this.parentView.actionDelegate) && isDefined(this.parentView.actionDelegateEventName) && isDefined(this.parentView.actionDelegate[this.parentView.actionDelegateEventName])) {
                    this.parentView.actionDelegate[this.parentView.actionDelegateEventName](this.parentView, this.parentView.angle);
                }

            }
        }
        this.handle.setDraggable(true);
        this.handle.dragDelegate = this.handle;

        this.circle.setClickDelegate({
            angleRef: this,
            onClick(sender, options) {
                let evt: MouseEvent = <MouseEvent>event;
                let angle = this.angleRef.angle;
                let circleBounds = this.angleRef.circle.getDiv().getBoundingClientRect();
                let offsetX = Math.abs(circleBounds.left - evt.clientX);
                let offsetY = Math.abs(circleBounds.top - evt.clientY);

                SkLogger.write(`circleBounds.${circleBounds.left},${circleBounds.top} evt.client${evt.clientX},${evt.clientY} offset=${offsetX},${offsetY}`);


                // calculate angle for click
                let bounds = this.angleRef.circle.getBounds("");
                let centerOfCircle = 5 + (bounds.width - 10) / 2;
                let radius = (bounds.width - 10) / 2;
                let posX = radius * Math.cos(angle);
                let posY = radius * Math.sin(angle);

                let delta_x = offsetX - centerOfCircle;
                let delta_y = offsetY - centerOfCircle;
                let theta_radians = Math.atan2(delta_y, delta_x);

                let newAngle = parseInt((theta_radians * 180 / Math.PI).toString()) + 90;

                this.angleRef.angle = newAngle;
                this.angleRef.doResize();
                if (isDefined(this.angleRef.actionDelegate) && isDefined(this.angleRef.actionDelegateEventName) && isDefined(this.angleRef.actionDelegate[this.angleRef.actionDelegateEventName])) {
                    this.angleRef.actionDelegate[this.angleRef.actionDelegateEventName](this.angleRef, this.angleRef.angle);
                }

            }
        }, "onClick");


    }


    render(parentBounds?: Bounds, style?: ViewStyle): void {
        super.render(parentBounds, style);
        let radius = (NUConvertToPixel(this.cachedStyle.bounds.width).amount - 10) / 2;
        //this.circle.borderRadius = new BorderRadius(radius, radius, radius, radius);
        this.circle.processStyleAndRender("parentView", [{kind: "ViewStyle", borderRadius: new BorderRadius(radius, radius, radius, radius) }]);

    }

    renderDEPREC() {
        let bounds = this.getBounds("");
        this.detachAllChildren();

        let circle = new View();
        circle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 5,
                y: 5,
                width: parentBounds.width - 10,
                height: parentBounds.width - 10,
                unit: 'px',
                position: 'absolute'
            };
        };
        circle.viewWasAttached = function () {
            let c = new View();
            c.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: 2,
                    y: 2,
                    width: parentBounds.width - 4,
                    height: parentBounds.height - 4,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            let radius = (this.getBounds("").width - 4) / 2;
            c.borderRadius = new BorderRadius(radius, radius, radius, radius);
            c.fills = [new Fill(true, 'color', 'normal', "rgb(255,255,255,1)")];
            c.initView(this.id + ".c");
            this.attach(c);

        }
        circle.fills = [new Fill(true, 'color', 'normal', "rgba(150, 150, 150, 1.0)")];
        //circle.borders = [new Border(true, 3, 'solid', kGreyTint.enabled.active.primaryColor)];
        let radius = (bounds.width.amount - 10) / 2;
        circle.borderRadius = new BorderRadius(radius, radius, radius, radius);
        circle.initView(this.id + ".circle");
        this.attach(circle);

        let handle = new View();
        handle.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {

            let angle = (this.parentView.angle - 90) * Math.PI / 180.0;

            let centerOfCircle = 5 + (parentBounds.width - 10) / 2;
            let radius = (parentBounds.width - 10) / 2;
            let posX = radius * Math.cos(angle);
            let posY = radius * Math.sin(angle);

            return {
                x: centerOfCircle + posX - 5,
                y: centerOfCircle + posY - 5,
                width: 10,
                height: 10,
                unit: 'px',
                position: 'absolute'
            };
        };
        handle.viewWasAttached = function () {
            let inside = new View();
            inside.pxBoundsForView= function(parentBounds: PXBounds): PXBounds {
                return {
                    x: 2,
                    y: 2,
                    width: parentBounds.width - 4,
                    height: parentBounds.height - 4,
                    unit: 'px',
                    position: 'absolute'
                }
            }
            inside.fills = [new Fill(true, 'color', 'normal', 'rgba(255,255,255,1)')];
            inside.borderRadius = new BorderRadius(3,3,3,3);
            inside.initView(this.id + ".inside");
            this.attach(inside);
        }
        handle.fills = [new Fill(true, 'color', 'normal', "rgba(150, 150, 250, 1.0)")];
        handle.borderRadius = new BorderRadius(5, 5, 5, 5);
        // handle.borders = [new Border(true, 2, 'solid', kBlueTint.enabled.active.primaryColor)];

        handle.initView(this.id + ".handle");
        this.attach(handle);

        this.circle = circle;
        this.handle = handle;

        this.handle.viewIsBeingDragged = function (view: View, options?: any) {
            if (options && options.mouseVelocity) {

                let angle = this.parentView.angle;
                let velocity = (options.mouseVelocity.linear / 50.00);
                let vecX = options.offsetX;
                let vecY = options.offsetY;
                let add: number = 0;
                SkLogger.write(`vec(${vecX},${vecY}) velocity(${velocity})`);
                if (angle >= 0) {
                    if (vecY > 0) {
                        add = velocity
                    } else {
                        add = -velocity;
                    }
                }
                if (angle < 0) {
                    if (vecY > 0) {
                        add = -velocity;
                    } else {
                        add = velocity;
                    }
                }


                this.parentView.angle = parseInt((this.parentView.angle - add).toString());
                if (this.parentView.angle > 360) {
                    this.parentView.angle = 360;
                }
                if (this.parentView.angle < -360) {
                    this.parentView.angle = -360;
                }
                // SkLogger.write(this.parentView.angle);
                this.doResize();

                if (isDefined(this.parentView.actionDelegate) && isDefined(this.parentView.actionDelegateEventName) && isDefined(this.parentView.actionDelegate[this.parentView.actionDelegateEventName])) {
                    this.parentView.actionDelegate[this.parentView.actionDelegateEventName](this.parentView, this.parentView.angle);
                }

            }
        }
        this.handle.setDraggable(true);
        this.handle.dragDelegate = this.handle;

        this.circle.setClickDelegate({
            angleRef: this,
            onClick(sender, options) {
                let evt: MouseEvent = <MouseEvent>event;
                let angle = this.angleRef.angle;
                let circleBounds = this.angleRef.circle.getDiv().getBoundingClientRect();
                let offsetX = Math.abs(circleBounds.left - evt.clientX);
                let offsetY = Math.abs(circleBounds.top - evt.clientY);

                SkLogger.write(`circleBounds.${circleBounds.left},${circleBounds.top} evt.client${evt.clientX},${evt.clientY} offset=${offsetX},${offsetY}`);


                // calculate angle for click
                let bounds = this.angleRef.circle.getBounds("");
                let centerOfCircle = 5 + (bounds.width - 10) / 2;
                let radius = (bounds.width - 10) / 2;
                let posX = radius * Math.cos(angle);
                let posY = radius * Math.sin(angle);

                let delta_x = offsetX - centerOfCircle;
                let delta_y = offsetY - centerOfCircle;
                let theta_radians = Math.atan2(delta_y, delta_x);

                let newAngle = parseInt((theta_radians * 180 / Math.PI).toString()) + 90;

                this.angleRef.angle = newAngle;
                this.angleRef.doResize();
                if (isDefined(this.angleRef.actionDelegate) && isDefined(this.angleRef.actionDelegateEventName) && isDefined(this.angleRef.actionDelegate[this.angleRef.actionDelegateEventName])) {
                    this.angleRef.actionDelegate[this.angleRef.actionDelegateEventName](this.angleRef, this.angleRef.angle);
                }

            }
        }, "onClick");





    }




}