


export interface SkeletExportInfo {
    mime: string;
    title: string;
    filename: string;
    savedAs: 'file' | 'string' | 'uint8';
    dataFilename: string;
    stringData: string;
    uint8data: Uint8Array;
}
