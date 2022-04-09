import {IFileConnectionInfo} from "./CSV/IFileConnectionInfo";
import {IDB2ConnectionInfo} from "./DB2/IDB2ConnectionInfo";
import {IMySQLConnectionInfo} from "./MySQL/IMysqlConnectionInfo";
import {IODBCConnectionInfo} from "./ODBC/IODBCConnectionInfo";
import {IOracleConnectionInfo} from "./Oracle/IOracleConnectionInfo";
import {IPostgresConnectionInfo} from "./PostgreSQL/IPostgresConnectionInfo";
import {ISalesforceConnectionInfo} from "./Salesforce/ISalesforceConnectionInfo";
import {ISqliteConnectionInfo} from "./SQLite/ISqliteConnectionInfo";
import {ISQLServerConnectionInfo} from "./SQLServer/ISQLServerConnectionInfo";


export type IConnectionInfo = IFileConnectionInfo | IDB2ConnectionInfo | IMySQLConnectionInfo |
    IODBCConnectionInfo | IOracleConnectionInfo | IPostgresConnectionInfo | ISalesforceConnectionInfo |
    ISqliteConnectionInfo | ISQLServerConnectionInfo;