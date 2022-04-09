import {Bounds, boundsWithPixels, generateV4UUID, isDefined, LayerProperty, Video} from "mentatjs";
import {ILayoutEditorView} from "../Layer/ILayoutEditorView";
import {getEnvironment} from "../Environment/getEnvironment";
import {viewStyleApplyProperties} from "../Layer/viewStyleApplyProperties";
import {Layer} from "../Layer/Layer";
import {Session} from "../Session/Session";
import {Asset} from "../Document/Asset";


export class LayerVideo extends Video implements ILayoutEditorView {

    nodeId: string;
    nodeRef?: Layer;
    isNodeTitle: boolean;
    isLayoutEditor: boolean;
    pageLayerRef: Layer;
    layerProperties: LayerProperty[];
    className: "LayerVideo";
    exportClassName: "Video";

    isSymbol: boolean = false;

    constructor() {
        super();
    }


    layoutEditorPositioning(container: Layer, x: number, y: number) {
        return boundsWithPixels({
            x: x,
            y: y,
            width: 320,
            height: 240,
            unit: 'px',
            position: "absolute"
        });
    }

    exportProperties(layoutVersion: string): LayerProperty[] {
        return [
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: 'video.sourceFile',
                title: 'Source',
                group: 'property',
                type: 'resource',
                dataSource: [{id: '*.mp4', text: "MP4 file"}],
                value: 'https://movietrailers.apple.com/movies/independent/ramen-shop/ramen-shop-trailer-1_i320.m4v'
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: 'video.poster',
                title: "Poster",
                group: "property",
                type: "resource",
                dataSource: [{id: '*.png', text: 'PNG file'}],
                value: ''
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: 'video.showControls',
                title: 'Show Controls',
                group: 'property',
                type: 'boolean',
                value: true
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: 'video.autoPlay',
                title: 'Autoplay',
                group: 'property',
                type: 'boolean',
                value: false
            },
            {
                kind: "LayerProperty",
                id: generateV4UUID(),
                property_id: 'video.allowAirplay',
                title: 'Airplay',
                group: 'property',
                type: 'boolean',
                value: false
            }
        ];
    }

    viewStyleApplyProperties = viewStyleApplyProperties;

    applyLayoutProperty(property_id: string, value: any) {
        this.viewStyleApplyProperties(property_id, value);
        if (property_id === 'video.sourceFile') {
            if (value.startsWith('@')) {
                let resourceId = value.substr(1);
                let resource = getEnvironment().Assets.find((elem) => { return elem.id === resourceId; });
                this.source = value;
                this.sourceType = resource.mime;
            } else {
                this.source = value;
                if (value.indexOf('.mp4')) {
                    this.sourceType = 'video/mp4';
                } else if (value.indexOf('.ogg')) {
                    this.sourceType = 'video/ogg';
                }
            }
        }
    }


    render() {
        if (this._videoDiv) {
            while (this._videoDiv.hasChildNodes()) {
                this._videoDiv.removeChild(this._videoDiv.lastChild);
            }
            let bounds: Bounds = this.getBounds("");
            this._videoDiv.width = bounds.width;
            this._videoDiv.height = bounds.height;
            if (this.autoPlay === true) {
                this._videoDiv.setAttribute('autoplay', 'autoplay');
            }
            if (this.showControls === true) {
                this._videoDiv.setAttribute('controls', 'controls');
            }
            if (this.allowAirplay === true) {
                this._videoDiv.setAttribute('airplay', true);
                this._videoDiv.setAttribute('x-webkit-airplay', true);
            }

            var source = document.createElement('source');

            if (this.source.indexOf('@') === 0) {
                let id = this.source;
                let asset: Asset = undefined;
                for (let i = 0; i < Session.instance.currentDocument.resources.length; i += 1) {
                    if (Session.instance.currentDocument.resources[i].mime.startsWith('video')) {
                        if ("@" + Session.instance.currentDocument.resources[i].id === this.source) {
                            asset = Session.instance.currentDocument.resources[i].data as Asset;
                            break;
                        }
                    }
                }
                if (isDefined(asset)) {
                    if (isDefined(asset.currentPath)) {
                        this._videoDiv.setAttribute('src', asset.currentPath);
                    }
                }
            } else {
                this._videoDiv.setAttribute('src', this.source); // 'https://movietrailers.apple.com/movies/independent/ramen-shop/ramen-shop-trailer-1_i320.m4v');
            }


            this._videoDiv.appendChild(source);
        }
    }

}