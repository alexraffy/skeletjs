import {LayerData} from "./LayerData";
import {
    Anchors,
    assert,
    Bounds,
    generateV4UUID, instanceOfAnchors,
    instanceOfBounds,
    instanceOfLayerProperty,
    isDefined, LayerProperty, LayerStateType,
    Logging,
    safeCopy
} from "mentatjs";
import {instanceOfLayerData} from "../Guards/instanceOfLayerData";
import {LayerState} from "./LayerState";
import {LayerSymbolProperty} from "./LayerSymbolProperty";
import {instanceOfLayerSymbolProperty} from "../Guards/instanceOfLayerSymbolProperty";
import {instanceOfLayer} from "../Guards/instanceOfLayer";
import {ILayoutEditorView} from "./ILayoutEditorView";

import { calculateBounds } from "./calculateBounds";
import {LayerOverride} from "./LayerOverride";
import {instanceOfLayerState} from "../Guards/instanceOfLayerState";
import {SkeletScript} from "../Document/SkeletScript";
import {instanceOfSkeletScript} from "../Guards/instanceOfSkeletScript";
import {SkeletControl} from "../Plugin/SkeletControl";
import {findControlForClassName} from "../Plugin/findControlForClassName";


export class Layer {

    constructor(l: LayerData) {
        assert(isDefined(l) && instanceOfLayerData(l), "Layer constructor called without a valid LayerData parameter");

        this._data = l;
        this._pageLayer = undefined;
        this._parentLayer = undefined;
        this._children = [];
    }

    private _data: LayerData;
    private _pageLayer: Layer;
    private _parentLayer: Layer;
    private _children: Layer[];

    get data(): LayerData {
        return this._data;
    }

    // LayerData access

    get id(): string {
        return this.data.id;
    }
    setID(id: string) {
        assert(typeof id === "string", "Layer.setID expects a string value.");
        this.data.id = id;
    }

    get parent_id(): string {
        return this.data.parent_id;
    }
    set parent_id(value: string)
    {
        assert(typeof value === "string", "Layer.parent_id expects a string value.");
        this.data.parent_id = value;
    }

    get type(): string {
        return this.data.type;
    }

    get title(): string {
        return this.data.title;
    }
    set title(value: string) {
        assert(typeof value === "string", "Layer.title expects a string value.");
        this.data.title = value;
    }

    get className(): string {
        return this.data.className;
    }
    set className(value: string) {
        assert(typeof value === "string", "Layer.className expects a string value.");
        this.data.className = value;
    }

    get isVisible(): boolean {
        return this.data.visible;
    }
    set isVisible(value: boolean) {
        assert(typeof value === "boolean", "Layer.isVisible expects a boolean value.");
        this.data.visible = value;
    }

    get isLocked(): boolean {
        return this.data.locked;
    }
    set isLocked(value: boolean) {
        assert(typeof value === "boolean", "Layer.isLocked expects a boolean value.");
        this.data.locked = value;
    }

    get isSymbol(): boolean {
        return this.data.isSymbol;
    }
    set isSymbol(value: boolean) {
        assert(typeof value === "boolean", "Layer.isSymbol expects a boolean value.");
        this.data.isSymbol = value;
    }

    get isDeletable(): boolean {
        return this.data.deletable;
    }
    set isDeletable(value: boolean) {
        assert(typeof value === "boolean", "Layer.isDeletable expects a boolean value.");
        this.data.deletable = value;
    }

    get isSymbolInstance(): boolean {
        return this.data.isSymbolInstance;
    }
    set isSymbolInstance(value: boolean) {
        assert(typeof value === "boolean", "Layer.isSymbolInstance expects a boolean value.");
        this.data.isSymbolInstance = value;
    }

    get canHaveChildren(): boolean {
        return this.data.canHaveChildren;
    }
    set canHaveChildren(value: boolean) {
        assert(typeof value === "boolean", "Layer.canHaveChildren expects a boolean value.");
        this.data.canHaveChildren = value;
    }

    get symbolID(): string {
        return this.data.symbolID;
    }

    set symbolID(value: string) {
        assert(typeof value === "string", "Layer.symbolID expects a string value.");
        this.data.symbolID = value;
    }

    get special_id(): string {
        return this.data.special_id;
    }
    set special_id(value: string) {
        assert(typeof value === "string", "Layer.special_id expects a string value.");
        this.data.special_id = value;
    }

