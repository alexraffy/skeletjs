


export interface IFunctionParam {
    kind: "IFunctionParam";
    id: string,
    optional: boolean;

    type: string;
    defaultValue: any;
    trad_id: string;
    help_trad_id: string;
}