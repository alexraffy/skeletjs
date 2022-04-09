
import * as JSZip from "jszip";
import {ISkeletFileLoader} from "./ISkeletFileLoader";
import {SkeletDocument} from "../../Document/SkeletDocument";
import {ISkeletDocument} from "../../Document/ISkeletDocument";
import {assert} from "mentatjs";
import {instanceOfSkeletDocument} from "../../Guards/instanceOfSkeletDocument";
import {SkeletFileEncoderDecoderVersion10} from "./SkeletFileEncoderDecoderVersion10";
import {SkeletFileEncoderDecoderVersionOLD} from "./SkeletFileEncoderDecoderVersionOLD";



export class SkeletFileLoader implements ISkeletFileLoader {

    private m_updateFunc: (value: number)=>void;

    constructor(updateFunction:(value: number)=>void) {
        this.m_updateFunc = updateFunction;
    }

    write(doc: SkeletDocument): Promise<Uint8Array> {
        assert(instanceOfSkeletDocument(doc), "SkeletFileLoader.write expects a SkeletDocument as parameter.");
        return new Promise<Uint8Array>( (resolve, reject) => {
            let enc = new SkeletFileEncoderDecoderVersion10(this.m_updateFunc);
            return enc.encoder(doc).then((value:Uint8Array) => { resolve(value);}).catch((reason) => { reject(reason);});
        });
    }


    load(blob: Uint8Array): Promise<ISkeletDocument> {

        return new Promise( (resolve, reject) => {
            // check that file is ZIP
            let zip = new JSZip();
            zip.loadAsync(blob).then((z) => {
                if (z.file("VERSION") === null) {
                    // old version
                    let encDec = new SkeletFileEncoderDecoderVersionOLD(this.m_updateFunc);
                    encDec.decoder(blob).then( (doc: ISkeletDocument) => {
                            return resolve(doc);
                        }
                    ).catch((error) => {
                        return reject(error);
                    })
                    return;
                }
                z.file("VERSION").async("string").then((content) => {
                    let fileVersion = content;
                    if (fileVersion === "1.0") {
                        let encDec = new SkeletFileEncoderDecoderVersionOLD(this.m_updateFunc);
                        encDec.decoder(blob).then((doc: ISkeletDocument) => {
                            return resolve(doc);
                        }).catch((error) => {
                            return reject(error);
                        });
                        return;
                    } else {
                        if (fileVersion === "10") {
                            let encDec = new SkeletFileEncoderDecoderVersion10(this.m_updateFunc);
                            encDec.decoder(blob).then((doc: ISkeletDocument) => {
                                return resolve(doc);
                            }).catch((error) => {
                                return reject(error);
                            });
                            return;
                        } else {
                            return reject({message: "Unknown file version."});
                        }
                    }
                }).catch((error) => {
                    // old version
                    let encDec = new SkeletFileEncoderDecoderVersionOLD(this.m_updateFunc);
                    encDec.decoder(blob).then( (doc: ISkeletDocument) => {
                            return resolve(doc);
                        }
                    ).catch((error) => {
                        return reject(error);
                    })
                    return;
                });
            }).catch((error) => {
                return reject({message: "Wrong format.", fullError: error});
            });
        });
    }

}

