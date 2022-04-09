import {kDockGroup} from "./kDockGroup";
import {LocalizedString, ViewController} from "mentatjs";
import {PanelContextMenuDataSourceFunc, PanelContextMenuSelectionHandlerFunc} from "./declarePanel";
import {kDockSide} from "./kDockSide";


export interface PanelFullInfo {
    panel_id: string;
    group: kDockGroup;
    min_height: number;
    max_height: number;
    min_width: number;
    max_width: number;
    value_width: number;
    value_height: number;
    localizedTitle: LocalizedString;
    declViewController: typeof ViewController;
    menuDataSourceFunc: PanelContextMenuDataSourceFunc;
    menuSelectionHandleFunc: PanelContextMenuSelectionHandlerFunc;
    shortcut: string[];
    preferredDockSide: kDockSide;
    preferredDockBlockOrder: number;
    visibleUnderWindowMenu: boolean;
    windowMenuPath: string;
    viewControllerInit?: (vc:ViewController, params: {[key:string]:any}) => void;
    params?:{[key:string]:any};
}
