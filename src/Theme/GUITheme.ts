import {ViewStyle} from "mentatjs";


export interface GUITheme {
    kind: "GUITheme",
    readonly titleBarStyle: ViewStyle[];
    readonly titleBarButtonStyle: ViewStyle[];
    readonly titleBarDropdownStyle: ViewStyle[];

    readonly dropdownStyle: ViewStyle[];
    readonly buttonStyle: ViewStyle[];
    readonly panelBarStyle: ViewStyle[];
    readonly popoverStyle: ViewStyle[];
    readonly labelStyleTitle: ViewStyle[];
    readonly labelStyleItem: ViewStyle[];
    readonly labelStyleSmall: ViewStyle[];

    readonly toolbarStyle: ViewStyle[];

    readonly codeEditorFunctionHeaderStyle: ViewStyle[];

    readonly tableViewStyle: ViewStyle[];
    readonly treeViewStyle: ViewStyle[];

    topBarColor: string;
    topBarLabelColor: string;

    sideBarColor: string;


    panelBackgroundColor: string;

    layersListRowBackgroundColor: string;
    layersListRowLayerTextColor: string;

    tableViewHeaderBackgroundColor: string;
    tableViewHeaderLabelColor: string;

}

