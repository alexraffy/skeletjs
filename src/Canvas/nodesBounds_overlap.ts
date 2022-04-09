import {Bounds} from "mentatjs";


export function nodesBounds_overlap(n2: Bounds, n1: Bounds) {

    // assume same unit
    //assert(n1.x.unit === n1.y.unit === n1.width.unit === n1.height.unit === n2.x.unit === n2.y.unit === n2.width.unit === n2.height.unit, "nodesBounds_overlap expects bounds of the same unit");

    if ((n1.x.amount) < ((n2.x.amount) + (n2.width.amount)) && ((n1.x.amount) + (n1.width.amount)) > (n2.x.amount) &&
        (n1.y.amount) < ((n2.y.amount) + (n2.height.amount)) && ((n1.y.amount) + (n1.height.amount)) > (n2.y.amount))
    {
        return true;
    }
    return false;
}
