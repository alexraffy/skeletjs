import {ICommandPayload} from "./ICommandPayload";
import {CommandQueue} from "./CommandQueue";



export function queueCommand(payload: ICommandPayload) {
    CommandQueue.instance.receivePayload(payload);
}

