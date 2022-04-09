


export class PropertyDataSource {
    id: string;
    title: string;
    userEditable: boolean = false;
    dataSource?: {[key:string]:string}[];
    remoteDataSource?: {
        type: 'json' | 'xml' | 'sql';
        endPoint: string;
        parameters: {
            id: string;
            name: string;
            value: string;
        }[]
    }
}