    get isPage(): boolean {
        return this.data.isPage;
    }

    //set isPage(value: boolean) {
    //    this.data.isPage = value;
    //}

    setPage() {
        this.pageLayer = this;
        this.data.isPage = true;
        this.addDefaultStateOnPageIfNotExists();
    }


    get linkName(): string {
        return this.data.linkName;
    }
    set linkName(value: string) {
        assert(typeof value === "string", "Layer.linkName expects a string value.");
        this.data.linkName = value;
    }

    get dontInstantiate(): boolean {
        return this.data.dontInstantiate;
    }
    set dontInstantiate(value: boolean) {
        assert(typeof value === "boolean", "Layer.dontInstantiate expects a boolean value.");
        this.data.dontInstantiate = value;
    }

    get hideCommonActions(): boolean {
        return this.data.hideCommonActions;
    }
    set hideCommonActions(value: boolean) {
        assert(typeof value === "boolean", "Layer.hideCommonActions expects a boolean value.");
        this.data.hideCommonActions = value;
    }
    get hideLayoutProperties(): boolean {
        return this.data.hideLayoutProperties;
    }
    set hideLayoutProperties(value: boolean) {
        assert(typeof value === "boolean", "Layer.hideLayoutProperties expects a boolean value.");
        this.data.hideLayoutProperties = value;
    }

    // states
    get states(): LayerState[] {
        return this.data.states;
    }
    set states(value: LayerState[]) {
        assert(isDefined(value) && value.every((v) => { return instanceOfLayerState(v);}), "Layer.states expects an array of LayerState.");
        this.data.states = value;
    }

    get current_state(): string {
        return this.data.current_state;
    }

    set current_state(value: string) {
        assert(typeof value === "string", "Layer.current_state expects a string value.");
        this.data.current_state = value;
    }

    get tags(): string[] {
        return this.data.tags;
    }

    set tags(value: string[]) {
        assert(isDefined(value) && value.every((v) => { return typeof v === "string";}), "Layer.linkName expects a string array.");
        this.data.tags = value;
    }

    get symbol_properties(): LayerSymbolProperty[] {
        return this.data.symbol_properties;
    }

    set symbol_properties(value: LayerSymbolProperty[]) {
        assert(isDefined(value) && value.every((v) => { return instanceOfLayerSymbolProperty(v);}), "Layer.symbol_properties setter expects an array of LayerSymbolProperty.");

        this.data.symbol_properties = value;
    }


    get functions(): SkeletScript {
        return SkeletScript.fromStruct(this._data.functions);
    }
    set functions(s: SkeletScript) {
        assert(isDefined(s) && instanceOfSkeletScript(s), "Layer.functions expects a SkeletScript value");
        this._data.functions = s.toJSON();
    }


    // Hierarchy



    adopt(layer: Layer) {
        assert(isDefined(layer) && instanceOfLayer(layer), "Layer.adopt expects a Layer parameter.");
        this._children.push(layer);
        layer._parentLayer = this;
        layer.data.parent_id = this.id;
        if (this.special_id === "workspace.views") {
            layer.setPage();
        } else {
            layer._pageLayer = this.pageLayer;
        }
    }

    removeChild(layer: Layer) {
        assert(isDefined(layer) && instanceOfLayer(layer), "Layer.removeChild expects a Layer parameter.");
        let idx = -1;
        for (let i = 0; i < this.children.length; i += 1) {
            if (this.children[i].id === layer.id) {
                idx = i;
                break;
            }
        }
        if (idx > -1) {
            this._children.splice(idx, 1);
        }
    }


    create(title: string, type: string, className: string): Layer {
        assert(isDefined(title) && isDefined(type) && isDefined(className) &&
            typeof title === "string" && typeof type === "string" && typeof className === "string",
            "Layer.create expects 3 string parameters."
        );
        let l = Layer.create(title, type, className);
        this.children.push(l);
        l._parentLayer = this;
        l._pageLayer = this._pageLayer;
        l.data.parent_id = this.id;
        return l;
    }
    // create an orphan layer
    static create(title: string, type: string, className: string): Layer {
        if (!isDefined(className)) {
            className = "MentatJS.View";
            type = "object";
        }
        assert(isDefined(title) && isDefined(type) && isDefined(className) &&
            typeof title === "string" && typeof type === "string" && typeof className === "string",
            "Static Layer.create expects 3 string parameters."
        );
        let ld = new LayerData(title, type, className);
        ld.id = generateV4UUID();
        // instantiate control
        try {
            let sk: SkeletControl = findControlForClassName(className);
            if (sk === undefined) {
                Logging.log("Could not instantiate type " + className);
                Logging.log("Are you missing a plugin ?");
                return;
            }
            let v: ILayoutEditorView = Object.assign(new sk.controlClass(), {});
            let newProperties = v.exportProperties("");
            for (let i = 0; i < newProperties.length; i += 1) {
                newProperties[i].id = generateV4UUID();
                ld.properties.push(newProperties[i]);
            }
        } catch (e) {
            Logging.log("Could not instantiate type " + className);
            Logging.log("Are you missing a plugin ?");
            Logging.log(e.message);
        }
        let newLayer: Layer = new Layer(ld);
        return newLayer;
    }


