import {IConnectionInfo} from "./IConnectionInfo";


export interface IDatabase {
    id: string;
    title: string;
    driver: string;
    connectionInfo: IConnectionInfo
}