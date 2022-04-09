import {Bounds, isDefined, NUConvertToPixel, NumberWithUnit, px} from "mentatjs";


export function testMagnet(nodeBounds: Bounds, magnet: any, mouseOffsetX: number, mouseOffsetY: number)
    : { result: boolean, x?: NumberWithUnit, y?: NumberWithUnit, absoluteDistance: NumberWithUnit, distance: NumberWithUnit, target: { id: string}, side: string } {
    let result : { result: boolean, x?: NumberWithUnit, y?: NumberWithUnit, absoluteDistance: NumberWithUnit, distance: NumberWithUnit, target: { id: string }, side: string } =
        {
            result: false,
            absoluteDistance: px(0),
            distance: px(0),
            target: { id: ""},
            side: ""
        };

    let xy ="x";
    let offset = mouseOffsetX;
    if (isDefined(magnet.y)) {
        xy = "y";
        offset = mouseOffsetY;
    }

    if (xy === "x") {

        let dst1: NumberWithUnit = px(0);
        let distance1: NumberWithUnit = px(0);
        if (NUConvertToPixel(nodeBounds[xy]).amount > NUConvertToPixel(magnet[xy]).amount) {
            distance1 = px(- (NUConvertToPixel(nodeBounds[xy]).amount - NUConvertToPixel(magnet[xy]).amount));
        } else {
            distance1 = px(NUConvertToPixel(magnet[xy]).amount - NUConvertToPixel(nodeBounds[xy]).amount);
        }
        dst1 = px(Math.abs(distance1.amount));


        let dst2: NumberWithUnit = px(0);
        let distance2: NumberWithUnit = px(0);
        if (NUConvertToPixel(nodeBounds[xy]).amount + NUConvertToPixel(nodeBounds.width).amount > NUConvertToPixel(magnet[xy]).amount) {
            distance2 = px(- ((NUConvertToPixel(nodeBounds[xy]).amount + NUConvertToPixel(nodeBounds.width).amount) - NUConvertToPixel(magnet[xy]).amount));
        } else {
            distance2 = px((NUConvertToPixel(magnet[xy]).amount - (NUConvertToPixel(nodeBounds[xy]).amount + NUConvertToPixel(nodeBounds.width).amount)));
        }
        dst2 = px(Math.abs(distance2.amount));


        if (dst1.amount < 5 && offset < 5 ) {
            result.result = true;
            result[xy] = magnet[xy];
            result.absoluteDistance = dst1;
            result.target = { id: magnet.node.id };
            result.distance = distance1;
            result.side = "left";
            return result;
        }


        if (dst2.amount < 5 && offset < 5 ) {
            result.result = true;
            result[xy] = magnet[xy];
            result.absoluteDistance = dst2;
            result.distance = distance2;
            result.target = { id: magnet.node.id };
            result.side = "right";
            return result;
        }

    }

    if (xy === "y") {
        let dst1: NumberWithUnit = px(0);
        let distance1: NumberWithUnit = px(0);
        if (NUConvertToPixel(nodeBounds[xy]).amount > NUConvertToPixel(magnet[xy]).amount) {
            distance1 = px(- (NUConvertToPixel(nodeBounds[xy]).amount - NUConvertToPixel(magnet[xy]).amount));
        } else {
            distance1 = px(NUConvertToPixel(magnet[xy]).amount - NUConvertToPixel(nodeBounds[xy]).amount);
        }
        dst1 = px(Math.abs(distance1.amount));


        let dst2: NumberWithUnit= px(0);
        let distance2: NumberWithUnit = px(0);
        if (NUConvertToPixel(nodeBounds[xy]).amount + NUConvertToPixel(nodeBounds.height).amount > NUConvertToPixel(magnet[xy]).amount) {
            distance2 = px(- ((NUConvertToPixel(nodeBounds[xy]).amount + NUConvertToPixel(nodeBounds.height).amount) - NUConvertToPixel(magnet[xy]).amount));
        } else {
            distance2 = px((NUConvertToPixel(magnet[xy]).amount - (NUConvertToPixel(nodeBounds[xy]).amount + NUConvertToPixel(nodeBounds.height).amount)));
        }
        dst2 = px(Math.abs(distance2.amount));


        if (dst1.amount < 5 && offset < 5 ) {
            result.result = true;
            result[xy] = magnet[xy];
            result.absoluteDistance = dst1;
            result.target = { id: magnet.node.id };
            result.distance = distance1;
            result.side = "top";
            return result;
        }


        if (dst2.amount < 5 && offset < 5 ) {
            result.result = true;
            result[xy] = magnet[xy];
            result.absoluteDistance = dst2;
            result.distance = distance2;
            result.target = { id: magnet.node.id };
            result.side = "bottom";
            return result;
        }
    }


    return result;

}