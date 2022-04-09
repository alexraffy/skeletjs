import {PanelFullInfo} from "./PanelFullInfo";
import {getEnvironment} from "../Environment/getEnvironment";


export function findPanelInfo(panel_id: string): PanelFullInfo {
    return getEnvironment().PanelsFullInfo.find((elem: PanelFullInfo) => { return elem.panel_id === panel_id;});
}
