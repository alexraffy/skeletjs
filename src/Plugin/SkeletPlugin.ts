import {SkeletControl} from "./SkeletControl";
import {getEnvironment} from "../Environment/getEnvironment";
import {LocalizedString, View, ViewController} from "mentatjs";
import {SkeletExporter} from "./SkeletExporter";
import {
    declarePanel,
    PanelContextMenuDataSourceFunc,
    PanelContextMenuSelectionHandlerFunc
} from "../Palettes/declarePanel";
import {kDockSide} from "../Palettes/kDockSide";
import {kDockGroup} from "../Palettes/kDockGroup";


export class SkeletPlugin {
    id: string = "";
    name: string = "";
    description: string = "";
    author: string = "";
    link: string = "";
    version: string = "";
    enabled: boolean = true;


    constructor () {

    }


    addControlsGroup(groupName: string, controls: SkeletControl[]) {
        for (let i = 0; i < controls.length; i += 1) {
            controls[i].pluginGuid = this.id;
            controls[i].pluginName = this.name;
            controls[i].pluginGroup = groupName;
        }
        getEnvironment().Controls.push({
            group: groupName,
            controls: controls
        });
    }


    addCustomPropertyType(type: string, cellHeight: number, cell: typeof View, handlerFunction: any) {
        getEnvironment().CustomPropertiesType.push({
            type: type,
            height: cellHeight,
            propertyCell: cell,
            handlerFunction: handlerFunction
        });
    }

    addExporter(exporter: SkeletExporter) {
        getEnvironment().Exporters.push(exporter);
    }

    addCustomPanel(panel_id: string,
                   size: {width: {min: number; max: number}, height: {min: number; max: number}},
                   localizedTitle: LocalizedString,
                   declViewController: typeof ViewController,
                   menuDataSourceFunc: PanelContextMenuDataSourceFunc,
                   menuSelectionHandleFunc: PanelContextMenuSelectionHandlerFunc,
                   shortcut: string[],
                   preferredDockSide: kDockSide,
                   preferredDockBlockOrder: number,
                   visibleUnderWindowMenu: boolean,
                   windowMenuPath: string) {
        declarePanel(panel_id, size, localizedTitle,
            declViewController, menuDataSourceFunc, menuSelectionHandleFunc,shortcut,
            preferredDockSide, preferredDockBlockOrder, visibleUnderWindowMenu, windowMenuPath, kDockGroup.properties);

    }


}
