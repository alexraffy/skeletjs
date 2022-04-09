// A component is a drag'n'drop single layer control generated at runtime from a NPM library and user-code


import {LayerProperty} from "mentatjs";

export class SkeletComponent {
    kind: "SkeletComponent";
    id: string = "";
    componentName: string = "";
    deps: string[] = [];
    includesViewProperties: boolean = false;
    includesTextStyleProperties: boolean = false;
    customProperties: LayerProperty[] = [];
    selectedFramework: string = "";
    functions: {id:string, value: string}[] = [];
}