    duplicateChild(layer: Layer): Layer {
        assert(isDefined(layer) && instanceOfLayer(layer), "Layer.duplicateChild expects a Layer parameter.");
        function duplicateNode_recur (layer: Layer, parentLayer: Layer) {
            let ld: LayerData = safeCopy(layer.data);
            ld.id = generateV4UUID();
            for (let i = 0; i < ld.properties.length; i += 1) {
                ld.properties[i].id = generateV4UUID();
            }
            ld.parent_id = parentLayer.id;

            let l = new Layer(ld);
            l._parentLayer = parentLayer;

            for (let i = 0; i < layer.children.length; i++) {
                l._children.push(duplicateNode_recur(layer.children[i], layer));
            }
            l.isSymbol = false;
            l.isSymbolInstance = false;
            l.symbolID = "";
            l.symbol_properties = [];
            return l;
        }
        let newLayer = duplicateNode_recur(layer, this);
        return newLayer;
    }


    find(layerId: string): Layer {
        assert(isDefined(layerId) && layerId !== "", "Layer.find expects a string parameter.");
        let currentLayer = this;
        let findRecur = function (layer: Layer, layerId: string) {
            if (isDefined(layer) && layer.id === layerId) {
                return layer;
            }
            if (isDefined(layer) && isDefined(layer.children)) {
                for (let i = 0; i < layer.children.length; i += 1) {
                    let ret = findRecur(layer.children[i], layerId);
                    if (isDefined(ret)) {
                        return ret;
                    }
                }
            }
            return undefined;
        }
        return findRecur(this, layerId);
    }

    get siblings(): Layer[] {
        let ret: Layer[];
        if (isDefined(this.parentLayer)) {
            for (let i = 0; i < this.parentLayer.children.length; i += 1) {
                if (this.parentLayer.children[i].id !== this.id) {
                    ret.push(this.parentLayer.children[i]);
                }
            }
        }
        return ret;
    }



    get pageLayer(): Layer {
        return this._pageLayer;
    }
    set pageLayer(value: Layer) {
        assert(instanceOfLayer(value), "Layer.pageLayer expects a Layer value");
        this._pageLayer = value;
    }
    get parentLayer(): Layer {
        return this._parentLayer;
    }
    set parentLayer(value: Layer) {
        assert(instanceOfLayer(value), "Layer.parentLayer expects a Layer value");
        this._parentLayer = value;
    }
    get children(): Layer[] {
        if (!isDefined(this._children)) {
            return [];
        }
        return this._children;
    }

    get isDefaultState(): boolean {
        // what is the state ?
        let isDefaultState: boolean = false;
        if (isDefined(this.pageLayer)) {
            let currentState = this.pageLayer.data.current_state;
            for (let i = 0; i < this.pageLayer.data.states.length; i += 1) {
                if (this.pageLayer.data.states[i].id === currentState && this.pageLayer.data.states[i].isDefaultState === true) {
                    return true;
                }
            }
        } else {
            return true;
        }
        return isDefaultState
    }

    private addDefaultStateOnPageIfNotExists() {
        if (!isDefined(this.pageLayer)) {
            if (this.isPage===true) {
                this.pageLayer = this;
            } else {
                console.warn("Could not find page for layer " + this.id + " with title " + this.title);
                return;
            }
        }
        if (this.pageLayer.states.length === 0) {
            let newState: LayerState = this.pageLayer.newState("Default", "active", "en-US");
            newState.isDefaultState = true;
            this.pageLayer.current_state = newState.id;
        }

    }

