import {ICommandPayload} from "./ICommandPayload";
import {isDefined, safeCopy} from "mentatjs";
import {SkLogger} from "../Logging/SkLogger";
import {ICOMgetFunctions} from "./ICOMgetFunctions";

export class CommandQueue {
    private lock: boolean = false;
    private queue: ICommandPayload[] = [];
    private history: ICommandPayload[] = [];

    static _instance: CommandQueue;

    constructor() {
        if (CommandQueue._instance === undefined) {
            CommandQueue._instance = this;
        }
        return this;
    }

    static get instance(): CommandQueue {
        if (CommandQueue._instance === undefined) {
            return new CommandQueue();
        }
        return CommandQueue._instance;
    }

    receivePayload(payload: ICommandPayload) {
        this.queue.push(safeCopy(payload));
        if (!this.lock) {
            this.dequeue();
        }
    }


    private dequeue() {
        this.lock = true;
        let payload = this.queue.shift();
        if (isDefined(payload)) {
            try {
                this.process(payload);
            } catch (e) {
                SkLogger.write(e.message, "\r\n", e.stack);
            }
        }
        this.lock = false;
        if (this.queue.length > 0) {
            this.dequeue();
        }
    }

    private process(payload: ICommandPayload) {
        let fn = ICOMgetFunctions(payload);
        if (isDefined(fn)) {
            let ret = fn.execute();
            if (payload.save) {
                this.history.push(payload);
            }
            if (ret.length > 0) {
                this.queue.unshift(...ret);
            }
        }

    }


    getUndoList(): {index: number, title: string}[] {
        return this.history.map((h, index) => { return { index: index, title: h.title};});
    }


    undo(index: number) {

    }


}