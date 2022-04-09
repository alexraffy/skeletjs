export interface FontInfo {

    id: string,
    text: string,
    postscriptName: string,
    style: string,
    weight: number,
    width: number,
    path: string;
    urlPath: string;

    fontFamilyID: string,
    fontFamilyText: string,

    fullNameText: string,

    usWeightClass: number,
    sFamilyClass: number,
    vendorID: string,
    xHeight: number,
    capHeight: number,
    tags: string[],
    scripts: string[],
    strings: {},
    styles: { bold: boolean, italique: boolean, underline: boolean, outline: boolean, shadow: boolean, condensed: boolean, extended: boolean }
    sampleString: string,

    isCollection: boolean;
    collectionIndex: number;
}


