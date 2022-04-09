



/*
export function findPropertyByPropertyID(node: Layer, layerProperties: LayerProperty[], property_id: string): any{
    "use strict";
    if (!isDefined(node)) {
        return undefined;
    }
    if (!isDefined(node.properties) || !isDefined(layerProperties) || !isDefined(property_id)) {
        throw "findPropertyByPropertyID expects 3 parameters.";
        return undefined;
    }
    for (let x = 0; x < layerProperties.length; x++) {
        if (layerProperties[x].property_id === property_id) {
            return layerProperties[x];
        }
    }
    return undefined;
}
*/








/*

export function prepareLayer(type: string, name: string, className: string) {
    let layer: Layer = undefined;
    // find the control
    try {
        let sk: SkeletControl = findControlForClassName(className);
        if (isDefined(sk)) {
            if (sk.isBlock === false) {
                layer = new Layer(name, type, className);
                let v = Object.assign(new sk.controlClass(), {});
                if (isDefined(sk.componentID)) { // if its a  user component
                    layer.symbolID = sk.componentID;
                    layer.special_id = "userComponent";
                }
                layer.properties = v.exportProperties("");

                if (isDefined(v.layoutEditorCanHaveChildren)) {
                    layer.canHaveChildren = v.layoutEditorCanHaveChildren();
                }

            } else {
                let blockDef: SkeletBlock = Object.assign(new sk.blockClass(), {});
                if (isDefined(blockDef)) {
                    layer = blockDef.layers();
                }
            }

            layer.id = generateV4UUID();

            function updatePropertiesID(layer: Layer) {
                for (let x = 0; x < layer.properties.length; x++) {
                    if (!isDefined(layer.properties[x].id)) {
                        layer.properties[x].id = generateV4UUID();
                    }
                }
                if (isDefined(layer.subViews)) {
                    for (let i = 0; i < layer.subViews.length; i += 1) {
                        updatePropertiesID(layer.subViews[i]);
                    }
                }
            }
            updatePropertiesID(layer);



        } else {
            throw  "error";
        }
    } catch (error) {
        let message = 'A Component used in this skelet requires a plugin which is not enabled.';
        message += '\nTried to instantiate a component with constructor ' + className;
        window.alert(message);
        return undefined;
    }
    return layer;
}

export function prepareNode(type: string, name: string, className: string) {
    return prepareLayer(type, name, className);
}

*/

import {Layer} from "./Layer";
import {BorderRadius, generateV4UUID, isDefined, View} from "mentatjs";
import {ILayoutEditorView} from "./ILayoutEditorView";
import {LayerView} from "./LayerView";
import {findControlForClassName} from "../Plugin/findControlForClassName";
import {SkeletControl} from "../Plugin/SkeletControl";


function __upgradeNode(node: Layer, node_upgraded: number) {
    if (!isDefined(node)) {
        return;
    }


    if (node.type !== "symbolInstance") {
        let v: View & ILayoutEditorView;
        let nodeUpgraded = false;

        try {
            if (node.dontInstantiate === true) {
                v = new LayerView();
            } else {
                if (node.className === "MentatJS.Image") {
                    node.className = "MentatJS.ImageView";
                }
                if (node.className === "MentatJS_Ant.Button") {
                    node.className = "AntDesign.Button";
                }
                if (node.className === "MentatJS_Ant.Steps") {
                    node.className = "AntDesign.Steps";
                }

                let sk: SkeletControl = findControlForClassName(node.className);
                v = Object.assign(new sk.controlClass(), {});
            }

            if (node.className === "MentatJS.View") {
                node.canHaveChildren = true;
            }



        } catch (error) {
            if ((node.className !== null) && (node.className !== "null")) {
                let message = 'A Component used in this skelet requires a plugin which is not enabled.';
                message += '\nTried to instantiate a component with constructor ' + node.className;
                window.alert(message);
            }
            return node_upgraded;
        }
        let properties = v.exportProperties("");
        for (let x = 0; x < properties.length; x++) {
            // does that property exist on the node
            let found = node.property(properties[x].property_id);
            if (!isDefined(found)) {
                nodeUpgraded = true;
                let newProp = JSON.parse(JSON.stringify(properties[x]));
                newProp.id = generateV4UUID();
                node.addProperty(newProp);

            } else {
                if (found.property_id === "view.borderRadius") {
                    let value = found.value;
                    if (isDefined(value.tr) && !isDefined(value.tr.amount)) {
                        found.value = new BorderRadius(value.tr,value.tl,value.bl,value.br);
                        node.setPropertyValue("view.borderRadius", found.value);
                    }
                }
            }
        }
        if (nodeUpgraded === true) {
            node_upgraded += 1;
        }
    }
    if (node.children) {
        for (let subViewIndex = 0; subViewIndex < node.children.length; subViewIndex += 1) {
            node_upgraded = __upgradeNode(node.children[subViewIndex], node_upgraded);
        }
    }
    return node_upgraded;
}





