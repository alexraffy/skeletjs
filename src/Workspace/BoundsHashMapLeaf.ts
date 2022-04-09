import {Bounds} from "mentatjs";


export interface BoundsHashMapLeaf {
    id: string;
    bounds: Bounds;
    children: BoundsHashMapLeaf[];
    parent: BoundsHashMapLeaf;
}
