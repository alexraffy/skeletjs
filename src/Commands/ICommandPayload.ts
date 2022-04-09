import {generateV4UUID} from "mentatjs";
import {Session} from "../Session/Session";




export class ICommandPayload {
    id: string;
    command: number;
    owner: string;
    timestamp: string;
    title: string;
    save: boolean;
    publish: boolean;
    constructor() {
        this.id = generateV4UUID();
        this.timestamp = new Date().toISOString();
        this.owner = Session.instance.sessionInfo.user_guid;
        this.save = true;
        this.publish = true;
    }


}