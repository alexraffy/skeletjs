import {Layer} from "../Layer/Layer";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Application, isDefined, LayerProperty, safeCopy, View} from "mentatjs";
import {getEnvironment} from "../Environment/getEnvironment";
import {Session} from "../Session/Session";
import {Workspace} from "../Document/Workspace";
import {SkeletComponent} from "./SkeletComponent";
import {SkeletControl} from "./SkeletControl";


function updateLayersFromUserComponent_recur(layer: Layer, parent: Layer | {}, component: SkeletComponent, control: SkeletControl) {
    if (layer) {
        if (layer.symbolID === component.id) {
            // update properties
            let v: View & ILayoutEditorView = Object.assign(new control.controlClass(), {});
            if (v) {
                let properties: LayerProperty[] = v.exportProperties("");
                if (properties) {
                    for (let i = 0; i < properties.length; i += 1) {
                        let propExistsInLayer: LayerProperty = layer.property(properties[i].property_id);
                        if (propExistsInLayer) {
                            if (!isDefined(propExistsInLayer.kind)) {
                                propExistsInLayer.kind = "LayerProperty";
                            }
                            propExistsInLayer.title = properties[i].title;
                            propExistsInLayer.group = properties[i].group;
                            propExistsInLayer.type = properties[i].type;
                            propExistsInLayer.dataSource = properties[i].dataSource;
                            // do we need to update the value ?
                            // if the property is a dropdown, we check if the current value still exists
                            if (propExistsInLayer.type === "dropdown") {
                                // check if the datasource is a direct array of a reference to an external datasource
                                // @ts-ignore
                                if (!isDefined(propExistsInLayer.dataSource.dsID)) {
                                    let valueStillExists = (propExistsInLayer.dataSource as {[key:string]:any, id: string, text: string}[]).find((elem) => {
                                        return elem.id === propExistsInLayer.value;
                                    })
                                    if (!valueStillExists) {
                                        propExistsInLayer.value = properties[i].value;
                                    }
                                }
                            }
                            layer.setProperty(properties[i].property_id, propExistsInLayer);
                        } else {
                            // the property does not exists in the layer, we add it
                            properties[i].kind = "LayerProperty";
                            layer.setProperty(properties[i].property_id, safeCopy(properties[i]));
                        }
                    }
                    // delete properties that don't exist anymore
                    for (let i = layer.properties.length - 1; i >= 0; i -= 1) {
                        let exists = properties.find((elem) => { return elem.property_id === layer.properties[i].property_id; });
                        if (!exists) {
                            layer.properties.splice(i, 1);
                        }
                    }
                    // and finally, redraw the layer, if its on the canvas
                    Application.instance.notifyAll(parent, "kRedrawSubView", layer);
                }
            } else {
                console.warn("Could not instantiate " + control.className);
            }
            if (layer.children) {
                for (let i = 0; i < layer.children.length; i += 1) {
                    updateLayersFromUserComponent_recur(layer.children[i], layer, component, control);
                }
            }
        }
    }
}


export function updateLayersFromUserComponent(componentID: string) {
    let component: SkeletComponent = getEnvironment().Components.find((elem) => { return elem.id === componentID;});
    if (!component) {
        console.warn("updateLayersFromUserComponent: Could not find component " + componentID);
        return;
    }
    let controlGroup = getEnvironment().Controls.find((elem) => { return elem.group === "Symbols & Custom Components"});
    if (!controlGroup) {
        console.warn("updateLayersFromUserComponent: no Symbols & User Components group in controls");
        return;
    }
    let control: SkeletControl = controlGroup.controls.find((elem) => { return elem.componentID === componentID;});

    for (let i = 0; i < Session.instance.currentDocument.resources.length; i += 1) {
        let r = Session.instance.currentDocument.resources[i];
        if (r.mime === "skelet/workspace") {
            let w = Session.instance.currentDocument.resources[i].data as Workspace;
            for (let x = 0; x < w.layersTree.children.length; x += 1) {
                let l = w.layersTree.children[x];
                updateLayersFromUserComponent_recur(l, {}, component, control);
            }
        }
    }

}