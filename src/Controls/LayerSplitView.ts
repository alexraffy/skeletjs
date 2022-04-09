import {
    Bounds, boundsWithPixels,
    Direction,
    generateV4UUID, isDefined,
    LayerProperty,
    NUConvertToPixel, NUConvertToPoint, NumberWithUnit,
    px,
    SplitView,
    View, ViewController,
    ViewStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {LayerView} from "../Layer/LayerView";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";


export class LayerSplitView extends SplitView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerSplitView";
    exportClassName: "SplitView";

    isSymbol: boolean = false;

    viewANode?: Layer = null;
    viewBNode?: Layer = null;

    viewA: LayerView;
    viewB: LayerView;

    constructor() {
        super();
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "view.tint":
                return [{setterName: "tint", stringValue: `MentatJS.alltints.${property.value as string}`}];
            case "splitview.direction":
                return [{setterName: "direction", stringValue: `'${property.value as string}'`}];
            case "splitview.size":
                return [{setterName: "max", stringValue: `${property.value as number}`}];
        }

        return undefined;
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        let bounds = containerNode.calculatedBounds();
        return boundsWithPixels({x: 0, y: 0, width: NUConvertToPixel(bounds.width).amount, height: NUConvertToPixel(bounds.height).amount});
    }

    layoutEditorViewForSubNode(node: Layer, subNode: Layer) {
        if (subNode.linkName === 'viewA') {
            return this.viewA;
        }
        if (subNode.linkName === 'viewB') {
            return this.viewB;
        }
        return null;
    }



    layoutEditorViewDrawn(nodePtr: Layer, viewPtr: ILayoutEditorView & View, viewController: ViewController) {
        let nodeARef = nodePtr.children[0];
        let nodeBRef = nodePtr.children[1];

        if (isDefined(this.viewA)) {
            this.viewA.keyValues["nodeRef"] = nodeARef;
            this.viewA.nodeId = nodeARef.id;
            this.viewA.setClickDelegate(viewController, "onObjectClicked");
        }
        if (isDefined(this.viewB)) {
            this.viewB.keyValues["nodeRef"] = nodeBRef;
            this.viewB.nodeId = nodeBRef.id;
            this.viewB.setClickDelegate(viewController, "onObjectClicked");
        }

    }

    layoutEditorNodeAdded(nodePtr: Layer) {
        let containerBounds = nodePtr.bounds();
        let viewANode = Layer.create("View A", "frame", null);
        let viewANodeBounds = viewANode.rawBounds();
        viewANodeBounds.x = px(0);
        viewANodeBounds.y = px(0);
        viewANodeBounds.width = px(100);
        viewANodeBounds.height = px(100);
        viewANode.setPropertyValue("view.bounds", viewANodeBounds);
        viewANode.anchors["width"] = {
            active: true,
            side: "width",
            target: "",
            targetSide: "",
            constant: (this.direction === Direction.horizontal) ? this.length : containerBounds.width
        };
        viewANode.anchors["height"] = {
            active: true,
            side: "height",
            target: "",
            targetSide: "",
            constant: (this.direction === Direction.horizontal) ? containerBounds.height : this.length
        };
        viewANode.dontInstantiate = true;
        viewANode.linkName = 'viewA';
        viewANode.hideCommonActions = true;
        viewANode.hideLayoutProperties = true;
        viewANode.isDeletable = false;
        viewANode.isLocked = true;

        let viewBNode = Layer.create("View B", "frame", null); //  MentatJS.LayoutEditor.Code.newNode("frame", "View B", null);
        let viewBNodeBounds = viewBNode.rawBounds();
        viewBNodeBounds.x = px(0);
        viewBNodeBounds.y = px(0);
        viewBNodeBounds.width = px(100);
        viewBNodeBounds.height = px(100);
        viewBNode.setPropertyValue("view.bounds", viewBNodeBounds);

        viewBNode.anchors["width"] = {
            active: true,
            side: "width",
            target: "",
            targetSide: "",
            constant: px ((this.direction === Direction.horizontal) ? ((containerBounds.width.amount) - (this.length.amount)) : (containerBounds.width.amount))
        };
        viewBNode.anchors["height"] = {
            active: true,
            side: "height",
            target: "",
            targetSide: "",
            constant: px ((this.direction === Direction.horizontal) ? (containerBounds.height.amount) : ((containerBounds.height.amount) - (this.length.amount)))
        };
        viewBNode.dontInstantiate = true;
        viewBNode.linkName = "viewB";
        viewBNode.hideCommonActions = true;
        viewBNode.hideLayoutProperties = true;
        viewBNode.isDeletable = false;
        viewBNode.isLocked = true;
        this.viewANode = viewANode;
        this.viewBNode = viewBNode;

        nodePtr.adopt(viewANode);
        nodePtr.adopt(viewBNode);

    }


    exportProperties(layoutVersion): LayerProperty[] {
        return [
            ...viewStyleProperties(false),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Direction",
                property_id: "splitView.direction",
                group: "property",
                type: "dropdown",
                dataSource: [{id: 'horizontal', text: "Horizontal"}, {id: "vertical", text: "Vertical"}],
                value: 'horizontal'
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Size",
                property_id: "splitView.size",
                group: "property",
                type: "number",
                value: 100
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id, value) {
        "use strict";
        this.viewStyleApplyProperties(property_id, value);
        if (property_id === 'splitView.direction') {
            this.direction = value;
        }
        if (property_id === 'splitView.size') {
            this.length = (value);
        }
        if (isDefined(this.getDiv())) {
            let containerBounds = this.getBounds("");
            this.viewANode.anchors["width"] = {
                active: true,
                side: "width",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? this.length : containerBounds.width
            };
            this.viewANode.anchors["height"] = {
                active: true,
                side: "height",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? containerBounds.height : this.length
            };
            this.viewBNode.anchors["width"] = {
                active: true,
                side: "width",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? (new NumberWithUnit(NUConvertToPoint(containerBounds.width).amount - NUConvertToPoint(this.length).amount, "pt")) : (containerBounds.width)
            };
            this.viewBNode.anchors["height"] = {
                active: true,
                side: "height",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? (containerBounds.height) : (new NumberWithUnit(NUConvertToPoint(containerBounds.height).amount - NUConvertToPoint(this.length).amount, "pt"))
            };
        }

    }



    render(parentBounds?: Bounds, style?: ViewStyle): void {
        super.render(parentBounds, style);

        if (this.length === null) {
            console.warn('length not defined');
            return;
        }


        this.divisionView.doResize();
        if (this.direction === Direction.horizontal) {
            this.divisionView.cursor = 'e-resize';
        } else {
            this.divisionView.cursor = 'n-resize';
        }
        this.divisionView.render();

        let containerBounds = this.getBounds("");
        if (isDefined(this.viewANode)) {
            this.viewANode.anchors["width"] = {
                active: true,
                side: "width",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? this.length : containerBounds.width
            };
            this.viewANode.anchors["height"] = {
                active: true,
                side: "height",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? containerBounds.height : this.length
            };
        }
        if (isDefined(this.viewBNode)) {
            this.viewBNode.anchors["width"] = {
                active: true,
                side: "width",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? (new NumberWithUnit(NUConvertToPoint(containerBounds.width).amount - NUConvertToPoint(this.length).amount, "pt")) : containerBounds.width
            };
            this.viewBNode.anchors["height"] = {
                active: true,
                side: "height",
                target: "",
                targetSide: "",
                constant: (this.direction === Direction.horizontal) ? containerBounds.height : (new NumberWithUnit(NUConvertToPoint(containerBounds.height).amount - NUConvertToPoint(this.length).amount, "pt"))
            };
        }

        this.viewA.doResize();
        this.viewB.doResize();

        this.viewA.render();
        this.viewB.render();


    }

}