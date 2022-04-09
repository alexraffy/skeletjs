import {IDockInfo} from "./IDockInfo";
import {kDockGroup} from "./kDockGroup";


export function resetDocks(): IDockInfo[] {
    return [
        {
            kind: "IDockInfo",
            id: "left",
            group: kDockGroup.properties,
            side: "left",
            floating: {x: 0, y: 0},
            width: 280,
            height: -1
        },
        {
            kind: "IDockInfo",
            id: "right",
            group: kDockGroup.properties,
            side: "right",
            floating: {x: 0, y: 0},
            width: 280,
            height: -1
        }
    ];
}

