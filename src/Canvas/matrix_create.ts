import {Layer} from "../Layer/Layer";


export function matrix_create(maxWidth: number, maxHeight: number): {free: boolean, isWhitespace: boolean, nodeRef?: Layer, isStartOfNode: boolean, isEndOfNode: boolean}[][] {
    "use strict";
    let x, y = 0;
    let matrix:  {free: boolean, isWhitespace: boolean, nodeRef?: Layer, isStartOfNode: boolean, isEndOfNode: boolean}[][]= [];
    for (y = 0; y < maxHeight; y += 1) {
        let row = [];
        for (x = 0; x < maxWidth; x += 1) {
            row.push({
                free: true,
                isWhitespace: true,
                nodeRef: null,
                isStartOfNode: false,
                isEndOfNode: false
            });
        }
        matrix.push(row);
    }
    return matrix;
}

