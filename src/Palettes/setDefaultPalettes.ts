import {assert, isDefined, NUConvertToPixel, Point, px, Size, View} from "mentatjs";
import {getPaletteForPanel} from "./getPaletteForPanel";


export function setDefaultPalettes(parentContainer: View) {
    assert(isDefined(parentContainer) && parentContainer instanceof View, "setDefaultPalettes expects a View as parameter.");
    let parentBounds = parentContainer.getRealBounds();
    let leftSide: Point = Point.fromStruct({x: px(NUConvertToPixel(parentBounds.x).amount + 20), y: px(NUConvertToPixel(parentBounds.y).amount + 20)});
    let rightSide: Point = Point.fromStruct({x: px(NUConvertToPixel(parentBounds.width).amount - 280), y: px(0)});

    // layers
    let layers = getPaletteForPanel("layers");
    layers.setCollapsed(false);
    layers.isDocked = false;
    layers.setOriginAndSize(leftSide.copy(), Size.fromStruct({width: px(280), height: px(300)}));


    // components
    let components = getPaletteForPanel("components");
    components.setCollapsed(false);
    components.setOriginAndSize(leftSide.copy(), Size.fromStruct({width: px(280), height: px(350)}));
    layers.attachPaletteBelow(components);


    // bundles
    let bundles = getPaletteForPanel("bundles");
    bundles.setCollapsed(false);
    components.attachPaletteBelow(bundles);

    // colors
    let colors = getPaletteForPanel("swatches");
    colors.setCollapsed(false);
    colors.setOriginAndSize(rightSide.copy(), Size.fromStruct({width: px(280), height: px(240)}));

    // origin
    let origin = getPaletteForPanel("position");
    origin.setCollapsed(false);
    colors.attachPaletteBelow(origin);

    // appearance
    let properties = getPaletteForPanel("properties");
    properties.setCollapsed(false);
    properties.setOriginAndSize(rightSide.copy(), Size.fromStruct({width: px(280), height: px(300)}));
    origin.attachPaletteBelow(properties);

    let zoom = getPaletteForPanel("zoom");
    zoom.setCollapsed(false);
    zoom.setOriginAndSize(rightSide.copy(), Size.fromStruct({width: px(280), height: px(130)}));
    properties.attachPaletteBelow(zoom);



    layers.refresh();
    components.refresh();
    bundles.refresh();
    colors.refresh();
    origin.refresh();
    properties.refresh();
    zoom.refresh();

}



