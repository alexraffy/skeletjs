



export function check_selectionBounds_against_container(selectedNodesBounds, containerBounds) {
    return selectedNodesBounds;

    if ((selectedNodesBounds.x) < 0) {
        selectedNodesBounds.x = 0;
    }
    if ((selectedNodesBounds.x) + (selectedNodesBounds.width) > (containerBounds.width)) {
        selectedNodesBounds.x = (containerBounds.width) - (selectedNodesBounds.width);
    }

    if ((selectedNodesBounds.y) < 0) {
        selectedNodesBounds.y = 0;
    }

    if ((selectedNodesBounds.y) + (selectedNodesBounds.height) > (containerBounds.height)) {
        selectedNodesBounds.y = (containerBounds.height) - (selectedNodesBounds.height);
    }
    return selectedNodesBounds;
}
