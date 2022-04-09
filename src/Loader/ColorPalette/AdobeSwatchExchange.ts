import {ASE_RGB} from "./ASE_RGB";
import {ASE_CMYK} from "./ASE_CMYK";
import {ASE_GRAY} from "./ASE_GRAY";
import {ASE_LAB} from "./ASE_LAB";
import {ASE_GROUP} from "./ASE_GROUP";


export interface AdobeSwatchExchange {
    colorCount: number;
    pageSize: number;
    records: (ASE_RGB | ASE_CMYK | ASE_GRAY | ASE_LAB | ASE_GROUP)[]
}