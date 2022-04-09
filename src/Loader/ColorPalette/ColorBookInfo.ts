import {AdobeSwatchExchange} from "./AdobeSwatchExchange";
import {AdobeColorBookInfo} from "./AdobeColorBookInfo";
import {ASE_RGB} from "./ASE_RGB";
import {ASE_HSL} from "./ASE_HSL";
import {ASE_CMYK} from "./ASE_CMYK";
import {ASE_LAB} from "./ASE_LAB";
import {ASE_GRAY} from "./ASE_GRAY";
import {ASE_DUMMY} from "./ASE_DUMMY";
import {ASE_GROUP} from "./ASE_GROUP";
import {ASE_GRADIENT} from "./ASE_GRADIENT";


export interface ColorBookInfo {
    id: string;
    title: string;
    filename: string;
    type: 'ASE' | 'ACB';
    pageSize: number;
    aseInfo: AdobeSwatchExchange;
    acbInfo: AdobeColorBookInfo;
    records: (ASE_RGB | ASE_HSL | ASE_CMYK | ASE_LAB | ASE_GRAY | ASE_DUMMY | ASE_GROUP | ASE_GRADIENT)[];
}