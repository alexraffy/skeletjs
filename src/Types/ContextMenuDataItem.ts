import {LocalizedString} from "mentatjs";


export interface ContextMenuDataItem {
    id: string;
    title?: LocalizedString;

    isDisabled?: boolean;
    isSeparator?: boolean;

    showChecked?: boolean;
    isChecked?: boolean;

    subMenu?: ContextMenuDataItem[];
    shortcut?: string[];

    stringParameter?: string;

    [key:string]: any;
}