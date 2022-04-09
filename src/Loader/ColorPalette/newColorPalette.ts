import {ColorBookInfo} from "./ColorBookInfo";
import {generateV4UUID} from "mentatjs";


export function newColorPalette(text: string, filename?: string): ColorBookInfo {
    let p: ColorBookInfo = {
        id: generateV4UUID(),
        filename: "",
        pageSize: 7,
        type: "ASE",
        title: text,
        records: [
            {
                type: "group",
                name: "Document",
                entries: [
                    {
                        type: "color",
                        name: "White",
                        color:{
                            model: "RGB",
                            r: 1.0,
                            g: 1.0,
                            b: 1.0,
                            alpha: 1.0,
                            hex: "#ffffff",
                            type: "normal"
                        }
                    },
                    {
                        type: "color",
                        name: "Black",
                        color:{
                            model: "RGB",
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            alpha: 1.0,
                            hex: "#000000",
                            type: "normal"
                        }
                    }
                ]
            }
        ],
        acbInfo: undefined,
        aseInfo: undefined
    };


    return p;
}
