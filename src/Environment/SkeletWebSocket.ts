import {ISkeletWebSocketDelegate} from "./ISkeletWebSocketDelegate";
import {SkeletWebSocketMessageHandlerInfo} from "./SkeletWebSocketMessageHandlerInfo";
import {isDefined} from "mentatjs";
import {getEnvironment} from "./getEnvironment";

import {ISkeletWebSocketResponse} from "./ISkeletWebSocketResponse";
import {ISkeletWebSocketRequest} from "./ISkeletWebSocketRequest";
import {IWSRAuthenticateResponse, WSRAuthenticate, WSRAuthenticatePlease} from "./ServerCommands";
import {serverRequest_Authenticate} from "./ServerRequests/auth";


const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';


export class SkeletWebSocket {

    private static _instance: SkeletWebSocket = null;

    private _supported: boolean;
    private _delegate: ISkeletWebSocketDelegate;
    private _connection: WebSocket | Object;

    private address: string;
    private handlers: SkeletWebSocketMessageHandlerInfo[] = [];

    private con_id: number = 0;
    private msg_count: number = 0;

    private outGoing: string[] = [];

    static get instance(): SkeletWebSocket {
        if (!isDefined(SkeletWebSocket._instance)) {
            return new SkeletWebSocket();
        }
        if (isDefined(global)) {
            return global["skeletWebSocket"];
        } else {
            return window["SkeletWebSocket"];
        }

    }

    get supported(): boolean {
        return this._supported;
    }

    get delegate(): ISkeletWebSocketDelegate {
        return this._delegate;
    }
    set delegate(value: ISkeletWebSocketDelegate) {
        this._delegate = value;
    }


    constructor() {
        SkeletWebSocket._instance = this;
        if (isBrowser) {
            // @ts-ignore
            window.WebSocket = window.WebSocket || window.MozWebSocket;
            this._supported = true;
        } else {
            this._supported = false;
        }
        if (isDefined(global)) {
            global["skeletWebSocket"] = this;
        } else {
            window["SkeletWebSocket"] = this;
        }
    }

    send(message: string, param: any) {
        let env = getEnvironment();
        if (isBrowser) {
            let payload: ISkeletWebSocketRequest = {
                id: this.con_id,
                msg_id: ++this.msg_count,
                message: message,
                param: param
            };
            if (!isDefined(this._connection)) {
                this.outGoing.push(JSON.stringify(payload));
            } else {
                this.sendOutgoing();
                (this._connection as WebSocket).send(JSON.stringify(payload));

            }
        }
    }

    private sendOutgoing() {
        if (isDefined(this._connection)) {
            //while (this.outGoing.length > 0) {
            //    let msg = this.outGoing.shift();
            //    (this._connection as WebSocket).send(msg);
            //}
        }
    }



    connect(address): Promise<boolean> {
        this.address = address;
        return new Promise<boolean>( (resolve, reject) => {
            // open connection
            if (isBrowser) {
                var connection = undefined;
                try {
                    connection = new WebSocket(address); // ('ws://127.0.0.1:1041');
                } catch (errorConnection) {
                    return reject({message: "Could not connect to socket"});
                }
                connection.onopen = () => {
                    this._connection = connection;
                    resolve(true);
                };
                connection.onerror = function (error) {
                    console.dir(error);
                };
                connection.onclose = () => {
                    console.log("Reconnecting");
                    if (this._connection === undefined) {
                        reject({message: "Could not connect to socket"});
                    } else {
                        SkeletWebSocket.instance.connect(this.address).then((value: boolean) => {
                            console.log("Reconnected.");
                        });
                    }
                }
                connection.onmessage = (message) => {
                    //console.dir(message);
                    if (message.type === "message") {
                        let data = JSON.parse(message.data) as ISkeletWebSocketResponse;
                        let con_id = data.id;
                        let msg_id = data.msg_id;
                        let prev_id = data.prev_id;
                        let msg = data.message;
                        let param = data.param;
                        if (msg === WSRAuthenticatePlease) {
                            this.con_id = (data.param as IWSRAuthenticateResponse).con_id;
                        }
                        if (isDefined(SkeletWebSocket.instance.delegate)) {
                            SkeletWebSocket.instance.delegate.on(data);
                        }

                    }
                    return false;
                }
            } else {
                resolve(false);
            }

        });
    }



}

