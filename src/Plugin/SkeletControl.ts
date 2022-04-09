



// a control is a drag'n'drop single or multiple layer(s) with custom properties stored in a Skelet Plugin
import {Layer} from "../Layer/Layer";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Bounds, isDefined, View} from "mentatjs";
import {SkeletBlock} from "../Layer/SkeletBlock";

export class SkeletControl {

    className: string = "";
    name: string = "";
    controlClass: any = undefined;
    blockClass: any = undefined;
    isBlock: boolean = false;
    iconFactory: (layer: Layer, bounds: Bounds) => View = undefined;
    pluginName: string;
    pluginGroup: string;
    pluginGuid: string;

    componentID?: string;

    constructor (className: string, name: string, controlClass: any, isBlock: boolean = false) {
        this.className = className;
        this.name = name;
        this.isBlock = isBlock;
        if (isBlock === false) {
            this.controlClass = controlClass;
            this.blockClass = undefined;
            let v: View & ILayoutEditorView = Object.assign(new controlClass(), {});
            if (isDefined(v.layoutEditorListIcon)) {
                this.iconFactory = v.layoutEditorListIcon();
            }
        } else {
            this.controlClass = undefined;
            this.blockClass = controlClass;
            let b: SkeletBlock = Object.assign(new controlClass(), {});

        }



    }



}
