import {Anchor, Anchors, Bounds, generateV4UUID, LayerProperty} from "mentatjs";
import {LayerState} from "./LayerState";
import {LayerInteraction} from "./LayerInteraction";
import {Driver} from "../Animation/Driver";
import {LayerSymbolProperty} from "./LayerSymbolProperty";
import {ISkeletScript} from "../Document/ISkeletScript";
import {kTargetKind} from "../Compiler/kTargetKind";




export class LayerData {
    kind: string = "LayerData";
    parent_id: string = "";
    id: string = "";
    title: string = "";
    type: string = "frame";
    properties: LayerProperty[] = [];
    states: LayerState[] = [];
    interactions: LayerInteraction[] = [];
    drivers: Driver[] = [];
    behaviour: 'none' | 'dragXY' | 'dragX' | 'dragY' = 'none';

    functions: ISkeletScript;

    current_state: string;

    symbol_properties: LayerSymbolProperty[] = [];
    tags: string[] = [];
    isPage: boolean = false;
    locked: boolean = false;
    visible: boolean = true;
    isSymbol: boolean = false;
    isSymbolInstance: boolean = false;
    special_id: string = "";
    symbolID: string = "";

    className: string = "";

    dontInstantiate: boolean = false;

    linkName: string;
    hideCommonActions: boolean = false;
    hideLayoutProperties: boolean = false;
    deletable: boolean = true;

    canHaveChildren: boolean = false;

    constructor (title, type, className) {
        this.id = generateV4UUID();
        this.title = title;
        this.type = type;
        this.className = className;
        //this.bounds = new Bounds(0,0, 100, 100);
        this.isPage = false;
        this.locked = false;
        this.visible = true;
        this.isSymbol = false;
        this.isSymbolInstance = false;
        this.symbolID = "";

        this.properties = [];
        let lp_bounds = new LayerProperty();
        lp_bounds.id = generateV4UUID();
        lp_bounds.property_id = "view.bounds";
        lp_bounds.group = "hidden_style";
        lp_bounds.title = "Bounds";
        lp_bounds.type = "bounds";
        lp_bounds.value = new Bounds(0, 0, 100, 100);
        this.properties.push(lp_bounds);
        let lp_anchors = new LayerProperty();
        lp_anchors.id = generateV4UUID();
        lp_anchors.property_id = "view.anchors";
        lp_anchors.group = "hidden_style";
        lp_anchors.title = "Anchors";
        lp_anchors.type = "anchors";
        lp_anchors.value = {
            kind: "Anchors",
            top: new Anchor(false, "top", "", "leading", 0),
            left: new Anchor(false, "left", "", "leading", 0),
            right: new Anchor(false, "right", "", "leading", 0),
            bottom: new Anchor(false, "bottom", "", "leading", 0),
            width: new Anchor(false, "width", "", "leading", 0),
            height: new Anchor(false, "height", "", "leading", 0),
            centerv: new Anchor(false, "centerv", "", "leading", 0),
            centerh: new Anchor(false, "centerh", "", "leading", 0)
        } as Anchors;
        this.properties.push(lp_anchors);


        this.symbol_properties = [];
        this.tags = [];

        this.functions = {
            kind: "ISkeletScriptFile",
            id: generateV4UUID(),
            title: "Functions",
            type: "text",
            path: "/src/Views/",
            classInfo: {
                doInherits: "View",
                doImplements: []
            },
            hiddenImportSection: "import {View} from \"mentatjs\";\n",
            targetKind: kTargetKind.frontend,
            functions: []
        }
    }

}

