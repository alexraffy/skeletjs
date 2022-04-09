import {Layer} from "../Layer/Layer";
import {matrix_create} from "./matrix_create";
import {matrix_highlightNodes} from "./matrix_highlightNodes";


export function getWhitespaceMatrix(container: Layer, maxWidth: number, maxHeight: number) {
    let matrix = matrix_create(maxWidth, maxHeight);
    matrix_highlightNodes(matrix, container);
    return matrix;
};


