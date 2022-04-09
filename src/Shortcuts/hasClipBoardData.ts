




export async function hasClipBoardData(): Promise<{ text: string, mime: string } | undefined> {


    try {
        // @ts-ignore
        const clipboardItems = await navigator.clipboard.read();

        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                return {text: "Item", mime: type};
            }

        }

    } catch (err) {
        console.error(err.name, err.message);
    }

}




