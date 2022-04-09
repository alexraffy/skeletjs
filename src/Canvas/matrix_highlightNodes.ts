import {NUConvertToPixel} from "mentatjs";
import {Layer} from "../Layer/Layer";


export function matrix_highlightNodes(matrix: {free: boolean, isWhitespace: boolean, nodeRef?: Layer, isStartOfNode: boolean, isEndOfNode: boolean}[][], container: Layer) {
    "use strict";
    let i = 0;
    let x = 0;
    let y = 0;
    // fill the matrix with false if a node exists
    for (i = 0; i < container.children.length; i += 1) {
        let node = container.children[i];

        let pageLayer = node.pageLayer;
        let properties = node.properties;

        let bounds = node.bounds();
        for (y = NUConvertToPixel(bounds.y).amount; y < NUConvertToPixel(bounds.y).amount + NUConvertToPixel(bounds.height).amount; y += 1) {
            if (y >= matrix.length) {
                break;
            }
            let matRow = matrix[y];
            if (matRow === undefined) {
                break;
            }
            for (x = NUConvertToPixel(bounds.x).amount; x < NUConvertToPixel(bounds.x).amount + NUConvertToPixel(bounds.width).amount; x += 1) {
                if (x >= matRow.length) {
                    break;
                }
                if (matRow[x] === undefined) {
                    break;
                }
                matRow[x].free = false;
                matRow[x].isWhitespace = false;
                matRow[x].nodeRef = node;
            }
        }
    }
}

