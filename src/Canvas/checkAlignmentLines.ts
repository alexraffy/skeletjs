import {View} from "mentatjs";
import {DragPayload} from "./DragPayload";


export function checkAlignmentLines(dragPayload: DragPayload): {x?: number, y?: number, view: View}[] {
    let ret: {x?: number, y?: number, view: View}[] = [];
    return ret;
    /*
    for (let i = 0; i < dragPayload.nodes.length; i += 1) {
        let n = dragPayload.nodes[i].node;
        let p = dragPayload.nodes[i].parentNode;
        let pv = findViewRef(p.id);
        for (let x = 0; x < p.subViews.length; x += 1) {
            let psv = p.subViews[x];
            if (Session.instance.selectedLayersInfo.includes(psv.id)) {
                continue;
            }

            // left sides coincide
            if ((n.bounds.x) === (psv.bounds.x)) {
                ret.push({
                    x: (n.bounds.x),
                    view: pv
                });
            }
            // left side coincide with right side
            if ((n.bounds.x) === (psv.bounds.x) + (psv.bounds.width)) {
                ret.push({
                    x: (n.bounds.x),
                    view: pv
                });
            }
            // right side of node coincides with left side
            if ((n.bounds.x) + (n.bounds.width) === (psv.bounds.x)) {
                ret.push({
                    x: (n.bounds.x) + (n.bounds.width),
                    view: pv
                });
            }
            // right sides coincide
            if ((n.bounds.x) + (n.bounds.width) === (psv.bounds.x) + (psv.bounds.width)) {
                ret.push({
                    x: (n.bounds.x) + (n.bounds.width),
                    view: pv
                });
            }
            // top sides coincide
            if ((n.bounds.y) === (psv.bounds.y)) {
                ret.push({
                    y: (n.bounds.y),
                    view: pv
                });
            }
            // top side coincide with bottom side
            if ((n.bounds.y) === (psv.bounds.y) + (psv.bounds.height)) {
                ret.push({
                    y: (n.bounds.y),
                    view: pv
                });
            }
            // bottom side coincide with top side
            if ((n.bounds.y) + (n.bounds.height) === (psv.bounds.y)) {
                ret.push({
                    y: (n.bounds.y) + (n.bounds.height),
                    view: pv
                });
            }
            // bottom sides coincide
            if ((n.bounds.y) + (n.bounds.height) === (psv.bounds.y) + (psv.bounds.height)) {
                ret.push({
                    y: (n.bounds.y) + (n.bounds.height),
                    view: pv
                });
            }

        }
    }

    let newRet: { x?: number, y?: number, view: View}[] = [];
    for (let i = 0; i < ret.length; i += 1) {
        let r = ret[i];
        let exists = newRet.find((elem) => {
            if (isDefined(r.x) && isDefined(elem.x)) {
                return elem.x === r.x;
            }
            if (isDefined(r.y) && isDefined(elem.y)) {
                return elem.y === r.y;
            }
            return false;
        });
        if (!isDefined(exists)) {
            newRet.push(r);
        }
    }
    return newRet;

     */

}


