import {generateV4UUID, LayerProperty, px} from "mentatjs";



export function viewStyleProperties (disableFill): LayerProperty[] { return JSON.parse(JSON.stringify([
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Visible",
        property_id: "view.visible",
        group: "property",
        type: "boolean",
        value: true
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Opacity",
        property_id: "view.opacity",
        group: "style",
        type: "slider",
        min: 0,
        max: 100,
        value: 100
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Blending Mode",
        property_id: "view.blendingMode",
        group: "style",
        type: "dropdown",
        dataSource: { dsID: 'view.blendingMode'},
        value: 'normal'
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Radius",
        property_id: "view.borderRadius",
        group: "style",
        type: "radius",
        value: { tl: px(0), tr: px(0), bl: px(0), br: px(0) }
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Overflow",
        property_id: "view.overflow",
        group: "style",
        type: "dropdown",
        dataSource: { dsID: "view.overflow"},
        value: "visible"
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Fills",
        property_id: "view.fills",
        group: "style",
        type: "fills",
        value: [{ active: (disableFill === true) ? false : true, type: "color", blendMode: "normal", opacity: 100, value: "rgb(255,255,255)"}]
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Borders",
        property_id: "view.borders",
        group: "style",
        type: "borders",
        value: [{ active: false, value: '', thickness: 1, pattern: 'solid'}]
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Shadows",
        property_id: "view.shadows",
        group: "style",
        type: "shadows",
        value: []
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Cursor",
        property_id: "view.cursor",
        group: "style",
        type: "dropdown",
        dataSource: { dsID: 'view.cursor' },
        value: 'default'
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "User Select",
        property_id: "view.userSelect",
        group: "style",
        type: "dropdown",
        dataSource: { dsID: 'view.userSelect'},
        value: 'none'
    },
    {
        kind: "LayerProperty",
        id: generateV4UUID(),
        title: "Extra CSS",
        property_id: "view.extracss",
        group: 'hidden_style',
        type: 'string',
        value: ''
    }
]));
}

