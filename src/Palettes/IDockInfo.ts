import {kDockGroup} from "./kDockGroup";
import {kDockSide} from "./kDockSide";


export interface IDockInfo {
    kind: "IDockInfo";
    id: string;
    group: kDockGroup;
    side: kDockSide;
    width: number;
    height: number;
    floating?: {
        x: number;
        y: number;
    }
}
