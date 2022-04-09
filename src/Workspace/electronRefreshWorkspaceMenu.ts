import {Session} from "../Session/Session";
import {Application, isDefined} from "mentatjs";
import {IWSRMenuRefresh, WSRMenuRefresh} from "../Environment/ServerCommands";
import {SkeletWebSocket} from "../Environment/SkeletWebSocket";


export function electronRefreshWorkspaceMenu() {



    let list = [];
    for (let i = 0; i < Session.instance.currentDocument.resources.length; i+= 1) {
        if (Session.instance.currentDocument.resources[i].mime !== "skelet/workspace") {
            continue;
        }
        list.push({
            workspace_guid: Session.instance.currentDocument.resources[i].id,
            title: isDefined(Session.instance.currentDocument.resources[i].title) ? Session.instance.currentDocument.resources[i].title : "Workspace " + i
        });
    }
    let selection = [];
    // for (let i = 0; i < Session.instance.selectedLayersInfo.length; i += 1) {
    //     let node = Session.instance.selectedLayersInfo[i].layer;
    //     if (node) {
    //         let textStyle = node.properties.find((elem) => { return elem.property_id === "label.textStyle";});
    //         selection.push({
    //             id: node.id,
    //             type: node.type,
    //             isSymbol: node.isSymbol,
    //             isSymbolInstance: node.isSymbolInstance,
    //             hasTextStyle: (textStyle !== null),
    //             textStyle: textStyle
    //         });
    //     }
    // }

    let status: IWSRMenuRefresh = {
        inLayoutEditor: true,
        modified: true, // Session.instance.modified,
        current_workspace: Session.instance.currentDocument.currentOpenedFileID,
        workspaces: list,
        selectedItems: selection,
        id: Session.instance.sessionInfo.id,
        current_document: Session.instance.currentDocument.projectSettings.project_guid,
        documents: [
            {
                document_guid: Session.instance.currentDocument.projectSettings.project_guid,
                title: Session.instance.currentDocument.projectSettings.title
            }
        ]
    };
    SkeletWebSocket.instance.send(WSRMenuRefresh, status);



}