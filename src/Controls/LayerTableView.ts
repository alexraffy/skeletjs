import {
    boundsWithPixels,
    CheckBox,
    DataSource,
    generateV4UUID, isDefined,
    LayerProperty,
    Logging,
    px,
    PXBounds,
    TableView,
    TableViewColumn,
    View
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {LayerCheckBox} from "./LayerCheckBox";
import {ViewCanvas} from "../Canvas/ViewCanvas";

import {LayerLabel} from "./LayerLabel";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {PropertyDataSource} from "../Loader/Databases/PropertyDataSource";
import {SkLogger} from "../Logging/SkLogger";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {Session} from "../Session/Session";
import {SkeletControl} from "../Plugin/SkeletControl";
import {findControlForClassName} from "../Plugin/findControlForClassName";


export class LayerTableView extends TableView implements ILayoutEditorView {

    nodeId: string;
    nodeRef?: Layer;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerTableView";
    exportClassName: "TableView";

    isSymbol: boolean = false;


    layoutEditorColumnsViewRefs: (ILayoutEditorView & View)[];

    constructor() {
        super();
        this.layoutEditorColumnsViewRefs = [];
    }


    layoutEditorPositioning(containerNode: Layer, x: number, y: number) {
        return boundsWithPixels({x: x, y: y, width: 600, height: 300});
    }


    layoutEditorLibraryLayer(layer: Layer) {



    }


    layoutEditorViewForSubNode(node: Layer, subNode: Layer): (ILayoutEditorView & View) {
        SkLogger.write("looking for subNode id " + subNode.id + " linkName " + subNode.linkName);
        console.dir(this.layoutEditorColumnsViewRefs);
        let found = this.layoutEditorColumnsViewRefs.find((elem) => {
            return elem.keyValues["column_id"] === subNode.linkName;
        });
        SkLogger.write("found ", found);
        return found;
    }


    layoutEditorAddColumn(nodePtr: Layer, id: string, title: string, defaultCell: string, width: number) {

        let column1 = Layer.create(title, "object", defaultCell); // MentatJS.LayoutEditor.Code.newNode("object", title, defaultCell);
        let column1Bounds = column1.rawBounds();
        column1Bounds.x = px(0);
        column1Bounds.y = px(0);
        column1Bounds.width = px(width);
        column1Bounds.height = px(44);
        column1.setPropertyValue("view.bounds", column1Bounds);
        column1.dontInstantiate = true;
        column1.linkName = id;
        column1.hideCommonActions = true;
        column1.hideLayoutProperties = true;
        column1.isDeletable = false;
        column1.isLocked = true;

        nodePtr.adopt(column1);
    }


    layoutEditorNodeAdded(nodePtr: Layer) {
        this.layoutEditorAddColumn(nodePtr, "fullname", "Fullname", "MentatJS.Label", -1);
        this.layoutEditorAddColumn(nodePtr, "company", "Company", "MentatJS.Label", 150);
        this.layoutEditorAddColumn(nodePtr, "email", "Email", "MentatJS.Label", 150);
        this.layoutEditorAddColumn(nodePtr, "Title", "Position", "MentatJS.Label", 150);
    }


    exportProperties(layoutEditorVersion: string): LayerProperty[] {

        let ds = new PropertyDataSource();
        ds.id = generateV4UUID();
        ds.title = "Sample Datasource";
        ds.userEditable = true;
        ds.dataSource =
                [{
                    "id": "1",
                    "fullname": "Remington Newlands",
                    "company": "Babblestorm",
                    "email": "rnewlands0@usda.gov",
                    "Title": "Human Resources Assistant I"
                }, {
                    "id": "2",
                    "fullname": "Kara Rowaszkiewicz",
                    "company": "Jayo",
                    "email": "krowaszkiewicz1@unc.edu",
                    "Title": "Budget/Accounting Analyst IV"
                }, {
                    "id": "3",
                    "fullname": "Christine Hansley",
                    "company": "Viva",
                    "email": "chansley2@wix.com",
                    "Title": "Payment Adjustment Coordinator"
                }, {
                    "id": "4",
                    "fullname": "Aldous Singleton",
                    "company": "Katz",
                    "email": "asingleton3@cornell.edu",
                    "Title": "Software Test Engineer IV"
                }, {
                    "id": "5",
                    "fullname": "Sax Scrivenor",
                    "company": "Shufflester",
                    "email": "sscrivenor4@ustream.tv",
                    "Title": "GIS Technical Architect"
                }, {
                    "id": "6",
                    "fullname": "Timi Millican",
                    "company": "Edgeclub",
                    "email": "tmillican5@amazon.com",
                    "Title": "Senior Sales Associate"
                }, {
                    "id": "7",
                    "fullname": "Wilburt Ekell",
                    "company": "Lajo",
                    "email": "wekell6@arizona.edu",
                    "Title": "Software Test Engineer III"
                }, {
                    "id": "8",
                    "fullname": "Nani Carbry",
                    "company": "Trudeo",
                    "email": "ncarbry7@usatoday.com",
                    "Title": "Software Test Engineer IV"
                }, {
                    "id": "9",
                    "fullname": "L;urette Jeste",
                    "company": "Voonyx",
                    "email": "ljeste8@tumblr.com",
                    "Title": "Analyst Programmer"
                }, {
                    "id": "10",
                    "fullname": "Jeannine Giacovelli",
                    "company": "Demivee",
                    "email": "jgiacovelli9@deliciousdays.com",
                    "Title": "Occupational Therapist"
                }];

        return [
            ...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Columns",
                property_id: "tableView.editColumns",
                group: "property",
                type: "custom",
                customType: "tableView.editColumns",
                value: JSON.parse(JSON.stringify([{
                    id: "fullname",
                    "title": "Full Name",
                    "defaultCell": "MentatJS.Label",
                    "width": -1,
                    "properties": [
                        ...(new LayerLabel().exportProperties(""))
                    ],
                    field: "fullname"
                },
                    {
                        id: "company",
                        "title": "Company",
                        "defaultCell": "MentatJS.Label",
                        "width": 150,
                        "properties": [
                            ...(new LayerLabel().exportProperties(""))
                        ],
                        field: "company"
                    },
                    {
                        id: "email",
                        "title": "Email",
                        "defaultCell": "MentatJS.Label",
                        "width": 150,
                        "properties": [
                            ...(new LayerLabel().exportProperties(""))
                        ],
                        field: "email"
                    },
                    {
                        id: "Title",
                        "title": "Position",
                        "defaultCell": "MentatJS.Label",
                        "width": 150,
                        "properties": [
                            ...(new LayerLabel().exportProperties(""))
                        ],
                        field: "Title"
                    }


                ]))
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Drag Rows",
                property_id: "tableView.reorderRows",
                group: "property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Row Margin",
                property_id: "tableView.rowMargin",
                group: "property",
                type: "number",
                value: 5
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Separate Rows",
                property_id: "tableView.separateRow",
                group: "property",
                type: "boolean",
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Add Row Label",
                property_id: "tableView.addRowLabel",
                group: "property",
                type: "string",
                value: ""
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Select Column",
                property_id: "tableView.selectColumn",
                group: "property",
                type: "boolean",
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Delegate",
                property_id: 'tableView.delegate',
                group: "delegate",
                type: "string",
                value: ""
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Datasource",
                property_id: 'tableView.datasource',
                group: "delegate",
                type: "dataSource",
                value: ds
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        switch (property_id) {
            case "tableView.editColumns":
                this.jsonColumns = value;
                break;
            case "tableView.datasource":
                if (isDefined(value)) {
                    let ds = new DataSource();
                    ds.initWithData({rows: (value as PropertyDataSource).dataSource});
                    this.bindDataSource(ds);
                }
                break;
            case "tableView.reorderRows":
                this.allowReorder = value;
                break;
            case "tableView.rowMargin":
                this.rowMargin = parseInt(value);
                break;
            case "tableView.separateRow":
                this.separateRows = value;
                break;
            case "tableView.addRowLabel":
                this.addRowLabel = value;
                break;
            case "tableView.selectColumn":
                this.showSelectionCheckbox = value;
                break;
        }
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        let eq = " = ";

        if (exporterID === "Skelet/MentatJS") {
            switch (property.property_id) {
                case "tableView.editColumns":
                    return [{setterName: "jsonColumns", stringValue: JSON.stringify(this.jsonColumns) }];
                case "tableView.reorderRows":
                    return [{setterName: "allowReorder", stringValue: ((this.allowReorder === true) ? "true" : "false") }];
                case "tableView.rowMargin":
                    return [{setterName: "rowMargin", stringValue: this.rowMargin.toString()}];
                case "tableView.separateRow":
                    return [{setterName: "separateRows", stringValue: ((this.separateRows === true) ? "true" : "false")}];
                case "tableView.addRowLabel":
                    return [{setterName: "addRowLabel", stringValue: "'" + this.addRowLabel + "'"}];
                case "tableView.selectColumn":
                    return [{setterName: "showSelectionCheckbox", stringValue: ((this.showSelectionCheckbox === true) ? "true" : "false")}];
                case "tableView.delegate":
                    return [{setterName: "delegate", stringValue: 'undefined'}];
                case "tableView.datasource":
                    if (isDefined(property.value)) {
                        // is it a remote dataSource ?
                        if (property.value.kind === "PropertyDataSource") {
                            return [{setterName: "dataSource", stringValue: `new RemoteDataSource(${(property.value as PropertyDataSource).remoteDataSource})`}];
                        } else {
                            return [{setterName: "dataSource", stringValue: JSON.stringify(this.dataSource)}];
                        }
                    } else {
                        return [{setterName: "dataSource", stringValue: "undefined"}];
                    }
            }
        }
        return undefined;
    }


    tableViewControlCellForPath(tableView: TableView, columnInfo: TableViewColumn, columnIndex: number) {
        try {
            let sk: SkeletControl = findControlForClassName(columnInfo.defaultCell);
            let v = Object.assign(new sk.controlClass(), {});
            return v;
        } catch (_) {
            SkLogger.write(`Could not instantiate ${columnInfo.defaultCell} for column ${columnInfo.title}`);
        }
        return undefined;
    }


    tableViewCellForPath(tableView: TableView, cell: View, path: { row: number, col: number }) {
        "use strict";
        let item = null;
        if (isDefined(tableView.dataSource)) {
            item = tableView.dataSource.objectForSortedIndex(path.row);
        }

        if (path.col === 0 && this.showSelectionCheckbox === true) {
            let chk = new CheckBox();
            chk.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: parentBounds.width / 2 - 20 / 2,
                    y: parentBounds.height / 2 - 20 / 2,
                    width: 20,
                    height: 20,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            chk.checked = false;
            chk.initView(cell.id + ".chk");
            cell.attach(chk);
            return;
        }

        if (isDefined(this.jsonColumns)) {
            let idx = path.col;
            if (this.showSelectionCheckbox === true) {
                idx = idx - 1;
            }
            if (idx < this.jsonColumns.length) {
                if (isDefined(this.jsonColumns[idx])) {
                    let col = this.jsonColumns[idx];
                    if (Logging.enableLogging === true) {
                        SkLogger.write("JSONCOLUMN: ", col);
                    }
                    if (isDefined(col.defaultCell)) {

                        //try {
                        let v: View & ILayoutEditorView = null;
                        if (this.tableViewControlCellForPath) {
                            v = this.tableViewControlCellForPath(this, col, idx);
                        } else {
                            eval("v = new " + col.defaultCell + "();");
                        }

                        SkLogger.write("instantiating " + col.defaultCell + " for column " + col.id);
                        if (this.isLayoutEditor === true) {
                            // find the column node
                            let colNodeRef: Layer = null;
                            for (let i = 0; i < this.nodeRef.children.length; i += 1) {
                                if (this.nodeRef.children[i].linkName === col.id) {
                                    colNodeRef = this.nodeRef.children[i];
                                    break;
                                }
                            }
                            if (isDefined(colNodeRef)) {
                                v.id = colNodeRef.id;
                                v.isLayoutEditor = true;

                                v.nodeId = colNodeRef.id;

                                let canvas: ViewCanvas = Session.instance.getCurrentCanvas();

                                canvas.deleteViewRef(colNodeRef.id);
                                canvas.viewRefs.push(v);


                                // apply properties
                                if (colNodeRef.properties) {
                                    for (let i = 0; i < colNodeRef.properties.length; i += 1) {
                                        v.applyLayoutProperty(colNodeRef.properties[i].property_id, colNodeRef.properties[i].value);
                                    }
                                }

                            }




                        } else {
                            v.id = generateV4UUID();
                        }

                        v.keyValues["column_id"] = col.id;

                        v.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                            if (isDefined(this.defaultSize)) {
                                return {
                                    x: parentBounds.width / 2 - this.defaultSize[0] / 2,
                                    y: parentBounds.height / 2 - this.defaultSize[1] / 2,
                                    width: this.defaultSize[0],
                                    height: this.defaultSize[1],
                                    unit: 'px',
                                    position: 'absolute'
                                };
                            }
                            return {
                                x: 5,
                                y: 0,
                                width: parentBounds.width - 10,
                                height: parentBounds.height,
                                unit: 'px',
                                position: "absolute"
                            };
                        };
                        if (col.defaultCell === 'Checkbox' || col.defaultCell === "MentatJS.Checkbox") {
                            if (col.field !== null) {
                                if (isDefined(item)) {
                                    (<LayerCheckBox>v).checked = item[col.field] === true;
                                    v.setActionDelegate({
                                        item: item,
                                        field: col.field,
                                        onClick: function (sender) {
                                            this.item[this.field] = !this.item[this.field];
                                        }
                                    }, "onClick");
                                }
                            }
                        }
                        if (col.defaultCell === "Label" || col.defaultCell === "MentatJS.Label") {
                            (<LayerLabel>v).text = "Label";
                            (<LayerLabel>v).fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                            (<LayerLabel>v).fontSize = 12;
                            (<LayerLabel>v).fontWeight = '300';
                            (<LayerLabel>v).extracss = "overflow: hidden;text-overflow: ellipsis;pointer-events:none;";
                            if (col.field !== null) {
                                if (isDefined(item)) {
                                    (<LayerLabel>v).text = item[col.field];
                                }
                            }
                            if (isDefined(col.functions)) {
                                for (let fi = 0; fi < col.functions.length; fi += 1) {
                                    let fn = "function (labelView, dataSourceItem) { " + col.functions[fi] + " }";
                                    try {
                                        let myFunc = null;
                                        eval("myFunc = " + fn);
                                        if (myFunc !== null) {
                                            myFunc(v, item);
                                        }

                                    } catch (e) {
                                        console.warn(e.message);
                                    }
                                }
                            }
                            (<LayerLabel>v).fillLineHeight = true;
                        }


                        if (isDefined(this.delegate) && isDefined(this.delegate.tableViewControlCellWillInit)) {
                            this.delegate.tableViewControlCellWillInit(this, cell, v, item, col, path);
                        }

                        v.initView(cell.id + ".v");
                        cell.attach(v);


                        if (isDefined(this.delegate) && isDefined(this.delegate.tableViewControlCellWasAttached)) {
                            this.delegate.tableViewControlCellWasAttached(this, cell, v, item, col, path);
                        }
                        this.layoutEditorColumnsViewRefs.push(v);
                        return;
                        //} catch (exception) {
                        //    console.warn(exception.message);
                        //}
                    }
                }
            }
            return;
        }
        let label = new LayerLabel();
        label.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            return {
                x: 5,
                y: 0,
                width: parentBounds.width - 10,
                height: parentBounds.height,
                unit: 'px',
                position: "absolute"
            };
        };
        label.fillLineHeight = true;
        label.text = "Label";
        label.initView(cell.id + ".label");
        cell.attach(label);
        this.layoutEditorColumnsViewRefs.push(label);

    }


    prepareDrawCells() {
        this.layoutEditorColumnsViewRefs = [];

        this.viewContentContainer.growths = [];
        this.growths = [];

    }


    tableViewNumberOfRows(tableView: TableView): number {
        if (isDefined(this.dataSource)) {
            return this.dataSource.numberOfItems();
        }
        if (this.isLayoutEditor === true) {
            return 1;
        }
        return 0;
    }


}