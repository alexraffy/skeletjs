import {Fill, generateV4UUID, Label, PXBounds} from "mentatjs";


export function labelForTextExt(text: string, textColor: string, backgroundColor: string, fontSize: number, width: number, alignment: 'left' | 'right' | 'center' | 'justify'): Label {
    const id = generateV4UUID();
    const priceLabel = new Label();
    priceLabel.keyValues["required_width"] = width;
    priceLabel.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: this.keyValues["required_width"],
            height: parentBounds.height! ,
            unit: "px",
            position: "absolute"
        };
    };
    priceLabel.fills =  [new Fill(true, "color", "normal", backgroundColor)];
    priceLabel.textAlignment = alignment;
    priceLabel.fontWeight = '300';
    priceLabel.fillLineHeight = true;
    priceLabel.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
    priceLabel.fontColor = textColor;
    priceLabel.fontSize = fontSize;
    priceLabel.text = text;
    priceLabel.initView(id);
    return priceLabel;
}
