import {SkeletWebSocket} from "../Environment/SkeletWebSocket";
import {IWSRLoggerRequest, WSRLogger} from "../Environment/ServerCommands";
import {Logging} from "mentatjs";


export class SkLogger {
    static write(...theArgs) {
        let message = theArgs.reduce((previous, current) => {
            let a = "";
            let b = "";
            if (typeof(previous) === "string") {
                a = previous;
            } else {
                a = JSON.stringify(previous);
            }
            if (typeof(current) === "string") {
                b = current;
            } else {
                b = JSON.stringify(current);
            }
            return a + b;
        });
        SkeletWebSocket.instance.send(WSRLogger, { message: message} as IWSRLoggerRequest);
    }
}

Logging.log = function (...theArgs) {
    SkLogger.write(...theArgs);
}