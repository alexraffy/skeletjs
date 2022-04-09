import {NumberWithUnit} from "mentatjs";


export interface LayoutGrid {
    type: 'LayoutGrid';
    rotateToRows: boolean;
    columns: {
        active: boolean;
        width: NumberWithUnit;
        offset: NumberWithUnit;
        isCentered: boolean;
        numberOfColumns: NumberWithUnit;
        startsWithGutter: boolean;
        gutterWidth: NumberWithUnit;
        ColumnWidth: NumberWithUnit;
    }
    colors: {
        light: string;
        dark: string;
    }
}