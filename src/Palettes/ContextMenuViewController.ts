import {
    DataSource,
    fillParentBounds,
    ListViewDelegate, Label,
    ListView,
    Popover,
    View,
    ViewController, Bounds, isDefined, NUConvertToPixel
} from "mentatjs";
import {ContextMenuDataItem} from "../Types/ContextMenuDataItem";
import {generateKeyboardShortcutIcon} from "../Shortcuts/generateKeyboardShortcutIcon";
import {Session} from "../Session/Session";


export class ContextMenuViewController extends ViewController implements ListViewDelegate{

    popoverRef: Popover;

    dataSource: ContextMenuDataItem[] = [];

    currentDS: ContextMenuDataItem[] = [];
    selectedSubMenuId: string = "";

    listView: ListView;

    viewForViewController(): View {
        let view = new View();
        view.boundsForView = function(parentBounds: Bounds): Bounds {
            return fillParentBounds(parentBounds);
        };
        view.viewWasAttached = () => {
            let listView = new ListView();
            listView.boundsForView = function (parentBounds) {
                return new Bounds(5,10, NUConvertToPixel(parentBounds.width).amount - 10, NUConvertToPixel(parentBounds.height).amount - 10);
            }
            listView.initView("listView");
            view.attach(listView);
            this.listView = listView;
        }
        return view;
    }

    viewWasPresented() {
        this.listView.delegate = this;

        this.listView.dataSource = new DataSource();
        this.listView.dataSource.initWithData({rows: this.dataSource});
        this.listView.reloadData();
    }

    listViewRowMargin(listView: ListView, section_index: number, item_index: number): number {
        return 10;
    }

    listViewSizeForItemIndex(listView: ListView, section_index: number, item_index: number): number[] {
        let item: ContextMenuDataItem = listView.listViewObjectForItemIndex(listView, section_index, item_index);
        if (item.isSeparator === true) {
            return [NUConvertToPixel(listView.getBounds("").width).amount, 10];
        }
        return [NUConvertToPixel(listView.getBounds("").width).amount, 24];
    }

    listViewCellWasAttached(listView: ListView, cell: View, section_index: number, item_index: number) {
        let item: ContextMenuDataItem = listView.listViewObjectForItemIndex(listView, section_index, item_index);

        if (item.isSeparator === true) {
            let hr = document.createElement("hr");
            cell.getDiv().appendChild(hr);
        } else {
            if (item.showChecked === true) {

                let checked = new Label();
                checked.styles = Session.instance.theme.labelStyleItem;
                checked.getDefaultStyle().bounds = new Bounds(0, 0, 20, 24);
                checked.fontFamily = "FontAwesome5ProSolid";
                checked.fillLineHeight = true;
                checked.textAlignment = "center";
                checked.text = (item.isChecked === true) ? "&#xf00c;" : "";
                checked.initView("checked");
                cell.attach(checked);

            }

            let title = new Label();
            title.styles = Session.instance.theme.labelStyleItem;
            title.getDefaultStyle().bounds = new Bounds(20, 0, 160, 24);
            title.fillLineHeight = true;
            title.text = isDefined(item.title) ? item.title : "";
            title.initView("title");
            cell.attach(title);

            if (isDefined(item.subMenu) && item.subMenu.length > 0) {

                let subMenu = new Label();
                subMenu.styles = Session.instance.theme.labelStyleItem;
                subMenu.getDefaultStyle().bounds = new Bounds(180, 0, 20, 24);
                subMenu.fontFamily = "FontAwesome5ProSolid";
                subMenu.fillLineHeight = true;
                subMenu.textAlignment = "center";
                subMenu.text = "&#xf105;"
                subMenu.initView("subMenu");
                cell.attach(subMenu);

            }

            if (isDefined(item.shortcut) && item.shortcut.length > 0) {

                let keys: string[] = [];
                for (let i = 0; i < item.shortcut.length; i += 1) {
                    let key = item.shortcut[i];

                    if (key.toUpperCase() === "DEL") {
                        if (Session.instance.environment.isMacOSX === true) {
                            key = "\u2326";
                        }
                    }

                    keys.push(key);

                }
                let shortcutView = generateKeyboardShortcutIcon(keys, true);
                shortcutView.keyValues["x"] = NUConvertToPixel(cell.getBounds().width).amount - 8 - shortcutView.keyValues["width"];
                shortcutView.keyValues["y"] = 0;
                cell.attach(shortcutView);

            }




        }

    }


    listViewSelectionHasChanged(listView: ListView) {
        let item: ContextMenuDataItem[] = listView.getSelectedObjects();
        if (item.length > 0) {
            if (isDefined(item[0].subMenu) && item[0].subMenu.length > 0) {
                this.selectedSubMenuId = item[0].id;
                listView.dataSource.initWithData({rows: item[0].subMenu});
                listView.reloadData();
            } else {
                if (item[0].showChecked === true) {
                    item[0].isChecked != item[0].isChecked;
                    listView.reloadData();
                } else {
                    this.popoverRef.sendStatus(this, {
                        valid: true,
                        selectedId: item[0].id
                    });

                }
            }
        }
    }


}

