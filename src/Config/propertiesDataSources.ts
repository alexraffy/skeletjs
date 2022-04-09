import {PropertyDataSource} from "../Loader/Databases/PropertyDataSource";


export const dsViewBlendingMode: PropertyDataSource =
{
    id: "view.blendingMode",
    title: "Blending Mode",
    userEditable: false,
    dataSource:
        [
            { id: "normal", text: "normal" },
            { id: "multiply", text: "multiply" },
            { id: "screen", text: "screen" },
            { id: "overlay", text: "overlay" },
            { id: "darken", text: "darken" },
            { id: "lighten", text: "lighten" },
            { id: "color-dodge", text: "color-dodge" },
            { id: "color-burn", text: "color-burn"},
            { id: "hard-light", text: "hard-light"},
            { id: "soft-light", text: "soft-light"},
            { id: "difference", text: "difference"},
            { id: "exclusion", text: "exclusion"},
            { id: "hue", text: "hue"},
            { id: "saturation", text: "saturation" },
            { id: "color", text: "color" },
            { id: "luminosity", text: "luminosity" }
        ]
};

export const dsViewOverflow: PropertyDataSource =
    {
        id: 'view.overflow',
        title: "Overflow",
        userEditable: false,
        dataSource: [
            {
                id: 'visible', text: "Visible"
            },
            {
                id: 'hidden', text: "Hidden"
            },
            {
                id: "scroll", text: "Scroll"
            },
            {
                id: 'scrollX', text: "Scroll Horizontally"
            },
            {
                id: 'scrollY', text: "Scroll Vertically"
            }
        ]
    };


export const dsViewCursor: PropertyDataSource = {
    id: 'view.cursor',
    title: "Cursor",
    userEditable: false,
    dataSource: [
        {'id':'alias','text':'alias'},
        {'id':'all-scroll','text':'all-scroll'},
        {'id':'auto','text':'auto'},
        {'id':'cell','text':'cell'},
        {'id':'context-menu','text':'context-menu'},
        {'id':'col-resize','text':'col-resize'},
        {'id':'copy','text':'copy'},
        {'id':'crosshair','text':'crosshair'},
        {'id':'default','text':'default'},
        {'id':'e-resize','text':'e-resize'},
        {'id':'ew-resize','text':'ew-resize'},
        {'id':'grab','text':'grab'},
        {'id':'grabbing','text':'grabbing'},
        {'id':'help','text':'help'},
        {'id':'move','text':'move'},
        {'id':'n-resize','text':'n-resize'},
        {'id':'ne-resize','text':'ne-resize'},
        {'id':'nesw-resize','text':'nesw-resize'},
        {'id':'ns-resize','text':'ns-resize'},
        {'id':'nw-resize','text':'nw-resize'},
        {'id':'nwse-resize','text':'nwse-resize'},
        {'id':'no-drop','text':'no-drop'},
        {'id':'none','text':'none'},
        {'id':'not-allowed','text':'not-allowed'},
        {'id':'pointer','text':'pointer'},
        {'id':'progress','text':'progress'},
        {'id':'row-resize','text':'row-resize'},
        {'id':'s-resize','text':'s-resize'},
        {'id':'se-resize','text':'se-resize'},
        {'id':'sw-resize','text':'sw-resize'},
        {'id':'text','text':'text'},
        {'id':'vertical-text','text':'vertical-text'},
        {'id':'w-resize','text':'w-resize'},
        {'id':'wait','text':'wait'},
        {'id':'zoom-in','text':'zoom-in'},
        {'id':'zoom-out','text':'zoom-out'}
    ]
};


export const dsViewUserSelect: PropertyDataSource = {
    id: "view.userSelect",
    title: "User Select",
    userEditable: false,
    dataSource: [
        {'id': 'none', 'text': 'none'},
        {'id': 'text', 'text': 'text'},
        {'id': 'all', 'text': 'all'},
        {'id': 'auto', 'text': 'auto'},
        {'id': 'contain', 'text': 'contain'}
    ]
};
