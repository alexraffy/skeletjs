import {Layer} from "./Layer";
import {Bounds, LayerProperty, View, ViewController} from "mentatjs";


export interface ILayoutEditorView {
    nodeId: string;
    nodeRef?: Layer;
    pageLayerRef?: Layer;
    layerProperties: LayerProperty[];

    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    isSymbol: boolean;
    symbolID?: string;
    layoutEditorSupportsDoubleClick?(node: Layer):boolean;
    layoutEditorPositioning(containerNode: Layer, x: number, y: number, node: Layer): Bounds;
    exportProperties(layoutEditorVersion: string): LayerProperty[];
    applyLayoutProperty(property_id: string, value: any);
    layoutEditorEnterEditMode?(node: Layer);
    layoutEditorExitEditMode?(node: Layer);
    layoutEditorViewWasSelected?(node: Layer,isSelected: boolean);
    layoutEditorViewForSubNode?(node: Layer, subNode: Layer): View & ILayoutEditorView;
    layoutEditorViewDrawn?(node: Layer, view: ILayoutEditorView & View, viewController: ViewController);

    layoutEditorListIcon?(): (layer: Layer, bounds: Bounds) => View;

    layoutEditorIsDropTarget?(): Boolean;

    layoutEditorLibraryLayer?(layer: Layer);

    layoutEditorPropertyValueForExporter?(property: LayerProperty, depth: number, exporterID: string): { setterName: string, stringValue: string}[];

    layoutEditorCanHaveChildren?(): boolean;

}
