import {Bounds, DataSource, generateV4UUID, ImageView, LayerProperty, PXBounds} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {Layer} from "../Layer/Layer";


export class LayerDataSource extends DataSource implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerDataSource";
    exportClassName: "DataSource";

    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPositioning(containerNode: any, x: number, y: number): Bounds {
        return new Bounds(x, y, 48, 48);
    }

    viewWasAttached() {
        "use strict";
        if (this.isLayoutEditor === true) {
            let database_svg = 'PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJkYXRhYmFzZSIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLWRhdGFiYXNlIGZhLXctMTQiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDQ4IDUxMiI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNNDQ4IDczLjE0M3Y0NS43MTRDNDQ4IDE1OS4xNDMgMzQ3LjY2NyAxOTIgMjI0IDE5MlMwIDE1OS4xNDMgMCAxMTguODU3VjczLjE0M0MwIDMyLjg1NyAxMDAuMzMzIDAgMjI0IDBzMjI0IDMyLjg1NyAyMjQgNzMuMTQzek00NDggMTc2djEwMi44NTdDNDQ4IDMxOS4xNDMgMzQ3LjY2NyAzNTIgMjI0IDM1MlMwIDMxOS4xNDMgMCAyNzguODU3VjE3NmM0OC4xMjUgMzMuMTQzIDEzNi4yMDggNDguNTcyIDIyNCA0OC41NzJTMzk5Ljg3NCAyMDkuMTQzIDQ0OCAxNzZ6bTAgMTYwdjEwMi44NTdDNDQ4IDQ3OS4xNDMgMzQ3LjY2NyA1MTIgMjI0IDUxMlMwIDQ3OS4xNDMgMCA0MzguODU3VjMzNmM0OC4xMjUgMzMuMTQzIDEzNi4yMDggNDguNTcyIDIyNCA0OC41NzJTMzk5Ljg3NCAzNjkuMTQzIDQ0OCAzMzZ6Ij48L3BhdGg+PC9zdmc+';
            let img = new ImageView();
            img.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                return {
                    x: parentBounds.width / 2 - 48 / 2,
                    y: parentBounds.height / 2 - 48 / 2,
                    width: 48,
                    height: 48,
                    unit: 'px',
                    position: 'absolute'
                };
            };
            img.imageURI = 'data:image/svg+xml;base64,' + database_svg;
            img.imageWidth = 48;
            img.imageHeight = 48;
            img.initView(this.id + ".icon");
            this.attach(img);

        }
    }

    exportProperties(layoutEditorVersion): LayerProperty[] {
        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: "dataSource.delegate",
                title: "Datasource",
                group: "delegate",
                type: "dataSource",
                value: JSON.parse(JSON.stringify({
                    datasource_type: 'json',
                    data: {},
                    remote_uri: '',
                    remote_method: 'GET',
                    remote_paremeters: []
                }))
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: "dataSource.delegateString",
                title: "Delegate",
                group: "delegate",
                type: "string",
                value: ""
            }
        ];
    }


    applyLayoutProperty(property, value) {

    }


}
