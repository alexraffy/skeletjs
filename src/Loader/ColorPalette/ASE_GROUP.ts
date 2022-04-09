import {ASE_RGB} from "./ASE_RGB";
import {ASE_CMYK} from "./ASE_CMYK";
import {ASE_LAB} from "./ASE_LAB";
import {ASE_GRAY} from "./ASE_GRAY";


export interface ASE_GROUP {
    type: 'group',
    name: string;
    entries: (ASE_RGB | ASE_CMYK | ASE_LAB | ASE_GRAY | ASE_GROUP)[] // Array of Colors
}
