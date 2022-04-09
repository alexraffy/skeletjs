import {isDefined} from "mentatjs";


export class KeyboardShortcutManager {
    private static _instance: KeyboardShortcutManager;
    static get instance(): KeyboardShortcutManager {
        if (!isDefined(KeyboardShortcutManager._instance)) {
            return new KeyboardShortcutManager();
        }
        return KeyboardShortcutManager._instance;
    }

    constructor() {
        if (!isDefined(KeyboardShortcutManager._instance)) {
            KeyboardShortcutManager._instance = this;
        }
    }

    private handlers: {release: boolean, keys: string[], callback: (event: KeyboardEvent)=>void}[] = [];

    keyDown(event: KeyboardEvent) {
        // @ts-ignore
        if (event.srcElement.nodeName === "INPUT" || e.srcElement.nodeName === "TEXTAREA" || e.srcElement.nodeName === "SELECT") {
            //SkLogger.write("input keydown");
            return;
        }
        let keys = [];
        if (event.altKey) {
            keys.push('alt');
        }
        if ((event.ctrlKey === true) || (event.metaKey === true)) {
            keys.push('ctrl');
        }
        if (event.shiftKey) {
            keys.push('shift');
        }
        switch (event.keyCode) {
            case 13:
                keys.push('enter');
                break;
            case 27:
                keys.push('esc');
                break;
        }
    }

    addHandler(release: boolean, keys: string[], callback: (event: KeyboardEvent)=>void) {
        this.handlers.push({
            release: release,
            keys: keys,
            callback: callback
        });
    }


}



//
// function shortcut_keyDown(event: KeyboardEvent) {
//
//
//
//     // INSERT
//     if (Session.instance.isEditingText !== true) {
//         if (event.key === 'n' && event.shiftKey === true) {
//             commitWorkspace();
//             newWorkspace('New Workspace');
//             Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
//             Application.instance.notifyAll(this, "noticeNodeSelected", null);
//             // dismiss popovers
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//         }
//
//         if (event.key === 'a') {
//             // dismiss popovers
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//             insertNewArtboard();
//
//         }
//
//         if (event.key === 't') {
//             // dismiss popovers
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//             Application.instance.notifyAll(this, 'noticeSelectedToolRefresh', 'label');
//             setTool('label');
//         }
//
//         if (event.key === 'r') {
//             // dismiss popovers
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//             Application.instance.notifyAll(this, 'noticeSelectedToolRefresh', 'frame');
//             setTool('frame');
//         }
//
//         if (event.key === 'i') {
//             // dismiss popovers
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//             Application.instance.notifyAll(this, 'noticeSelectedToolRefresh', 'image');
//             setTool('image');
//         }
//     }
//
//
//     // EDIT
//     if (Session.instance.isEditingText === true) {
//
//         // Escape when editing text toggles back to layer selection mode
//         if (event.keyCode === 27) {
//             Application.instance.notifyAll(this, "noticeExitTextEditMode");
//
//         }
//
//     } else {
//         // ESC
//         if (event.keyCode === 27) {
//             // dismiss popovers
//             Application.instance.notifyAll(this, 'noticeBodyClicked');
//             Application.instance.notifyAll(this, 'noticeSelectedToolRefresh', 'selector');
//             setTool('selector');
//         }
//
//
//         // COPY
//         if ((event.keyCode === 67) && ((event.ctrlKey === true) || (event.metaKey === true))) {
//             Session.instance.getCurrentCanvas().copyToClipBoard();
//         }
//
//         // PASTE
//         if ((event.keyCode === 86) && ((event.ctrlKey === true) || (event.metaKey === true))) {
//             Session.instance.getCurrentCanvas().pasteClipBoard(event);
//         }
//     }

//MentatJS.LayoutEditor.Code.Keyboard.insert(e);
//MentatJS.LayoutEditor.Code.Keyboard.view(e);

