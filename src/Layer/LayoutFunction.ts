



export interface LayoutFunction {
    kind: 'LayoutFunction';
    layoutAxis: 'y';
    layoutFunction: (x)=>number;
    colors: {
        light: string;
        dark: string;
    }
}