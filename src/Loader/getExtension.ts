

export function getExtension(filename: string): string {
    let point = filename.lastIndexOf(".");
    if (point > -1) {
        return filename.substring(point+1);
    }
    return undefined;
}