import {ColorBookInfo} from "./ColorBookInfo";


export function deserializeColorBookInfo(c: string): ColorBookInfo {
    try {
        let ret = Object.assign({
            id: "",
            title: "",
            filename: "",
            type: "ASE",
            pageSize: 7,
            aseInfo: undefined,
            acbInfo: undefined,
            records: []
        }, JSON.parse(c));
    } catch (e) {
        return undefined;
    }
}

