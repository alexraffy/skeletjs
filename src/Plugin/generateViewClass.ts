import {
    Application,
    Bounds,
    boundsWithPixels,
    isDefined,
    Label,
    LayerProperty,
    safeCopy,
    ViewStyle
} from "mentatjs";
import {requireFromLocalCache} from "../NPM/requireFromLocalCache";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {SkLogger} from "../Logging/SkLogger";
import {SkeletComponent} from "./SkeletComponent";
import {applyTextStyleProperties} from "../Layer/applyTextStyleProperties";



export function generateViewClass(component: SkeletComponent, propTests: LayerProperty[], options: { isReact: boolean, React: any, ReactDOM: any, Babel: any} ): any {
    let props: LayerProperty[] = [];
    for (let i = 0; i < component.customProperties.length; i += 1) {
        let l = new LayerProperty();
        l.id = component.customProperties[i].id;
        l.property_id = component.customProperties[i].property_id;
        l.title = component.customProperties[i].title;
        l.type = component.customProperties[i].type;
        l.group = component.customProperties[i].group;
        l.dataSource = component.customProperties[i].dataSource;
        l.value = component.customProperties[i].value;
        props.push(l);
        if (propTests) {
            let v = propTests.find((elem) => { return elem.property_id === l.property_id;});
            if (v) {
                l.value = v.value;
            }
        }
    }


    return Label.extend({ //ViewWithTextStyle.extend({
        nodeId: "",
        nodeRef: undefined,
        isNodeTitle: false,
        isLayoutEditor: true,
        isSymbol: false,
        symbolID: undefined,

        includesViewStyle: component.includesViewProperties,
        includeTextViewStyle: component.includesTextStyleProperties,
        //propsDefs: propDefs,
        isReact: isDefined(options.isReact),
        props: safeCopy(props),
        isComponentEditor: (isDefined(propTests)),

        layoutEditorPositioning: function (containerNode: Layer, x: number, y: number, node: Layer): Bounds {
            return boundsWithPixels({
                x: x,
                y: y,
                width: 100,
                height: 100,
                unit: 'px',
                position: 'absolute'
            });
        },

        exportProperties: function(layoutEditorVersion: string): any[] {
            let ret: LayerProperty[] = [];
            if (this.includesViewStyle) {
                ret.push(...viewStyleProperties(true));
            }
            //if (this.includeTextViewStyle) {
            //
            //}
            for (let i = 0; i < this.props.length; i += 1) {
                ret.push(this.props[i]);
            }
            return ret;
        },

        applyLayoutProperty: function (property_id: string, value: any) {
            if (this.includesViewStyle) {
                this.viewStyleApplyProperties(property_id, value);
            }
            if (property_id === 'label.textStyle') {
                applyTextStyleProperties(this, property_id, value);
            }

            let prop = this.props.find( (p) => { return p.property_id === property_id;});
            if (prop) {
                prop.value = value;
            }
        },

        renderFunction: component.functions.find((elem) => { return elem.id === "render";}).value,
        viewWasAttachedFunction: component.functions.find((elem) => { return elem.id === "viewWasAttached";}).value,
        requireFunction: component.functions.find((elem) => { return elem.id === "require";}).value,

        viewStyleApplyProperties: viewStyleApplyProperties,

        render(parentBounds?: Bounds, style?: ViewStyle) {
            this.text = "";
            super.render(parentBounds, style);

            if (this.isReact === true) {
                const React = options.React;
                const ReactDOM = options.ReactDOM;
                const Babel = options.Babel;

                options.ReactDOM.unmountComponentAtNode(this.getDiv());
                let CustomReactControl = function () {};
                let controlName = "CustomReactControl";
                let code = "CustomReactControl = function (props) {" + requireFromLocalCache(this.requireFunction) + "\r\n" + this.renderFunction + "}";


                try {
                    var output = options.Babel.transform(code, { presets: ['react'] }).code;
                    SkLogger.write("result ", output);
                    eval(output);

                    let props: {} = {};
                    for (let i = 0; i < this.props.length; i += 1) {
                        SkLogger.write("prop ", this.props[i]);
                        props[this.props[i].property_id] = this.props[i].value;
                        SkLogger.write(`props.${this.props[i].property} = ${props[this.props[i].property_i]}`);
                    }

                    options.ReactDOM.render(options.React.createElement(CustomReactControl, props), this.getDiv());

                } catch (e) {
                    Application.instance.notifyAll(this, "noticeComponentCrashed", {componentInstance: this, error: e, errorMessage: e.message, inEditor: this.isComponentEditor});
                }
            } else {
                try {
                    let myFunction = function () {};
                    eval("myFunction = () => { " + this.renderFunction + "}");
                    myFunction();
                } catch (error) {
                    Application.instance.notifyAll(this, "noticeComponentCrashed", {componentInstance: this, error: error, errorMessage: error.message, inEditor: this.isComponentEditor});
                }
            }
        }
    });

}
