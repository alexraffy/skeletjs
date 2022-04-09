
export function loadWorkspace(workspace_guid: string) {

}



// export function loadWorkspace(workspace_guid: string) {
//     "use strict";
//     commitWorkspace();
//     // dismiss popovers
//     Application.instance.notifyAll(this, 'noticeBodyClicked');
//
//
//     for (let i = 0; i < Session.instance.currentDocument.resources.length; i += 1) {
//         if (Session.instance.currentDocument.resources[i].id === workspace_guid) {
//             canvasRemoveAllViews();
//
//
//             clearAllSelection();
//             Session.instance.selectedTool = 'selector';
//             Session.instance.currentDocument.selectCurrentWorkspace(Session.instance.currentDocument.resources[i].id);
//
//
//             // find all fonts
//
//
//
//             Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
//             Application.instance.notifyAll(this, "noticeNodeSelected", null);
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//             return;
//         }
//     }
// }


//
// export function nextWorkspace() {
//
//     commitWorkspace();
//     // dismiss popovers
//
//     let idx = -1;
//     Application.instance.notifyAll(this, 'noticeBodyClicked');
//     if (isDefined(Session.instance.currentDocument.currentOpenedFileID)) {
//         let current_workspace = Session.instance.currentDocument.currentOpenedFileID;
//
//         if (!isDefined(current_workspace)) {
//             idx = 0;
//         } else {
//             for (let i = 0; i < Session.instance.currentDocument.resources.length; i += 1) {
//                 if (Session.instance.currentDocument.resources[i].id === current_workspace) {
//                     if (i + 1 >= Session.instance.currentDocument.resources.length) {
//                         idx = 0;
//                     } else {
//                         idx = i + 1;
//                     }
//                 }
//             }
//         }
//         if (idx === -1) {
//             idx = 0;
//         }
//     } else {
//         idx = 0;
//         let w = Session.instance.currentDocument.addWorkspace(generateV4UUID(), "Untitled workspace");
//         Session.instance.currentDocument.selectCurrentWorkspace(w.workspace_guid);
//
//     }
//
//     canvasRemoveAllViews();
//
//     clearAllSelection();
//     Session.instance.selectedTool = 'selector';
//     Session.instance.viewRefs = [];
//     Session.instance.currentDocument.selectNextWorkspace();
//     /*
//     Session.instance.cur.title = Session.instance.Workspaces.workspaces[idx].title;
//     Session.instance.CurrentWorkspace.workspace_guid = Session.instance.Workspaces.workspaces[idx].workspace_guid;
//     Session.instance.CurrentWorkspace.viewContainer = generateLayerTree(Session.instance.Workspaces.workspaces[idx].viewContainer.flatten());
//
//     let hw = Session.instance.historyWorkspaces.find((elem) => { return elem.workspace_guid === Session.instance.CurrentWorkspace.workspace_guid;});
//     if (isDefined(hw)) {
//         Session.instance.history = safeCopy(hw.history);
//     } else {
//         Session.instance.history = [];
//     }
//     */
//
//     Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
//     Application.instance.notifyAll(this, "noticeNodeSelected", null);
//     Application.instance.notifyAll(this, 'noticeBodyClicked');
//
//
// }
//
// export function previousWorkspace() {
//     commitWorkspace();
//
//     // dismiss popovers
//     Application.instance.notifyAll(this, 'noticeBodyClicked');
//     /*
//     let idx = -1;
//     if (isDefined(Session.instance.CurrentWorkspace)) {
//         let current_workspace = Session.instance.CurrentWorkspace.workspace_guid;
//         if (!isDefined(current_workspace)) {
//             idx = 0;
//         } else {
//             for (let i = 0; i < Session.instance.Workspaces.workspaces.length; i += 1) {
//                 if (Session.instance.Workspaces.workspaces[i].workspace_guid === current_workspace) {
//                     if (i - 1 < 0) {
//                         idx = Session.instance.Workspaces.workspaces.length - 1;
//                     } else {
//                         idx = i - 1;
//                     }
//                 }
//             }
//         }
//         if (idx === -1) {
//             idx = 0;
//         }
//     } else {
//         idx = 0;
//         Session.instance.CurrentWorkspace = new Workspace();
//     }
//
//      */
//
//     canvasRemoveAllViews();
//
//     clearAllSelection();
//     Session.instance.selectedTool = 'selector';
//     Session.instance.viewRefs = [];
//     Session.instance.currentDocument.selectPreviousWorkspace();
//     /*
//     Session.instance.CurrentWorkspace.title = Session.instance.Workspaces.workspaces[idx].title;
//     Session.instance.CurrentWorkspace.workspace_guid = Session.instance.Workspaces.workspaces[idx].workspace_guid;
//     Session.instance.CurrentWorkspace.viewContainer = generateLayerTree(Session.instance.Workspaces.workspaces[idx].viewContainer.flatten());
//
//     let hw = Session.instance.historyWorkspaces.find((elem) => { return elem.workspace_guid === Session.instance.CurrentWorkspace.workspace_guid;});
//     if (isDefined(hw)) {
//         Session.instance.history = safeCopy(hw.history);
//     } else {
//         Session.instance.history = [];
//     }
//
//      */
//
//     Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
//     Application.instance.notifyAll(this, "noticeNodeSelected", null);
//     Application.instance.notifyAll(this, 'noticeBodyClicked');
// }
//
//
// export function deleteWorkspace(workspace_guid: string) {
//     let idx = -1;
//     let nextIdx = 0;
//     /*
//     for (let i = 0; i < Session.instance.Workspaces.workspaces.length; i += 1) {
//         if (Session.instance.Workspaces.workspaces[i].workspace_guid === workspace_guid) {
//             idx = i;
//             if (i + 1 >= Session.instance.Workspaces.workspaces.length) {
//                 nextIdx = 0;
//             } else {
//                 nextIdx = i;
//             }
//             break;
//         }
//     }
//     if (idx > -1) {
//         Session.instance.Workspaces.workspaces.splice(idx, 1);
//     }
//     if (Session.instance.Workspaces.workspaces.length === 0) {
//         let w = newWorkspace("Untitled workspace");
//         Session.instance.CurrentWorkspace = w;
//         commitWorkspace();
//         nextIdx = 0;
//     }
//
//      */
//     Session.instance.currentDocument.deleteCurrentWorkspace();
//
//     canvasRemoveAllViews();
//
//     clearAllSelection();
//     Session.instance.selectedTool = 'selector';
//     Session.instance.viewRefs = [];
//     /*
//     Session.instance.CurrentWorkspace.title = Session.instance.Workspaces.workspaces[nextIdx].title;
//     Session.instance.CurrentWorkspace.workspace_guid = Session.instance.Workspaces.workspaces[nextIdx].workspace_guid;
//     Session.instance.CurrentWorkspace.viewContainer = generateLayerTree(Session.instance.Workspaces.workspaces[nextIdx].viewContainer.flatten());
//
//     let hw = Session.instance.historyWorkspaces.find((elem) => { return elem.workspace_guid === Session.instance.CurrentWorkspace.workspace_guid;});
//     if (isDefined(hw)) {
//         Session.instance.history = safeCopy(hw.history);
//     } else {
//         Session.instance.history = [];
//     }
//     */
//     Session.instance.currentDocument.selectNextWorkspace();
//
//     Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
//     Application.instance.notifyAll(this, "noticeNodeSelected", null);
//     Application.instance.notifyAll(this, 'noticeBodyClicked');
//
//
// }