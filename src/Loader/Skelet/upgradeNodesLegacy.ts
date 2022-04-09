import {WorkspaceData} from "../../Document/WorkspaceData";
import {isDefined} from "mentatjs";
import {LayerData} from "../../Layer/LayerData";
import {upgradeNode} from "./upgradeNode";


export function upgradeNodesLegacy(workspace: any): WorkspaceData {
    let upgradedWorkspace = new WorkspaceData();
    upgradedWorkspace.workspace_guid = workspace.workspace_guid;
    upgradedWorkspace.title = workspace.title;

    if (isDefined(workspace.data) && isDefined(workspace.data.rows)) {
        for (let i = 0; i < workspace.data.rows.length; i += 1) {
            let r = workspace.data.rows[i];
            r.kind = "LayerData";
            if (!isDefined(r.special_id)) {
                if (r.title === "Views") {
                    r.special_id = "workspace.views";

                }
                if (r.title === "ViewControllers") {
                    r.special_id = "workspace.viewControllers";
                }
            }
            if (r.special_id === "workspace.views") {
                let viewGroup: LayerData = new LayerData("Views", "group", undefined); //Layer.create("Views", "group", undefined);
                viewGroup.special_id = "workspace.views";
                viewGroup.parent_id = "";
                viewGroup.isPage = false;
                upgradedWorkspace.layers.push(viewGroup);

                let recur = (base, parent: LayerData) => {
                    let layer = upgradeNode(base, parent);
                    if (isDefined(layer)) {
                        upgradedWorkspace.layers.push(layer);

                        if (isDefined(base.subViews)) {
                            for (let i = 0; i < base.subViews.length; i += 1) {
                                recur(base.subViews[i], layer);
                            }
                        }
                    }

                }
                for (let x = 0; x < r.subViews.length; x += 1) {
                    recur(r.subViews[x], undefined);
                    //upgradedWorkspace.viewContainer.adopt(_upgradeNode(r.subViews[x], undefined));

                }
            }
        }
    }
    return upgradedWorkspace;
}

