
import {generateViewClass} from "./generateViewClass";
import {SkeletComponent} from "./SkeletComponent";
import {SkeletControl} from "./SkeletControl";


export function generateControlFromComponent(component: SkeletComponent, className: string, name: string, options: { isReact: boolean, React: any, ReactDOM: any, Babel: any}): SkeletControl {
    let viewClass = generateViewClass(component, undefined, options);
    let sk = new SkeletControl(className, name, viewClass );
    sk.componentID = component.id;
    return sk;
}
