


export interface SkeletWebSocketMessageHandlerInfo {
    message: string;
    handlers: ((string, any) => void)[];
}
