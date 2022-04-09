import {
    assert,
    Bounds,
    generateV4UUID,
    instanceOfBounds,
    instanceOfLayerProperty,
    isDefined, LayerProperty,
    View
} from "mentatjs";

import {generateViewClass} from "./generateViewClass";
import {SkeletComponent} from "./SkeletComponent";
import {instanceOfSkeletComponent} from "../Guards/InstanceOfSkeletComponent";


export function previewComponent(component: SkeletComponent, bounds: Bounds,propTests: LayerProperty[], options: { isReact: boolean, React: any, ReactDOM: any, Babel: any} ): View {
    assert(
        instanceOfSkeletComponent(component) &&
        instanceOfBounds(bounds) && isDefined(propTests) &&
        propTests.every ( (p) => { return instanceOfLayerProperty(p);}),
        "previewComponent expects a SkeletComponent, Bounds, LayerProperty[]"
    );
    let viewClass = generateViewClass(component,propTests,options);
    if (!isDefined(viewClass)) {
        viewClass = View;
    }
    let v: View = Object.assign(new viewClass(), {});
    v.keyValues["selectedBounds"] = bounds;
    v.boundsForView = function (parentBounds: Bounds): Bounds {
        return this.keyValues["selectedBounds"] as Bounds;
    };
    v.initView(generateV4UUID());
    return v;
}
