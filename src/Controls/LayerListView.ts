import {
    Bounds, Direction,
    generateV4UUID, isDefined,
    LayerProperty,
    ListView, NUConvertToPixel, NumberWithUnit,
    PropertyTextStyle,
    px,
    PXBounds, SelectionMode, View, ViewController,
    ViewStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Layer} from "../Layer/Layer";
import {ViewCanvas} from "../Canvas/ViewCanvas";
import {stretchNodeBoundsToAvailableSpace} from "../Layer/stretchNodeBoundsToAvailableSpace";
import {LayerView} from "../Layer/LayerView";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {IExporter} from "../Compiler/IExporter";
import {Session} from "../Session/Session";


export class LayerListView extends ListView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;

    className: "LayerListView";
    exportClassName: "ListView";
    isSymbol: boolean = false;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];

    nodeLoadingRef?: Layer = null;
    nodeNoDataRef?: Layer = null;
    nodeDataRef?: Layer = null;

    layoutCellViewLoading: LayerView;
    layoutCellViewNoData: LayerView;
    layoutCellViewData: LayerView;

    constructor() {
        super();
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number, node?: Layer) {
        return stretchNodeBoundsToAvailableSpace(containerNode, node, false);
    }

    layoutEditorViewForSubNode(node: Layer, subNode: Layer): LayerView {

        if (this.layoutCellViewLoading === undefined) {
            this.buildLayoutViews();
        }

        if (subNode.linkName === 'cellLoading') {
            return this.layoutCellViewLoading;
        }
        if (subNode.linkName === 'cellNoData') {
            return this.layoutCellViewNoData;
        }
        if (subNode.linkName === 'cellData') {
            return this.layoutCellViewData;
        }
        return null;
    }

    layoutEditorViewDrawn(node: Layer, view: ILayoutEditorView & View, viewController: ViewController) {
        let nodeLoadingRef = node.children[0];
        let nodeNoDataRef = node.children[1];
        let nodeDataRef = node.children[2];

        this.nodeLoadingRef = nodeLoadingRef;
        this.nodeNoDataRef = nodeNoDataRef;
        this.nodeDataRef = nodeDataRef;

        if (isDefined(this.layoutCellViewLoading)) {
            this.layoutCellViewLoading.keyValues["nodeRef"] = nodeLoadingRef;
            this.layoutCellViewLoading.keyValues["nodeId"] = nodeLoadingRef.id;
            this.layoutCellViewLoading.setClickDelegate(viewController, "onObjectClicked");
        }
        if (isDefined(this.layoutCellViewNoData)) {
            this.layoutCellViewNoData.keyValues["nodeRef"] = nodeNoDataRef;
            this.layoutCellViewNoData.keyValues["nodeId"] = nodeNoDataRef.id;
            this.layoutCellViewNoData.setClickDelegate(viewController, "onObjectClicked");
        }
        if (isDefined(this.layoutCellViewData)) {
            this.layoutCellViewData.keyValues["nodeRef"] = nodeDataRef;
            this.layoutCellViewData.keyValues["nodeId"] = nodeDataRef.id;
            this.layoutCellViewData.setClickDelegate(viewController, "onObjectClicked");
        }

    }

    layoutEditorNodeAdded(node: Layer) {

        let containerBounds: Bounds = node.bounds();

        let nodeLoadingRef = Layer.create("Cell Loading", "frame", null);
        let nodeLoadingBounds = nodeLoadingRef.bounds();
        nodeLoadingBounds.x = new NumberWithUnit(0, "px");
        nodeLoadingBounds.y = new NumberWithUnit(0, "px");
        nodeLoadingBounds.width = new NumberWithUnit(NUConvertToPixel(containerBounds.width).amount, "px");
        nodeLoadingBounds.height = new NumberWithUnit(44, "px");
        node.setPropertyValue("view.bounds", nodeLoadingBounds);
        nodeLoadingRef.dontInstantiate = true;
        nodeLoadingRef.linkName = 'cellLoading';
        nodeLoadingRef.hideCommonActions = true;
        nodeLoadingRef.hideLayoutProperties = true;
        nodeLoadingRef.isDeletable = false;
        nodeLoadingRef.isLocked = true;
        let nodeLoadingImage = Layer.create("loading", "image", "MentatJS.ImageView");
        let nodeLoadingImageBounds = nodeLoadingImage.rawBounds();
        nodeLoadingImageBounds.x = new NumberWithUnit(containerBounds.width.amount / 2 - 24 / 2, "px");
        nodeLoadingImageBounds.y = new NumberWithUnit(44 / 2 - 24 / 2, "px");
        nodeLoadingImageBounds.width = new NumberWithUnit(24, "px");
        nodeLoadingImageBounds.height = new NumberWithUnit(24, "px");
        nodeLoadingImage.setPropertyValue("view.bounds", nodeLoadingImageBounds);
        nodeLoadingImage.setPropertyValue("image.uri","data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNNDYwLjExNSAzNzMuODQ2bC02Ljk0MS00LjAwOGMtNS41NDYtMy4yMDItNy41NjQtMTAuMTc3LTQuNjYxLTE1Ljg4NiAzMi45NzEtNjQuODM4IDMxLjE2Ny0xNDIuNzMxLTUuNDE1LTIwNS45NTQtMzYuNTA0LTYzLjM1Ni0xMDMuMTE4LTEwMy44NzYtMTc1LjgtMTA3LjcwMUMyNjAuOTUyIDM5Ljk2MyAyNTYgMzQuNjc2IDI1NiAyOC4zMjF2LTguMDEyYzAtNi45MDQgNS44MDgtMTIuMzM3IDEyLjcwMy0xMS45ODIgODMuNTUyIDQuMzA2IDE2MC4xNTcgNTAuODYxIDIwMi4xMDYgMTIzLjY3IDQyLjA2OSA3Mi43MDMgNDQuMDgzIDE2Mi4zMjIgNi4wMzQgMjM2LjgzOC0zLjE0IDYuMTQ5LTEwLjc1IDguNDYyLTE2LjcyOCA1LjAxMXoiLz48L3N2Zz4=" )
        nodeLoadingImage.setPropertyValue("image.width", 24);
        nodeLoadingImage.setPropertyValue("image.height", 24);
        nodeLoadingRef.adopt(nodeLoadingImage);

        let nodeNoDataRef = Layer.create("Cell No Data", "frame", null);
        let nodeNoDataRefBounds = nodeNoDataRef.rawBounds();
        nodeNoDataRefBounds.x = new NumberWithUnit(0, "px");
        nodeNoDataRefBounds.y = px(0);
        nodeNoDataRefBounds.width = px(100);
        nodeNoDataRefBounds.height = px(100);
        nodeNoDataRef.setPropertyValue("view.bounds", nodeNoDataRefBounds);
        nodeNoDataRef.dontInstantiate = true;
        nodeNoDataRef.linkName = "cellNoData";
        nodeNoDataRef.hideCommonActions = true;
        nodeNoDataRef.hideLayoutProperties = true;
        nodeNoDataRef.isDeletable = false;
        nodeNoDataRef.isLocked = true;
        // no data label
        let nodeNoDataLabel = Layer.create("Label", "object", "MentatJS.Label");
        let nodeNoDataLabelBounds = nodeNoDataLabel.rawBounds();
        nodeNoDataLabelBounds.x = px(containerBounds.width.amount / 2 - 24 / 2);
        nodeNoDataLabelBounds.y = px(44 / 2 - 14 / 2);
        nodeNoDataLabelBounds.width = px(100);
        nodeNoDataLabelBounds.height = px(14);
        nodeNoDataLabel.setPropertyValue("view.bounds", nodeNoDataLabelBounds);
        nodeNoDataLabel.setPropertyValue("label.text", "No Entries yet.");
        let textStyle = nodeNoDataLabel.property("label.textStyle");
        (textStyle.value as PropertyTextStyle).textAlignment = "center";
        nodeNoDataLabel.setPropertyValue("label.textStyle", textStyle.value);
        nodeNoDataLabel.setPropertyValue("label.fillLineHeight", true);
        nodeNoDataRef.adopt(nodeNoDataLabel);

        let nodeDataRef = Layer.create("Cell Data", "frame", null);
        let nodeDataRefBounds = nodeDataRef.rawBounds();
        nodeDataRefBounds.x = px(0);
        nodeDataRefBounds.y = px(0);
        nodeDataRefBounds.width = px(100);
        nodeDataRefBounds.height = px(44);
        nodeDataRef.setPropertyValue("view.bounds", nodeDataRefBounds);
        nodeDataRef.dontInstantiate = true;
        nodeDataRef.linkName = "cellData";
        nodeDataRef.hideCommonActions = true;
        nodeDataRef.hideLayoutProperties = true;
        nodeDataRef.isDeletable = false;
        nodeDataRef.isLocked = true;

        node.adopt(nodeLoadingRef);
        node.adopt(nodeNoDataRef);
        node.adopt(nodeDataRef);

    }


    exportNode(node: Layer, uniqueID: string, depth: number, exporter: IExporter, preAttach: boolean): string {
        let ret = "";
        let eq = " = ";
        let tab = "\t";
        let tabs = tab;
        let newLine = "\n";
        for (let i = 0; i <= depth; i++) {
            tabs += "\t";
        }
        if (!isDefined(node.children) || node.children.length !== 3) {
            return ret;
        }

        // row height
        ret += newLine;
        ret += tabs + uniqueID + ".listViewHeightForRow = function (listView, section, index) {" + newLine;
        ret += tabs + tab + "return " + this.heightForDataRow + ";" + newLine;
        ret += tabs + "}" + newLine;


        let cellLoadingNode = node.children[0];
        ret += newLine;
        ret += tabs + uniqueID + ".listViewDataIsLoading = function (listView, cell) {" + newLine;
        for (let i = 0; i < cellLoadingNode.children.length; i += 1) {
            ret += exporter.processNode(cellLoadingNode.children[i], cellLoadingNode.children[i].title, depth + 1, "cell");
        }
        ret += tabs + "}" + newLine;

        let cellNoDataNode = node.children[1];
        ret += newLine;
        ret += tabs + uniqueID + ".listViewNoDataToDisplay = function (listView, cell) {" + newLine;
        for (let i = 0; i < cellNoDataNode.children.length; i += 1) {
            ret += exporter.processNode(cellNoDataNode.children[i], cellNoDataNode.children[i].title, depth + 1, "cell");
        }
        ret += tabs + "}" + newLine;
        ;

        let cellData = node.children[2];
        ret += newLine;
        ret += tabs + uniqueID + ".listViewRowCellReady = function (listView, cell, section, index) {" + newLine;
        for (let i = 0; i < cellData.children.length; i += 1) {
            ret += exporter.processNode(cellData.children[i], cellData.children[i].title, depth + 1, "cell");
        }
        ret += tabs + "}" + newLine;


        return ret;

    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [
            ...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Selection",
                property_id: "listView.selection",
                group: "property",
                type: "dropdown",
                dataSource: [
                    {id: "singleSelection", text: "Single item"},
                    {id: "multiSelection", text: "Multiple items"},
                    {id: "noSelection", text: "No selection"}
                ],
                value: "singleSelection"
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Delegate",
                property_id: 'listView.delegate',
                group: "delegate",
                type: "string",
                value: ""
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Datasource",
                property_id: 'datasource.datasource',
                group: "delegate",
                type: "dataSource",
                value: null
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Data row height",
                property_id: 'listView.heightForDataRow',
                group: "property",
                type: "number",
                value: 44
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        switch (property_id) {
            case "listView.selection":
                if (value === "singleSelection") {
                    this.selectionMode = SelectionMode.singleSelection
                } else if (value === "noSelection") {
                    this.selectionMode = SelectionMode.noSelection;
                } else {
                    this.selectionMode = SelectionMode.multipleSelection;
                }
                break;
            case "listView.heightForDataRow":
                this.heightForDataRow = parseInt(value);
                if (isDefined(this.nodeDataRef)) {
                    let nodeDataRefBounds = this.nodeDataRef.bounds();
                    nodeDataRefBounds.height = px(parseInt(value));
                    this.nodeDataRef.setPropertyValue("view.bounds", nodeDataRefBounds);
                }
                break;
        }
    }


    buildLayoutViews() {
        let cellLoading = new LayerView();
        cellLoading.nodeId = this.nodeLoadingRef.id;
        cellLoading.nodeRef = this.nodeLoadingRef;
        cellLoading.nodeType = "frame";
        cellLoading.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 0,
                y: 0,
                width: parentBounds.width,
                height: 44,
                unit: 'px',
                position: 'absolute'
            };
        };
        cellLoading.initView(this.nodeLoadingRef.id);
        this.attach(cellLoading);

        let cellNoData = new LayerView();
        cellNoData.nodeId = this.nodeNoDataRef.id;
        cellNoData.nodeRef = this.nodeNoDataRef;
        cellNoData.nodeType = "frame";
        cellNoData.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 0,
                y: 44,
                width: parentBounds.width,
                height: 44,
                unit: 'px',
                position: 'absolute'
            };
        };
        cellNoData.initView(this.nodeNoDataRef.id);
        this.attach(cellNoData);

        let cellData = new LayerView();
        cellData.nodeId = this.nodeDataRef.id;
        cellData.nodeRef = this.nodeDataRef;
        cellData.nodeType = "frame";
        cellData.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            let parentNode = this.nodeRef.parentLayer;
            let heightForDataRow = parentNode.property("listView.heightForDataRow");
            return {
                x: 0,
                y: 88,
                width: parentBounds.width,
                height: parseInt(heightForDataRow.value),
                unit: 'px',
                position: 'absolute'
            };
        };
        cellData.initView(this.nodeDataRef.id);
        this.attach(cellData);

        this.layoutCellViewLoading = cellLoading;
        this.layoutCellViewNoData = cellNoData;
        this.layoutCellViewData = cellData;


        let canvas: ViewCanvas = Session.instance.getCurrentCanvas();

        canvas.viewRefs.push(this.layoutCellViewLoading);
        canvas.viewRefs.push(this.layoutCellViewNoData);
        canvas.viewRefs.push(this.layoutCellViewData);
    }


    render(parentBounds?: Bounds, style?: ViewStyle): void {
        super.render(parentBounds, style);

        if (this.noTabIndex === false)
            this.getDiv().tabIndex = '-1';

        if (this.direction === Direction.horizontal) {
            this.getDiv().style.overflowX = 'scroll';
            this.getDiv().style.overflowY = "hidden";
            /* has to be scroll, not auto */
            //this.getDiv().style.webkitOverflowScrolling = "touch";
        } else {
            this.getDiv().style.overflowX = 'hidden';
            this.getDiv().style.overflowY = "scroll";
            /* has to be scroll, not auto */
            //((this.getDiv() as any).style as any).webkitOverflowScrolling = "touch";
        }

        if (this.isLayoutEditor === true) {
            if (this.layoutCellViewLoading === undefined) {
                if (this.nodeLoadingRef === null) {
                    return;
                }
                this["buildLayoutViews"]();

            }

            this.layoutCellViewLoading.render();
            this.layoutCellViewNoData.render();
            this.layoutCellViewData.render();

            this.layoutCellViewLoading.doResize();
            this.layoutCellViewNoData.doResize();
            this.layoutCellViewData.doResize();

        } else {
            this.reloadData();
        }
    }


}