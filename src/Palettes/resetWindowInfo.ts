import {IWindowInfo} from "./IWindowInfo";
import {generateV4UUID} from "mentatjs";
import {kDockGroup} from "./kDockGroup";


export function resetWindowsInfo(): IWindowInfo[] {
    return [
        {
            kind: "IWindowInfo",
            id: generateV4UUID(),
            origin: { x: {amount: 0, unit: "px"}, y: {amount: 0, unit: "px"}},
            size: {width: {amount: 280, unit: "px"}, height: {amount: 210, unit: "px"}},
            dockGroup: kDockGroup.properties,
            dockId: "left",
            dockOrder: 0,
            isDocked: true,
            minimized: false,
            panels: ["workspaces", "history"],
            selectedPanel: "workspaces"
        },
        {
            kind: "IWindowInfo",
            id: generateV4UUID(),
            origin: { x: {amount: 0, unit: "px"}, y: {amount: 210, unit: "px"}},
            size: {width: {amount: 280, unit: "px"}, height: {amount: 200, unit: "px"}},
            dockGroup: kDockGroup.properties,
            dockId: "left",
            dockOrder: 0,
            isDocked: true,
            minimized: false,
            panels: ["layers", "components"],
            selectedPanel: "layers"
        },
        {
            kind: "IWindowInfo",
            id: generateV4UUID(),
            origin: { x: {amount: 0, unit: "px"}, y: {amount: 0, unit: "px"}},
            size: {width: {amount: 280, unit: "px"}, height: {amount: 210, unit: "px"}},
            dockGroup: kDockGroup.properties,
            dockId: "right",
            dockOrder: 0,
            isDocked: true,
            minimized: false,
            panels: ["swatches", "states"],
            selectedPanel: "swatches"
        },
        {
            kind: "IWindowInfo",
            id: generateV4UUID(),
            origin: { x: {amount: 0, unit: "px"}, y: {amount: 210, unit: "px"}},
            size: {width: {amount: 280, unit: "px"}, height: {amount: 210, unit: "px"}},
            dockGroup: kDockGroup.properties,
            dockId: "right",
            dockOrder: 1,
            isDocked: true,
            minimized: false,
            panels: ["appearance", "typeface"],
            selectedPanel: "appearance"
        },
        {
            kind: "IWindowInfo",
            id: generateV4UUID(),
            origin: { x: {amount: 0, unit: "px"}, y: {amount: 420, unit: "px"}},
            size: {width: {amount: 280, unit: "px"}, height: {amount: 210, unit: "px"}},
            dockGroup: kDockGroup.properties,
            dockId: "right",
            dockOrder: 2,
            isDocked: true,
            minimized: false,
            panels: ["properties", "accessibility"],
            selectedPanel: "properties"
        },
        {
            kind: "IWindowInfo",
            id: generateV4UUID(),
            origin: { x: {amount: 0, unit: "px"}, y: {amount: 630, unit: "px"}},
            size: {width: {amount: 280, unit: "px"}, height: {amount: 180, unit: "px"}},
            dockGroup: kDockGroup.properties,
            dockId: "right",
            dockOrder: 0,
            isDocked: true,
            minimized: false,
            panels: ["position", "transforms", "constraints"],
            selectedPanel: "position"
        }

    ]
}