    pageState(): LayerState {
        this.addDefaultStateOnPageIfNotExists();
        if (isDefined(this.pageLayer)) {
            let currentState = this.pageLayer.data.current_state;
            for (let i = 0; i < this.pageLayer.data.states.length; i += 1) {
                if (this.pageLayer.data.states[i].id === currentState) {
                    return this.pageLayer.data.states[i];
                }
            }
        }
        return undefined;
    }
    pageDefaultState(): LayerState {
        this.addDefaultStateOnPageIfNotExists();
        if (isDefined(this.pageLayer)) {
            let currentState = this.pageLayer.data.current_state;
            for (let i = 0; i < this.pageLayer.data.states.length; i += 1) {
                if (this.pageLayer.data.states[i].isDefaultState === true) {
                    return this.pageLayer.data.states[i];
                }
            }
        }
        return undefined;
    }

    pageStateWithId(id: string): LayerState {
        assert(isDefined(id) && id !== "", "Layer.pageStateWithId expects a string parameter.");
        this.addDefaultStateOnPageIfNotExists();
        if (isDefined(this.pageLayer)) {
            for (let i = 0; i < this.pageLayer.data.states.length; i += 1) {
                if (this.pageLayer.data.states[i].id === id) {
                    return this.pageLayer.data.states[i];
                }
            }
        }
        return undefined;
    }

    newState(title: string, type: LayerStateType, locale: string): LayerState {
        assert(isDefined(title) && isDefined(type) && isDefined(locale), "Layer.newState called with wrong parameters.");
        let ls: LayerState = {
            id: generateV4UUID(),
            title: title,
            overrides: [],
            isDefaultState: false,
            responsiveStep: {width: 0},
            type: type,
            localization: locale
        };
        this.pageLayer.data.states.push(ls);
        return ls;
    }


    // Properties

    deleteProperties() {
        let propBounds: LayerProperty = undefined;
        let propAnchors: LayerProperty = undefined;

        for (let i = 0; i < this.data.properties.length; i += 1 ) {
            if (this.data.properties[i].property_id === "view.bounds") {
                propBounds = safeCopy(this.data.properties[i]);
            }
            if (this.data.properties[i].property_id === "view.anchors") {
                propAnchors = safeCopy(this.data.properties[i]);
            }
        }
        this.data.properties = [];
        this.data.properties.push(propBounds);
        this.data.properties.push(propAnchors);
    }


    get properties(): LayerProperty[] {
        let layer = this;
        if (!isDefined(this.pageLayer)) {
            return safeCopy(this.data.properties);
        }
        let state: LayerState = this.pageState();

        let ret: LayerProperty[] = [];
        let rawProperties = this.rawProperties;
        for (let i = 0; i < rawProperties.length; i += 1) {
            let prop: LayerProperty = rawProperties[i];
            // is there an override?
            let override_found = false;
            let override_exists = state.overrides.find((lo: LayerOverride) => {
                return (lo.layer_id === layer.id);
            });
            if (isDefined(override_exists)) {
                let override_property = override_exists.properties.find((lp: LayerProperty) => {
                    return lp.property_id === prop.property_id;
                })
                if (isDefined(override_property)) {
                    ret.push(override_property);
                    override_found = true;
                }
            }
            if (!override_found) {
                ret.push(prop);
            }
        }
        return safeCopy(ret);

    }

    get rawProperties(): LayerProperty[] {
        return safeCopy(this.data.properties);
    }

    property(property_id: string): LayerProperty {
        assert(isDefined(property_id) && property_id !== "", "Layer.property expects a string parameter.");
        let properties = this.properties;
        for (let i = 0; i < properties.length; i += 1 ) {
            if (properties[i].property_id === property_id) {
                return safeCopy(properties[i]);
            }
        }
        return undefined;
    }

    rawProperty(property_id: string): LayerProperty {
        assert(isDefined(property_id) && property_id !== "", "Layer.rawProperty expects a string parameter.");
        let properties = this.rawProperties;
        for (let i = 0; i < properties.length; i += 1 ) {
            if (properties[i].property_id === property_id) {
                return safeCopy(properties[i]);
            }
        }
        return undefined;
    }

    setProperty(property_id: string, value: LayerProperty) {
        assert(isDefined(property_id) && property_id !== "" && instanceOfLayerProperty(value), "Layer.setProperty expects a string and LayerProperty.");
        if (!instanceOfLayerProperty(value)) {
            throw "setProperty expects a LayerProperty";
        }
        let found: boolean = false;
        for (let i = 0; i < this.data.properties.length; i += 1) {
            if (this.data.properties[i].property_id === property_id) {
                found = true;
                this.data.properties[i] = value;
                break;
            }
        }
        if (!found) {
            this.addProperty(value);
        }
    }

