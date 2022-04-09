




export interface AdobeColorBookInfo {
    version: number;
    title: string;
    description: string;
    prefix: string;
    suffix: string;
    colorCount: number;
    pageSize: number;
    colorSpace: string;
    channels: number;
    isSpot: boolean;
    records: { name: string, code: string, dummyRecord: boolean, components: number[] }[]
}