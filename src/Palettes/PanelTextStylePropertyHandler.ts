import {FontInfo} from "../Loader/Font/FontInfo";
import {LocalizedString, PropertyTextStyle} from "mentatjs";

export interface IPropertyPanelTextStyleHandler {

    getFont(): FontInfo;
    getRepresentativeTextStyle(): PropertyTextStyle;
    setValue(callback: (ts: PropertyTextStyle) => void);

    getListOfProperties(): {property_id: string, title: LocalizedString}[];

}

