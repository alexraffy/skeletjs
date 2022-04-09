import {Bounds, Direction, ImageView, View} from "mentatjs";


export class Ruler extends View {

    direction: Direction = Direction.horizontal;

    private image: ImageView;

    mode: string = 'px';

    constructor() {
        super();
        this.overflow = 'hidden';

    }

    viewWasAttached() {
        super.viewWasAttached();
        let image = new ImageView();
        if (this.direction === Direction.horizontal) {
            image.getDefaultStyle().bounds = new Bounds(-4800, 0, 9600, 20);
            image.imageURI = "assets/ui/ruler_horiz.png";
            image.imageWidth = 9600;
            image.imageHeight = 20;
        } else {
            image.getDefaultStyle().bounds = new Bounds(0, -4800, 20, 9600);
            image.imageURI = "assets/ui/ruler_vertical.png";
            image.imageWidth = 20;
            image.imageHeight = 9600;
        }
        image.initView(this.id + ".image");
        this.attach(image);
        this.image = image;
    }


    set(start: number) {
        if (this.direction === Direction.horizontal) {
            this.image.getDefaultStyle().bounds = new Bounds(-(start + 4800), 0, 9600, 20);
        } else {
            this.image.getDefaultStyle().bounds = new Bounds(0, -(start + 4800), 20, 9600);
        }
        this.image.doResizeFrameOnly(true);

    }

}