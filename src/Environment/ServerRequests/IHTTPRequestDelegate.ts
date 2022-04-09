


export interface IHTTPRequestDelegate {
    progress?(percentage: number);
    data?(response: string);
    binaryData?(data: Uint8Array);
    error(e: Error);
}