//
// if (Session.instance.isEditingText !== true) {
//
//     // pressing shift while dragging allow going outside of bounds
//     if ((e.shiftKey === true) && (e.metaKey === false)){
//         if (isDefined(Application.instance.keyValues["currentViewMoving"])) {
//             if (Application.instance.keyValues["currentViewMoving"].isDragging === true) {
//                 Application.instance.shiftKeyPressed = true;
//             }
//         }
//     }
//
//
//     // pressing alt while dragging creates a copy of the nodes
//     if (e.altKey === true) {
//         if (e.ctrlKey === true && e.key === "s") {
//             openProjectSettings();
//         }
//         if (e.metaKey === false) {
//             if (isDefined(Application.instance.keyValues["currentViewMoving"])) {
//                 if (Application.instance.keyValues["currentViewMoving"].isDragging === true) {
//                     // get the node
//                     if (Application.instance.keyValues["currentViewMoving"].nodeId) {
//                         let node = Session.instance.currentDocument.currentWorkspace.layersTree.find(Application.instance.keyValues["currentViewMoving"].nodeId);
//                         if (node) {
//                             let parentNode = node.parentLayer;
//                             if (parentNode) {
//                                 let node_copy = parentNode.duplicateChild(node);
//                                 let node_copy_bounds = node_copy.bounds();
//                                 node_copy_bounds.x = Application.instance.keyValues["currentViewMoving"].preDragBounds.x;
//                                 node_copy_bounds.y = Application.instance.keyValues["currentViewMoving"].preDragBounds.y;
//                                 parentNode.adopt(node_copy);
//                                 node_copy.setPropertyValue("view.bounds", node_copy_bounds);
//
//                                 let nodeToDrawOn = parentNode;
//
//                                 Application.instance.keyValues["currentViewMoving"].old_node_id = node_copy.id;
//                                 // draw the new node at the old position
//
//                                 Application.instance.rootView.getDiv().style.cursor = 'copy';
//
//                                 if (node_copy.isPage === false) {
//                                     Application.instance.notifyAll(nodeToDrawOn, "kRedrawSubView", node_copy);
//                                 } else {
//                                     Application.instance.notifyAll({}, "kRedrawSubView", node_copy);
//                                 }
//
//                                 // dismiss popovers
//                                 Application.instance.notifyAll(this, 'noticeBodyClicked');
//
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//
//         if (e.keyCode === 13) {
//             if (this.viewCanvasDelegate.selectedLayersInfo.length > 0) {
//                 openCodeEditor(this.viewCanvasDelegate.selectedLayersInfo[0].layer);
//             }
//         }
//     }
// }
//
// if (e.keyCode === 73) {
//     // i for info
//     //if (LE.Session.showingCoordinates === false) {
//     //    LE.Code.showAllCoordinates(true);
//     //    LE.Session.showingCoordinates = true;
//     //}
// }
//
//
// // delete selected layers
// if (Session.instance.isEditingText !== true) {
//     if (e.keyCode === 46) {
//         let history_title = '';
//         for (let selection = 0; selection < this.viewCanvasDelegate.selectedLayersInfo.length; selection++) {
//             let idx = -1;
//             console.warn("selection " + this.viewCanvasDelegate.selectedLayersInfo[selection].layer.title );
//
//             let node = this.viewCanvasDelegate.selectedLayersInfo[selection].layer;
//             // find view
//             this.viewCanvasDelegate.deleteViewRef(node.id);
//             // delete from treeView
//             this.viewCanvasDelegate.selectedLayersInfo[selection].view = undefined;
//
//             function deleteNodeInTreeRecur(node) {
//                 if (isDefined(node.subViews)) {
//                     for (let i = 0; i < node.subViews.length; i += 1) {
//                         deleteNodeInTreeRecur(node.subViews[i]);
//                     }
//                 }
//
//                 Application.instance.notifyAll(this, "noticeNodeDeletedFromCanvas", node.id);
//             }
//             deleteNodeInTreeRecur(node);
//
//
//             if (node.isPage === true) {
//
//                 // delete the title view
//                 this.viewCanvasDelegate.deleteTitleRef(node.id);
//
//                 this.viewCanvasDelegate.workspaceRef.layersTree.removeChild(node);
//
//                 history_title = node.title + " deleted";
//
//             } else {
//                 history_title = node.title + " deleted";
//                 let parentNode = node.parentLayer;
//                 parentNode.removeChild(node);
//
//             }
//             this.viewCanvasDelegate.pushHistory(history_title);
//         }
//         this.viewCanvasDelegate.clearAllSelection();
//         // MentatJS.Application.instance.notifyAll(this, "noticeWorkspaceLoaded");
//         Application.instance.notifyAll({}, "noticeNodeSelected", null);
//         // dismiss popovers
//         Application.instance.notifyAll(this, 'noticeBodyClicked');
//     }
// }




// }