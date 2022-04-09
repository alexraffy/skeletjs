import {PaletteWindow} from "./PaletteWindow";
import {panel_id} from "./panel_id";
import {Session} from "../Session/Session";


export function getPaletteForPanel(id: panel_id): PaletteWindow {
    return Session.instance.FloatingWindows.find((fw) => { return (fw as PaletteWindow).panelIds.includes(id);}) as PaletteWindow;
}