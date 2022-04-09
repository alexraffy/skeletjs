
import {Application} from "mentatjs";
import {Session} from "../Session/Session";

export function setTool(toolSelected: 'selector' | 'frame' | 'label' | 'image') {
    Session.instance.selectedTool = toolSelected;
    if (toolSelected === 'selector') {
        Application.instance.rootView.getDiv().style.cursor = 'default';
    } else {
        Application.instance.rootView.getDiv().style.cursor = 'crosshair';
    }

}
