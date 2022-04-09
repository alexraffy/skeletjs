import {Layer} from "../Layer/Layer";
import {isDefined} from "mentatjs";


export function matrixCheckSpace(matrix: {free: boolean, isWhitespace: boolean, nodeRef?: Layer, isStartOfNode: boolean, isEndOfNode: boolean}[][],
                                 size: {width: number, height: number},
                                 atPoint: {x: number, y: number}): boolean {
    if ((!isDefined(matrix)) || (!isDefined(size)) || (!isDefined(atPoint))) {
        return false;
    }
    let MATRIX_HEIGHT = matrix.length;
    if (MATRIX_HEIGHT === 0) {
        return false;
    }
    let MATRIX_WIDTH = matrix[0].length;
    if (MATRIX_WIDTH === 0) {
        return false;
    }
    if (atPoint.y >= MATRIX_HEIGHT) {
        return false;
    }
    if (atPoint.x >= MATRIX_WIDTH) {
        return false;
    }
    if (atPoint.y + size.height >= MATRIX_HEIGHT) {
        return true;
    }
    if (atPoint.x + size.width >= MATRIX_WIDTH) {
        return true;
    }
    for (let y = atPoint.y; y <= atPoint.y + size.height; y += 1) {
        for (let x = atPoint.x; x <= atPoint.x + size.width; x += 1) {
            let point = matrix[y][x];
            if (point.isWhitespace === false) {
                return false;
            }
        }
    }
    return true;
};


