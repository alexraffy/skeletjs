import {ICommandPayload} from "./ICommandPayload";


export interface ICommand {
    payload: ICommandPayload;
    execute(): ICommandPayload[];
    undo(): ICommandPayload[];
}
