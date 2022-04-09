import {ContextMenuDataItem} from "../Types/ContextMenuDataItem";
import {assert, isDefined, LocalizedString, safeCopy, ViewController} from "mentatjs";
import {getEnvironment} from "../Environment/getEnvironment";
import {kDockSide} from "./kDockSide";
import {kDockGroup} from "./kDockGroup";


export type PanelContextMenuDataSourceFunc = (panel_id: string) => ContextMenuDataItem[];
export type PanelContextMenuSelectionHandlerFunc = (panel_id: string, dataSource: ContextMenuDataItem[], selectedId: string) => boolean;


export function declarePanel(panel_id: string,
                             size: {width: {min: number; max: number}, height: {min: number; max: number}},
                             localizedTitle: LocalizedString,
                             declViewController: typeof ViewController,
                             menuDataSourceFunc: PanelContextMenuDataSourceFunc,
                             menuSelectionHandleFunc: PanelContextMenuSelectionHandlerFunc,
                             shortcut: string[],
                             preferredDockSide: kDockSide,
                             preferredDockBlockOrder: number,
                             visibleUnderWindowMenu: boolean,
                             windowMenuPath: string, group: kDockGroup) {
    assert(
        isDefined(panel_id) && isDefined(size) &&
        isDefined(localizedTitle) && isDefined(declViewController) &&
        isDefined(menuDataSourceFunc) && isDefined(shortcut) &&
        isDefined(preferredDockSide) && isDefined(preferredDockBlockOrder) &&
        isDefined(visibleUnderWindowMenu) && isDefined(windowMenuPath) && isDefined(group)
        ,"declarePanel called with wrong parameters.");

    const env = getEnvironment();
    assert(isDefined(env), "declarePanel called before initializing a skelet environment.");

    getEnvironment().PanelsFullInfo.push(
        {
            panel_id: panel_id,
            group: group,
            min_height: size.height.min,
            max_height: size.height.max,
            min_width: size.width.min,
            max_width: size.width.max,
            value_width: size.width.min,
            value_height: size.height.min,
            localizedTitle: LocalizedString.fromStruct(localizedTitle.toJSON()),
            declViewController: declViewController,
            menuDataSourceFunc: menuDataSourceFunc,
            menuSelectionHandleFunc: menuSelectionHandleFunc,
            shortcut: safeCopy(shortcut),
            preferredDockSide: preferredDockSide,
            preferredDockBlockOrder: preferredDockBlockOrder,
            visibleUnderWindowMenu: visibleUnderWindowMenu,
            windowMenuPath: windowMenuPath
        }
    );
}
