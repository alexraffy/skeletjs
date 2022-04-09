


export interface IRoute {
    kind: "IRoute";
    id: string;
    path: string;
    viewController: string;
    parameters: {
        [key:string]:any;
    }
}
