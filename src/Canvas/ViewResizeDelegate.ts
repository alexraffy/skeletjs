import {Bounds, View} from "mentatjs";


export interface ViewResizeDelegate {

    viewWillBeResized?(view: View);
    viewIsBeingResized?(view: View, bounds: Bounds, eventData: {
        event: Event,
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        mouseVelocity: {
            linear: number,
            x: number,
            y: number
        }});
    viewWasResized?(view: View);
}