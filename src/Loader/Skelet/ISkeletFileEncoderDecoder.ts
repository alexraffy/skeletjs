import {SkeletDocument} from "../../Document/SkeletDocument";
import {ISkeletDocument} from "../../Document/ISkeletDocument";


export interface ISkeletFileEncoderDecoder {
    version: string;
    encoder: (sfr: SkeletDocument) => Promise<Uint8Array>;
    decoder: (fileData: Uint8Array) => Promise<ISkeletDocument>;
}