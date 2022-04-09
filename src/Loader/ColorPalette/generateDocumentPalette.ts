import {ColorBookInfo} from "./ColorBookInfo";
import {generateV4UUID} from "mentatjs";
import {ASE_RGB} from "./ASE_RGB";


export function generateDocumentPalette(title: string): ColorBookInfo {
    let ret: ColorBookInfo = {
        id: generateV4UUID(),
        filename: "",
        pageSize: 7,
        title: title,
        aseInfo: undefined,
        acbInfo: undefined,
        type: 'ACB',
        records: [
            {
                color: {r: 1.0, g: 1.0, b: 1.0, alpha: 1.0, type: "RGB", model: "RGB"},
                name: "White",
                type: "RGB"
            } as ASE_RGB,
            {
                color: {r: 0.0, g: 0.0, b: 0.0, alpha: 1.0, type: "RGB", model: "RGB"},
                name: "Black",
                type: "RGB"
            } as ASE_RGB,
        ]
    };
    return ret;
}

