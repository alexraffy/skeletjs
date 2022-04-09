import {ColorBookInfo} from "./ColorBookInfo";
import {assert, isDefined} from "mentatjs";
import {ColorBookInfoSerialized} from "./ColorBookInfoSerialized";


export function serializeColorBookInfo(c: ColorBookInfo) {
    assert(isDefined(c), "serializeColorBookInfo expects a ColorBookInfo.");
    let r: ColorBookInfoSerialized = {
        id: c.id,
        title: c.title,
        records: c.records
    };
    return JSON.stringify(r);
}
