import {LocalizedString} from "mentatjs";


export type ShortcutGroupDEPREC = "Create" | "Layer Selection" | "Edit Selection" | "Colors" | "Typeface" | "Preview";


export interface IShortcutDEPREC {
    group: ShortcutGroupDEPREC;
    id: string;
    title: LocalizedString;
    shortcut: string[];
}


