import {ISize} from "mentatjs";
import {ISkeletScriptBundle} from "../Document/ISkeletScriptBundle";
import {IFunction} from "../Compiler/IFunction";
import {LayerData} from "../Layer/LayerData";


export interface SkeletComponentV2 {
    kind: "SkeletComponentV2";
    // Unique id
    id: string;
    // class identifier
    className: string;
    // Public name for the component
    componentName: string;
    // is the component a layer or is it in code
    type: "layer" | "code";
    codeType: "HTML" | "HTMLElement" | "React" | "Vue" | "MentatJS";
    // NPM dependencies
    deps: {package: string, version: string}[];
    // default size of the control when dropped on a form
    defaultSize: ISize;
    // does the control expose View properties (fill,border,shadow...)
    includesViewProperties: boolean;
    // does the control expose TextStyle properties (font, color, alignment...)
    includesTextStyleProperties: boolean;

    instance: ISkeletScriptBundle;

    // script bundle containing functions to interact with the editor
    integration: ISkeletScriptBundle;

    // return a list of events the component can receive
    functions: IFunction[]

    // return the id of the functions to create automatically on dropping the component on the form
    defaultFunctions: string[];

    // if the component is a hierarchy of layers
    layerData: LayerData;

}

