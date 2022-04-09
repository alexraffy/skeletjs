import {ISkeletDocument} from "../../Document/ISkeletDocument";


export interface ISkeletFileLoader {
    load: (blob: Uint8Array) => Promise<ISkeletDocument>;
}




