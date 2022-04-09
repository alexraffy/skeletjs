import {Fill, generateV4UUID, Label, PXBounds} from "mentatjs";


export function labelForText(text: string, textColor: string, backgroundColor: string): Label {
    const id = generateV4UUID();
    const priceLabel = new Label();
    priceLabel.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: 30,
            height: parentBounds.height!,
            unit: "px",
            position: "absolute"
        };
    };
    priceLabel.fills = [new Fill(true, "color", "normal", backgroundColor)];
    priceLabel.textAlignment = "center";
    priceLabel.fontWeight = '300';
    priceLabel.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
    priceLabel.fillLineHeight = true;
    priceLabel.fontSize = 12;
    priceLabel.fontColor = textColor;
    priceLabel.text = text;
    priceLabel.initView(id);
    return priceLabel;
}
