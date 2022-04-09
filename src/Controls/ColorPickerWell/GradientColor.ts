import {Bounds, Color, generateV4UUID, GradientData, isDefined, pt, PXBounds, View, ViewStyle} from "mentatjs";
import {SkLogger} from "../../Logging/SkLogger";



export interface GradientColorDelegate {
    gradientColorStepWasSelected?(gradientColor: GradientColor, gradientData: GradientData, stepIndex: number);
    gradientColorStepWasDeleted?(gradientColor: GradientColor, gradientData: GradientData);
    gradientColorStepHasChanged?(gradientColor: GradientColor, gradientData: GradientData, stepIndex: number);
}

export class GradientColor extends View {

    gradientData: GradientData;
    abortClickEvent: boolean = false;

    delegate: GradientColorDelegate;

    viewWasAttached() {
        this.setClickDelegate(this, "onAddStep");
    }

    onAddStep(sender, options) {
        if (this.abortClickEvent === true) {
            return;
        }
        let bounds = this.getBounds("");
        let pos = options.clientX;
        let box = this.getDiv().getBoundingClientRect();
        let position = parseInt((parseFloat((pos - box.left).toString()) / parseFloat(bounds.width.toString()) * 100.00).toString());

        let color = new Color("color", "rgba(150,150,200,1)");

        let newStep = {
            id: generateV4UUID(),
            percentage: position,
            color: color
        };

        let index = 0;
        for (let i = 0; i < this.gradientData.steps.length; i += 1) {
            if (this.gradientData.steps[i].percentage < position) {
                index = i + 1;
            }
        }
        this.gradientData.steps.splice(index, 0, newStep);
        this.render();
        if (this.delegate) {
            if (this.delegate.gradientColorStepHasChanged) {
                this.delegate.gradientColorStepHasChanged(this, this.gradientData, index);
            }
        }

    }

    render(parentBounds?: Bounds, style?: ViewStyle): void {

        this.detachAllChildren();

        if (!isDefined(this.gradientData)) {
            return;
        }
        // linear-gradient(to right, rgba(30,87,153,1) 7%,rgba(41,137,216,1) 50%,rgba(32,124,202,1) 51%,rgba(125,185,232,1) 100%);
        let gradient = "linear-gradient(";
        gradient += 'to right';
        gradient += ", ";

        for (let i = 0; i < this.gradientData.steps.length; i += 1) {
            gradient += Color.rgba(this.gradientData.steps[i].color).stringValue + " " + this.gradientData.steps[i].percentage + "%";
            if (i < this.gradientData.steps.length - 1) {
                gradient += ", ";
            }
            let thumb: View & { index: number; stepRef: { id: string, percentage: number, color: Color } } = Object.assign(new View(), {
                index: 0,
                stepRef: undefined
            });
            thumb.index = i;
            thumb.stepRef = this.gradientData.steps[i];
            thumb.fills = [{active: true, type: 'color', blendMode: 'normal', value: "rgb(255,255,255)"}];
            thumb.borderRadius = {tl: pt(3), tr: pt(3), bl: pt(3), br: pt(3)};
            thumb.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                let x = parseInt((parseFloat(this.stepRef.percentage.toString()) / 100.0 * parseFloat(parentBounds.width.toString())).toString());
                if ((x >= parseInt(parentBounds.width.toString())) || (x + 10 > parseInt(parentBounds.width.toString()))) {
                    x = parseInt(parentBounds.width.toString()) - 10;
                }
                return {
                    x: x,
                    y: 0,
                    width: 10,
                    height: parseInt(parentBounds.height.toString()),
                    unit: 'px',
                    position: 'absolute'
                };
            };
            thumb.viewWasAttached = function () {
                let color = new View();
                color.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                    return {
                        x: 2,
                        y: 2,
                        width: 6,
                        height: parseInt(parentBounds.height.toString()) - 4,
                        unit: "px",
                        position: 'absolute'
                    };
                };
                color.fills = [{active: true, type: 'color', blendMode: 'normal', value: Color.rgba(this.stepRef.color).stringValue}];
                color.initView(this.id + ".color");
                this.attach(color);
            };
            thumb.initView(this.id + ".step." + i);
            this.attach(thumb);
            thumb.dragDelegate = thumb;
            thumb.viewWillBeDragged = function (parentView, options) {
                this.parentView.abortClickEvent = true;
                if (this.parentView.delegate) {
                    if (this.parentView.delegate.gradientColorStepWasSelected) {
                        this.parentView.delegate.gradientColorStepWasSelected(this, this.parentView.gradientData, this.index);
                    }
                }
            };
            thumb.viewIsBeingDragged = function (view, newPosition) {
                let position = 0;
                if (newPosition.x < 0) {
                    position = 0;
                } else if (newPosition.x + 10 > this.parentView.bounds.width) {
                    position = 100;
                } else {
                    position = parseInt((parseFloat(newPosition.x.toString()) / parseFloat(this.parentView.bounds.width.toString()) * 100).toString());
                }
                this.stepRef.percentage = position;
                // reforce placement
                this.doResize();
                this.parentView.recalculateGradient();
                if (this.parentView.delegate) {
                    if (this.parentView.delegate.gradientColorStepHasChanged) {
                        this.parentView.delegate.gradientColorStepHasChanged(this, this.parentView.gradientData, this.index);
                    }
                }
            };
            thumb.viewWasDragged = function (view) {
                let ptr = this.parentView;
                setTimeout(function () {
                    ptr.abortClickEvent = false;
                }, 100);

            };
            thumb.dragDelegate = thumb;
            thumb.setDraggable(true);
        }
        gradient += ")";
        SkLogger.write(gradient);
        let st: ViewStyle = this.getDefaultStyle();
        st.fills = [{active: true, type: 'css', blendMode: 'normal', value: 'background: ' + gradient}];
        //this.viewStyleRender();
        super.render(parentBounds, style);
        //this.getDiv().style.background = gradient;

    }

    recalculateGradient() {
        if (!isDefined(this.gradientData.steps)) {
            return;
        }
        // linear-gradient(to right, rgba(30,87,153,1) 7%,rgba(41,137,216,1) 50%,rgba(32,124,202,1) 51%,rgba(125,185,232,1) 100%);
        let gradient = "linear-gradient(";
        gradient += 'to right';
        gradient += ", ";
        for (let i = 0; i < this.gradientData.steps.length; i += 1) {
            gradient += Color.rgba(this.gradientData.steps[i].color).stringValue + " " + this.gradientData.steps[i].percentage + "%";
            if (i < this.gradientData.steps.length - 1) {
                gradient += ", ";
            }
        }
        gradient += ")";
        SkLogger.write(gradient);
        let st: ViewStyle = this.cachedStyle;
        st.fills = [{active: true, type: 'css', blendMode: 'normal', value: 'background: ' + gradient}];
        this.render();

        this.getDiv().style.background = gradient;
    }

}