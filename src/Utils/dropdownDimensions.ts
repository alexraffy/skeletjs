import {Drp, generateV4UUID, PXBounds} from "mentatjs";


export function dropdownDimensions(width: number): Drp {
    "use strict";
    const id = generateV4UUID();
    const dp = new Drp();
    dp.keyValues["required_width"] = width;
    dp.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        return {
            x: 0,
            y: 0,
            width: this.keyValues["required_width"],
            height: parentBounds.height!,
            unit: 'px',
            position: 'absolute'
        };
    };
    dp.dataSource = [ { id: "px", text: 'px'}, { id: "pt", text: 'pt'}, { id: "vw", text: 'vw'}];
    dp.initView(id);
    return dp;
}

