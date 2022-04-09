import {IPoint, ISize} from "mentatjs";
import {panel_id} from "./panel_id";
import {kDockGroup} from "./kDockGroup";


export interface IWindowInfo {
    kind: "IWindowInfo";
    id: string;
    origin: IPoint;
    size: ISize;
    dockGroup: kDockGroup;
    panels: panel_id[];
    selectedPanel: panel_id;
    minimized: boolean;
    isDocked: boolean;
    dockId: string;
    dockOrder: number;
}
