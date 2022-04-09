import {Workspace} from "../Document/Workspace";
import {generateV4UUID, px} from "mentatjs";


export function newWorkspace(title: string) {
    let w = new Workspace({ kind: "WorkspaceData", workspace_guid: generateV4UUID(), layers: [], title: title, viewport_origin: { x: px(0), y: px(0)}});
    /*
    let views = new Layer('Views', 'group', null);
    views.special_id = "workspace.views";
    let viewControllers = new Layer("ViewControllers", "group", null);
    viewControllers.special_id = "workspace.viewControllers";
    w.data.rows.push(views);
    w.data.rows.push(viewControllers);
     */
    return w;
}
