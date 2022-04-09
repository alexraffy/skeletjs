import {Application, boundsWithPixels, generateV4UUID, LayerProperty, SVGView} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Layer} from "../Layer/Layer";
import {Session} from "../Session/Session";


export class LayerSVGView extends SVGView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerSVGView";
    exportClassName: "SVGView";

    isSymbol: boolean = false;

    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: 0, y: 0, width: 200, height: 200});
    }

    exportProperties(layoutVersion, defaultType: string = "rectangle"): LayerProperty[] {
        if (defaultType === "star") {
            defaultType = "shapePath";
        }
        let commonProperties: LayerProperty[] =[
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Element",
                property_id: "svg.element",
                group: "property",
                type: "dropdown",
                dataSource: [{id: "shapeGroup", text: "shapeGroup"}, {
                    id: "rectangle",
                    text: "Rectangle"
                }, {id: "oval", text: "Ellipse"}, {id: "shapePath", text: "Shape"}, {id: "polyline", text: "polyline"}],
                value: defaultType
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Boolean",
                property_id: "svg.boolean",
                group: "property",
                type: "dropdown",
                dataSource: [{id: 'Noop', text: "No Operation"}, {id: "Combine", text: "Combine"}, {
                    id: "Extrude",
                    text: "Extrude"
                }],
                value: 'Noop'
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Flipped Horizontal",
                property_id: "view.isFlippedHorizontal",
                group: "hidden_property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Flipped Vertical",
                property_id: "view.isFlippedVertical",
                group: "hidden_property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Rotation",
                property_id: "view.rotation",
                group: "hidden_property",
                type: "number",
                value: 0
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Fills",
                property_id: "view.fills",
                group: "style",
                type: "fills",
                value: []
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Borders",
                property_id: "view.borders",
                group: "style",
                type: "borders",
                value: []
            }
        ];
        if (defaultType === 'shapeGroup') {
            return [...commonProperties];
        }
        if (defaultType === 'rectangle') {
            return [...commonProperties,
                {
                    kind: "LayerProperty",
                    id: generateV4UUID(),
                    title: "Radius",
                    property_id: "svg.borderRadius",
                    group: "property",
                    type: "radius",
                    value: {tl:0, tr: 0, bl: 0, br: 0}
                }
            ];
        }
        if (defaultType === 'oval') {
            return [...commonProperties
                ];
        }

        if (defaultType === "shapePath") {
            return [...commonProperties,
                {
                    kind: "LayerProperty",
                    id: generateV4UUID(),
                    title: "Points",
                    property_id: "svg.points",
                    group: "hidden_property",
                    type: "shapes",
                    value: []
                },
                {
                    kind: "LayerProperty",
                    id: generateV4UUID(),
                    title: "Is Closed",
                    property_id: "svg.isClosed",
                    group: "property",
                    type: "boolean",
                    value: true
                }
            ];
        }
        return commonProperties;



    }

    applyLayoutProperty(property_id: string, value: any) {
        if (property_id === "svg.boolean") {
            this.booleanOp = value;
        }

        if (property_id === "svg.element") {
            this.element = value;
            if (this.nodeId) {
                let node = Session.instance.currentDocument.currentWorkspace.layersTree.find(this.nodeId);
                if (node) {
                    node.setPropertyValue(property_id, this.element);
                    Application.instance.notifyAll(this, "noticeNodeSelected", node);
                }
            }




        }
        if (property_id === "svg.points") {
            this.points = value;
        }
        if (property_id === "view.fills") {
            this.fills = value;
        }
        if (property_id === "svg.borderRadius") {
            this.borderRadius = value;
        }

        if (property_id === "view.borders") {
            this.borders = value;
        }
        if (property_id === "view.isFlippedHorizontal") {
            this.isFlippedHorizontal = value;
        }
        if (property_id === "view.isFlippedVertical") {
            this.isFlippedVertical = value;
        }
        if (property_id === "view.rotation") {
            this.rotation = value;
        }
        let parentView = this.parentView;
        while ( (parentView) && (parentView instanceof SVGView)) {
            (<SVGView>parentView).isCached = false;
            parentView = parentView.parentView;
        }
    }





}