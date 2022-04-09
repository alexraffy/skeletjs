import {
    Bounds,
    generateV4UUID,
    ImageView,
    isDefined,
    Label,
    LayerProperty, NUConvertToPixel,
    View,
    ViewStyle
} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {viewStyleProperties} from "../Canvas/viewStyleProperties";
import {getEnvironment} from "../Environment/getEnvironment";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";


export class LayerImageView extends ImageView implements ILayoutEditorView {

    nodeId: string;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerImageView";
    exportClassName: "ImageView";

    isSymbol: boolean = false;

    constructor() {
        super();
    }

    layoutEditorPropertyValueForExporter(property: LayerProperty, depth: number, exporterID: string): { setterName: string; stringValue: string }[] {
        switch (property.property_id) {
            case "view.enabled":
                return [{setterName: "enabled", stringValue: ((property.value as boolean) === true) ? "true" : "false" }];
            case "image.uri":
                return [{setterName: "imageURI", stringValue: `'${property.value as string}'`}];
            case "image.width":
                return [{setterName: "imageWidth", stringValue: `${property.value}`}];
            case "image.height":
                return [{setterName: "imageHeight", stringValue: `${property.value}`}];
        }

        return undefined;
    }




    layoutEditorLibraryLayer(layer: Layer) {

    }

    layoutEditorPositioning(containerNode: Layer, x: number, y: number): Bounds {
        return new Bounds(x, y, 48, 48);
    }

    exportProperties(layoutEditorVersion: string): LayerProperty[] {
        return [...viewStyleProperties(true),
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Image URI",
                property_id: "image.uri",
                group: "property",
                type: "image",
                value: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiBoZWlnaHQ9IjMycHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJwaG90b18xXyI+PHBhdGggZD0iTTI3LDBINUMyLjc5MSwwLDEsMS43OTEsMSw0djI0YzAsMi4yMDksMS43OTEsNCw0LDRoMjJjMi4yMDksMCw0LTEuNzkxLDQtNFY0QzMxLDEuNzkxLDI5LjIwOSwwLDI3LDB6ICAgIE0yOSwyOGMwLDEuMTAyLTAuODk4LDItMiwySDVjLTEuMTAzLDAtMi0wLjg5OC0yLTJWNGMwLTEuMTAzLDAuODk3LTIsMi0yaDIyYzEuMTAyLDAsMiwwLjg5NywyLDJWMjh6IiBmaWxsPSIjMzMzMzMzIi8+PHBhdGggZD0iTTI2LDRINkM1LjQ0Nyw0LDUsNC40NDcsNSw1djE4YzAsMC41NTMsMC40NDcsMSwxLDFoMjBjMC41NTMsMCwxLTAuNDQ3LDEtMVY1QzI3LDQuNDQ3LDI2LjU1Myw0LDI2LDR6ICAgIE0yNiw1djEzLjg2OWwtMy4yNS0zLjUzQzIyLjU1OSwxNS4xMjMsMjIuMjg3LDE1LDIyLDE1cy0wLjU2MSwwLjEyMy0wLjc1LDAuMzM5bC0yLjYwNCwyLjk1bC03Ljg5Ni04Ljk1ICAgQzEwLjU2LDkuMTIzLDEwLjI4Nyw5LDEwLDlTOS40NCw5LjEyMyw5LjI1LDkuMzM5TDYsMTMuMDg3VjVIMjZ6IE02LDE0LjZsNC00LjZsOC4wNjYsOS4xNDNsMC41OCwwLjY1OEwyMS40MDgsMjNINlYxNC42eiAgICBNMjIuNzQsMjNsLTMuNDI4LTMuOTU1TDIyLDE2bDQsNC4zNzlWMjNIMjIuNzR6IiBmaWxsPSIjMzMzMzMzIi8+PHBhdGggZD0iTTIwLDEzYzEuNjU2LDAsMy0xLjM0MywzLTNzLTEuMzQ0LTMtMy0zYy0xLjY1OCwwLTMsMS4zNDMtMywzUzE4LjM0MiwxMywyMCwxM3ogTTIwLDhjMS4xMDIsMCwyLDAuODk3LDIsMiAgIHMtMC44OTgsMi0yLDJjLTEuMTA0LDAtMi0wLjg5Ny0yLTJTMTguODk2LDgsMjAsOHoiIGZpbGw9IiMzMzMzMzMiLz48L2c+PC9zdmc+'
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Image Width",
                property_id: "image.width",
                group: "property",
                type: "number",
                value: 48
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Image Height",
                property_id: "image.height",
                group: "property",
                type: "number",
                value: 48
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                title: "Fit",
                property_id: 'image.fit',
                group: 'property',
                type: 'dropdown',
                dataSource: [
                    {id: 'fill', text: 'Fill'},
                    {id: 'contain', text: 'Contain'},
                    {id: 'cover', text: 'Cover'},
                    {id: 'none', text: 'None'},
                    {id: 'scale-down', text: 'Scale down'}
                ],
                value: 'fill'
            }
        ];
    }
    viewStyleApplyProperties =  viewStyleApplyProperties;

    applyLayoutProperty = function (property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        switch (property_id) {
            case "image.uri":
                this.imageURI = value;
                break;
            case "image.width":
                this.imageWidth = value;
                break;
            case "image.height":
                this.imageHeight = value;
                break;
            case "image.fit":
                this.fit = value;
                break;
        }
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        let bounds = this.getBounds();
        this.innerImg.style.width = NUConvertToPixel(bounds.width).amount + "px";
        this.innerImg.style.height = NUConvertToPixel(bounds.height).amount + "px";
        this.innerImg.style.position = bounds.position;

        if (this.imageURI.indexOf('@') === 0 && isDefined(getEnvironment().Assets)) {
            let id = this.imageURI;
            let asset = getEnvironment().Assets.find((elem) => {
                return "@" + elem.id === id;
            });
            if (isDefined(asset)) {
                if (isDefined(asset.currentPath)) {
                    this.innerImg.src = asset.currentPath;
                    this.innerImg.style.imageOrientation = 'from-image';
                } else {
                    this.innerImg.src = asset.b64Prefix + asset.data;
                }
            }
        } else {
            this.innerImg.src = this.imageURI;
        }
        this.innerImg.style.objectFit = this.fit;
        this.innerImg.style.overflow = 'hidden';
    }

    layoutEditorListIcon(): (layer: Layer, bounds: Bounds)=>View {
        let ret = (layer: Layer, bounds: Bounds): View => {
            let v = new Label();
            v.boundsForView = function (parentBounds: Bounds): Bounds {
                return this.keyValues["Bounds"];
            }
            v.keyValues["Layer"] = layer;
            v.keyValues["Bounds"] = bounds;
            v.fillLineHeight = true;
            v.textAlignment = 'center';
            v.fontSize = 12;
            v.fontWeight = '300';
            v.fontColor = "rgb(255,255,255)";
            v.fontFamily = 'FontAwesome5ProRegular, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            v.fills = [];
            v.text = "&#xf03e;";

            v.initView(generateV4UUID() + ".listIcon");
            return v;
        }
        return ret;
    }




}