import {Session} from "../Session/Session";
import {resetDocks} from "./resetDocks";
import {isDefined, NavigationController, NavigationControllerDelegate, Tabs, View} from "mentatjs";
import {IDockInfo} from "./IDockInfo";
import {resetWindowsInfo} from "./resetWindowInfo";
import {PanelFullInfo} from "./PanelFullInfo";
import {IWindowInfo} from "./IWindowInfo";


export function resetPanels() {
    Session.instance.DocksInfo = [];

    let docksInfoConfig = Session.instance.environment.SystemSettings.system.find((setting) => setting.id === "app.skelet.docksInfo");
    let docksInfo: IDockInfo[] = (isDefined(docksInfoConfig) && isDefined(docksInfoConfig.value)) ? docksInfoConfig.value : resetDocks();

    let palettesInfoConfig = Session.instance.environment.SystemSettings.system.find((setting) => setting.id === "app.skelet.palettesInfo");
    let palettesInfo: IWindowInfo[] = (isDefined(palettesInfoConfig) && isDefined(palettesInfoConfig.value)) ? palettesInfoConfig.value : resetWindowsInfo();
    Session.instance.DocksInfo = docksInfo;
    Session.instance.PalettesInfo = palettesInfo;
}

type IPanelBlock = {
    id: string;
    order: number;
    panels: PanelFullInfo[];
    active_panel: string;
    height: number;
    minimized: boolean;
    weight: number;
    stretchable: boolean;
    views?: {
        topBar: View;
        tabs: Tabs;
        container: View;
        sep: View;
        panelsViews: {
            id: string;
            view: View;
            nav: NavigationController;
        }[];
    },
} & NavigationControllerDelegate;