    setRawPropertyValue(property_id: string, value: any) {
        assert(isDefined(property_id) && property_id !== "" && isDefined(value), "Layer.setRawPropertyValue expects a string and a value.");

        if (instanceOfLayerProperty(value)) {
            throw "setRawPropertyValue expects a value and not a LayerProperty";
        }
        for (let i = 0; i < this.data.properties.length; i += 1) {
            if (this.data.properties[i].property_id === property_id) {
                this.data.properties[i].value = value;
            }
        }
    }


    // update the property value on the pageLayer current state
    setPropertyValue(property_id: string, value: any) {
        assert(isDefined(property_id) && property_id !== "" && isDefined(value), "Layer.setPropertyValue expects a string and a value.");

        if (instanceOfLayerProperty(value)) {
            throw "setPropertyValue expects a value and not a LayerProperty";
        }

        if (this.isDefaultState) {
            for (let i = 0; i < this.data.properties.length; i += 1) {
                if (this.data.properties[i].property_id === property_id) {
                    this.data.properties[i].value = value;
                }
            }
        } else {
            // is there a override
            let overrideExists: boolean = false;
            let pageState = this.pageState();
            for (let i = 0; i < pageState.overrides.length; i += 1) {
                if (pageState.overrides[i].layer_id === this.id) {
                    for (let x = 0; x < pageState.overrides[i].properties.length; x += 1) {
                        if (pageState.overrides[i].properties[x].property_id === property_id) {
                            pageState.overrides[i].properties[x].value = value;
                            overrideExists = true;
                        }
                    }
                    if (overrideExists === false) {
                        let copyProperty: LayerProperty = safeCopy(this.rawProperty(property_id));
                        copyProperty.id = generateV4UUID();
                        copyProperty.value = value;
                        pageState.overrides[i].properties.push(copyProperty);
                        overrideExists = true;
                    }
                }
            }
            if (overrideExists === false) {
                let copyProperty: LayerProperty = safeCopy(this.rawProperty(property_id));
                copyProperty.id = generateV4UUID();
                copyProperty.value = value;
                pageState.overrides.push(
                    {
                        layer_id: this.id,
                        properties: [
                            copyProperty
                        ]
                    }
                )
            }
        }
    }

    addProperty(prop: LayerProperty) {
        assert(instanceOfLayerProperty(prop), "Layer.addProperty expects a LayerProperty parameter.");
        this.data.properties.push(safeCopy(prop));
    }


    anchors(): Anchors {
        let property = this.property("view.anchors");
        if (isDefined(property) && isDefined(property.value)) {
            if (instanceOfAnchors(property.value)) {
                return safeCopy(property.value);
            } else {
                let val: Anchors = {
                    kind: "Anchors"
                }
                return val;
            }
        } else {
            let val: Anchors = {
                kind: "Anchors"
            }
            return val;
        }
    }

    rawBounds(): Bounds {
        let prop = this.rawProperty("view.bounds");
        if (!isDefined(prop)) {
            throw `layer ${this.title} has no bounds`;
        }
        return safeCopy(prop.value);
    }

    bounds(): Bounds {
        let prop = this.property("view.bounds");
        if (!isDefined(prop)) {
            throw `layer ${this.title} has no bounds`;
        }
        return safeCopy(prop.value);
    }

    calculatedBounds(): Bounds {
        return calculateBounds(this, "", false);
    }

    boundsOnCanvas(): Bounds {
        return calculateBounds(this, "", true);
    }

    setBounds(newBounds: Bounds) {
        assert(instanceOfBounds(newBounds), "Layer.setBounds expects a Bounds parameter.");
        this.setPropertyValue("view.bounds", safeCopy(newBounds));
    }

    // SERIALIZATION
    flatten(): LayerData[] {
        let ret: LayerData[] = [];
        function recur(layerRef: Layer, arrayRef: LayerData[]) {
            arrayRef.push(safeCopy(layerRef.data));
            for (let i = 0; i < layerRef.children.length; i += 1) {
                recur(layerRef.children[i], arrayRef);
            }
        }
        recur(this, ret);
        return ret;
    }



}

