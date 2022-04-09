import {ICommandPayload} from "./ICommandPayload";
import {ICommand} from "./ICommand";
import {kCommand} from "./kCommand";
import {ICOMLayerCreate} from "./ICOMLayerCreate";
import {ICOMLayerDraw} from "./ICOMLayerDraw";
import {Layer} from "../Layer/Layer";
import {isDefined} from "mentatjs";
import {ICOMLayerDelete} from "./ICOMLayerDelete";
import {ICOMLayerSetProperty} from "./ICOMLayerSetProperty";
import {Session} from "../Session/Session";


export function ICOMgetFunctions(payload: ICommandPayload): ICommand {
    switch (payload.command) {
        case kCommand.COMMouseMoved:
            return {
                payload: payload,
                execute: function (): ICommandPayload[] {
                    if (payload.owner !== Session.instance.sessionInfo.user_guid) {
                        // update the multiplayer cursor
                    }
                    return [];
                },
                undo: function (): ICommandPayload[] {
                    return [];
                }
            };
        case kCommand.COMDrawAll:
            return {
                payload: payload,
                execute(): ICommandPayload[] {
                    Session.instance.getCurrentCanvas().drawElementsOnCanvas(false);
                    Session.instance.getCurrentCanvas().recalculateRulers();

                    return [];
                },
                undo(): ICommandPayload[] {
                    return [];
                }
            }
        case kCommand.COMLayerCreate:
            return {
                payload: payload,
                execute: function (): ICommandPayload[] {
                    const p = this.payload as ICOMLayerCreate;
                    let parent = Session.instance.currentDocument.currentWorkspace.layersTree.find(p.parent_layer_id);
                    let layer = new Layer(p.layer_data);
                    parent.adopt(layer);
                    return [new ICOMLayerDraw(p.resource_id, p.layer_data.id)];
                },
                undo: function(): ICommandPayload[] {
                    const p = this.payload as ICOMLayerCreate;
                    let parent = Session.instance.currentDocument.currentWorkspace.layersTree.find(p.parent_layer_id);
                    let node = parent.find(p.layer_data.id);
                    if (isDefined(parent)) {
                        parent.removeChild(node);
                    }
                    return [new ICOMLayerDraw(p.resource_id, p.parent_layer_id)];
                }
            };
        case kCommand.COMLayerDelete:
            return {
                payload: payload,
                execute: function(): ICommandPayload[] {
                    const p = this.payload as ICOMLayerDelete;
                    let parent = Session.instance.currentDocument.currentWorkspace.layersTree.find(p.parent_layer_id);
                    let layer = parent.find(p.layer_data.id);
                    if (isDefined(parent) && isDefined(layer)) {
                        parent.removeChild(layer);
                    }
                    return [new ICOMLayerDraw(p.resource_id, p.parent_layer_id)];
                },
                undo: function (): ICommandPayload[] {
                    const p = this.payload as ICOMLayerDelete;
                    let parent = Session.instance.currentDocument.currentWorkspace.layersTree.find(p.parent_layer_id);
                    if (isDefined(parent) && isDefined(p.layer_data)) {
                        let layer = new Layer(p.layer_data);
                        parent.adopt(layer);
                    }
                    return [new ICOMLayerDraw(p.resource_id, p.parent_layer_id)];
                }
            };
        case kCommand.COMLayerDraw:
            return {
                payload: payload,
                execute(): ICommandPayload[] {
                    const p = this.payload as ICOMLayerDraw;
                    const workspace = Session.instance.currentDocument.currentWorkspace;
                    if (workspace.workspace_guid !== p.resource_id) {
                        return [];
                    }
                    const layer = workspace.layersTree.find(p.layer_id);
                    const parentView = (isDefined(layer)) ? Session.instance.getCurrentCanvas().findViewRef(layer.parent_id) : Session.instance.getCurrentCanvas().canvasViewRef;
                    const pageLayer = (isDefined(layer)) ? layer.pageLayer : undefined;
                    if (!isDefined(layer)) {
                        return [];
                    }
                    Session.instance.getCurrentCanvas().drawElement(layer, pageLayer, {el: parentView, isView: true}, false, false, true, false);
                    Session.instance.getCurrentCanvas().calculateAllRealViewBounds();
                    return [];
                },
                undo(): ICommandPayload[] {
                    return []
                }
            }
        case kCommand.COMLayerSetProperty:
            return {
                payload: payload,
                execute: function (): ICommandPayload[] {
                    const p = this.payload as ICOMLayerSetProperty;
                    let layer = Session.instance.currentDocument.currentWorkspace.layersTree.find(p.layer_id);
                    if (isDefined(layer)) {
                        layer.setPropertyValue(p.property_id, p.new_property_value);
                    }
                    return [new ICOMLayerDraw(p.resource_id, p.layer_id)];
                },
                undo: function (): ICommandPayload[] {
                    const p = this.payload as ICOMLayerSetProperty;
                    let layer = Session.instance.currentDocument.currentWorkspace.layersTree.find(p.layer_id);
                    if (isDefined(layer)) {
                        layer.setPropertyValue(p.property_id, p.old_property_value);
                    }
                    return [new ICOMLayerDraw(p.resource_id, p.layer_id)];
                }
            }
    }


}



