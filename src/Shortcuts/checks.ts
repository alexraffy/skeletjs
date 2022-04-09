import {isDefined} from "mentatjs";


export interface IShortcutsConfig_Group {
    id: string;
    trad: string;
}

export interface IShortcutsConfig_Shortcut {
    id: string;
    trad: string;
    group: string;
    defaultValue: string[]
}

export interface IShortcutsConfig {
    kind: "ShortcutsConfig",
    groups: IShortcutsConfig_Group[];
    shortcuts: IShortcutsConfig_Shortcut[]
}


export function instanceOfShortcutsConfig_Group(object: IShortcutsConfig_Group): object is IShortcutsConfig_Group {
    return (isDefined(object.id) && isDefined(object.trad));
}

export function instanceOfShortcutsConfig_Shortcut(object: IShortcutsConfig_Shortcut): object is IShortcutsConfig_Shortcut {
    return (
        isDefined(object.id) &&
            isDefined(object.trad) &&
            isDefined(object.group) &&
            isDefined(object.defaultValue)
    );
}


export function instanceOfShortcutsConfig(object: IShortcutsConfig): object is IShortcutsConfig {
    return isDefined(object) && object.kind === "ShortcutsConfig" &&
        isDefined(object.groups) && isDefined(object.shortcuts) &&
        Array.isArray(object.groups) && Array.isArray(object.shortcuts) &&
        object.groups.every((g) => { return instanceOfShortcutsConfig_Group(g);}) &&
        object.shortcuts.every((s) => { return instanceOfShortcutsConfig_Shortcut(s);});
}