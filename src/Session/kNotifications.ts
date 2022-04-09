



export enum kNotifications {
    // the current workspace has changed
    noticeWorkspaceLoaded = "noticeWorkspaceLoaded",
    noticeProjectLoaded = "noticeProjectLoaded",

    // the user selected a layer on the canvas
    kSelectionChangedOnCanvas = "kSelectionChangedOnCanvas",

    // update the symbol/components/controls list
    noticeUpdateLibrary = "noticeUpdateLibrary",
    // force a redraw of the layers list
    noticeRedrawLayerList = "noticeRedrawLayerList",
    // a layer was selected
    noticeNodeSelected = "noticeNodeSelected",
    noticeNodeDeletedFromCanvas = "noticeNodeDeletedFromCanvas",
    noticeHistoryAdded = "noticeHistoryAdded",
    noticeMultipleSelection = "noticeMultipleSelection",

    // redraw a layer, sender: parentLayer or {} if on canvas, arg: Layer
    kRedrawSubView = "kRedrawSubView",
    noticeKeyUp = "noticeKeyUp",
    noticeKeyDown = "noticeKeyDown",
    noticeZoomChanged = "noticeZoomChanged",
    noticeRedrawUserComponent = "noticeRedrawUserComponent",

    noticeSymbolDropped = "noticeSymbolDropped",
    noticeLayerHoverIn = "noticeLayerHoverIn",
    noticeLayerHoverOut = "noticeLayerHoverOut",

    // dismiss popovers
    noticeBodyClicked = "noticeBodyClicked",
    noticeExitTextEditMode = "noticeExitTextEditMode",

    // request a pane to be shown
    noticeShowPane = "noticeShowPane",


    // update the NPM pane if visible
    noticeNPMPackage = "noticeNPMPackage",

    // the user selected a different exporter
    noticeExportFormatChanged = "noticeExportFormatChanged",

    // Properties pane
    noticeUpdateCoordinates = "noticeUpdateCoordinates",
    noticeUpdateGroupSelectionCoordinates = "noticeUpdateGroupSelectionCoordinates",
    noticeTextStyleChanged = "noticeTextStyleChanged",
    noticeUpdatedProperty = "noticeUpdatedProperty",

    // Assets
    noticeResourceSelected = "noticeResourceSelected",
    noticeAssetListChanged = "noticeAssetListChanged",


    // Swatches
    noticeListSwatches = "noticeListSwatches",
    noticeListSwatchesResult = "noticeListSwatchesResult",
    noticeSwatchInfo = "noticeSwatchInfo",
    noticeSwatchInfoResult = "noticeSwatchInfoResult",
    noticeSwatchColorAdded = "noticeSwatchColorAdded",
    noticeSwatchColorSelected = "noticeSwatchColorSelected",

    // Files
    noticeNewFile = "noticeNewFile",
    noticeOpenFile = "noticeOpenFile",


    noticePreviewUpdate = "noticePreviewUpdate",
    noticePreviewRequestUpdate = "noticePreviewRequestUpdate",

    noticeOpenCodeEditor  = "noticeOpenCodeEditor",


    noticeMouseInfo = "noticeMouseInfo",
    noticeRedrawZoomPanel = "noticeRedrawZoomPanel"

};
