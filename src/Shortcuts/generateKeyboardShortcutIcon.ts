import {BorderSide, generateV4UUID, ImageView, isDefined, Label, px, PXBounds, View} from "mentatjs";
import {getEnvironment} from "../Environment/getEnvironment";


const IMAGE_LEFTCLICK = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDM4NCA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM4NCA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7b3BhY2l0eTowLjQ7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3Qxe2Rpc3BsYXk6bm9uZTt9Cgkuc3Qye2Rpc3BsYXk6aW5saW5lO29wYWNpdHk6MC42NjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDN7b3BhY2l0eTowLjY2O2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAgICA7fQo8L3N0eWxlPgo8ZyBpZD0iTGF5ZXJfMSIgZm9jdXNhYmxlPSJmYWxzZSI+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTc2LDBoLTE2QzcxLjYsMCwwLDcxLjYsMCwxNjB2MzJoMTc2VjB6IE0yMjQsMGgtMTZ2MTkyaDE3NnYtMzJDMzg0LDcxLjYsMzEyLjQsMCwyMjQsMHogTTAsMzUyCgkJCWMwLDg4LjQsNzEuNiwxNjAsMTYwLDE2MGg2NGM4OC40LDAsMTYwLTcxLjYsMTYwLTE2MFYyMjRIMFYzNTJ6Ii8+CgkJPHBhdGggZD0iTTM4NCwxOTJ2MzJIMHYtMzJoMTc2VjBoMzJ2MTkySDM4NHoiLz4KCTwvZz4KPC9nPgo8ZyBpZD0ibGVmdGNsaWNrIj4KCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0xNzYsMGgtMTZDNzEuNiwwLDAsNzEuNiwwLDE2MGwwLDMyaDE3NlYweiIvPgo8L2c+Cjwvc3ZnPg==";
const IMAGE_RIGHTCLICK = "";


export function generateKeyboardShortcutIcon(keys, encased: boolean = false): View {
    let v = new View();
    v.keyValues["width"] = keys.length * 24 + keys.length * 10 - 10;
    v.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        let x = 0;
        if (isDefined(this.keyValues["x"])) {
            x = this.keyValues["x"];
        }
        let y = 0;
        if (isDefined(this.keyValues["y"])) {
            y = this.keyValues["y"];
        }
        return {
            x: x,
            y: y,
            width: this.keyValues["width"],
            height: 24,
            unit: 'px',
            position: 'absolute'
        };
    };
    v.keyValues["keys"] = keys;
    v.keyValues["encased"] = encased;
    // v.fills = [{active: true, type: "color", blendMode: "normal", value: "rgba(255,255,255,1)"}];
    v.viewWasAttached = function () {
        let xIndex = 0;
        for (let i = 0; i < this.keyValues["keys"].length; i += 1) {
            let key = __generateKey(this, this.keyValues["keys"], xIndex, this.keyValues["keys"][i], this.keyValues["encased"]);
            xIndex += 24;
            if (i < this.keyValues["keys"].length - 1) {
                // generate +
                let plusLabel = new Label();
                plusLabel.keyValues["xIndex"] = xIndex;
                plusLabel.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
                    return {
                        x: this.keyValues["xIndex"],
                        y: 0,
                        width: 10,
                        height: 24,
                        unit: 'px',
                        position: "absolute"
                    };
                };
                plusLabel.text = "+";
                plusLabel.fontSize = 12;
                plusLabel.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                plusLabel.fontColor = "rgb(120,120,120)";
                plusLabel.textAlignment = "center";
                plusLabel.fillLineHeight = true;
                plusLabel.initView(this.id + ".plus" + i);
                this.attach(plusLabel);
            }

            xIndex += 10;
        }

    }
    v.initView(generateV4UUID());
    return v;

}


function __generateKey (container, keys, xIndex, key, encased: boolean = false) {

    if (key === 'leftclick' || key === 'rightclick') {
        encased = false;
    }

    let under = new View();
    under.keyValues["xIndex"] = xIndex;
    under.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        return {
            x: this.keyValues["xIndex"],
            y :0,
            width: 24,
            height: 24,
            unit: 'px',
            position: "absolute"
        };
    };
    //under.fills = [{active: true, type: 'color', blendMode: "normal", value: "rgba(255,255,255,1)"}];
    if (encased === true) {
        under.fills = [{active: true, type: 'color', blendMode: "normal", value: "rgb(120,120,120)"}];
        under.borders = [{active: true, pattern: 'solid', thickness:1, value: "rgb(120,120,120)", side: BorderSide.all}];
        under.borderRadius = { tl: px(2), tr: px(2), bl: px(2), br: px(2)};
    }
    under.initView(container.id + ".under");
    container.attach(under);

    let cap = new View();
    cap.keyValues["xIndex"] = xIndex;
    cap.keyValues["encased"] = encased;
    cap.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
        return {
            x: this.keyValues["xIndex"],
            y : (this.keyValues["encased"] === false) ? 0 : 0,
            width: 24,
            height: (this.keyValues["encased"] === false) ? 24 : 22,
            unit: 'px',
            position: "absolute"
        };
    };
    //cap.fills = [{active: true, type: 'color', blendMode: "normal", value: "rgba(255,255,255,1)"}];
    if (encased === true) {
        cap.fills = [{active: true, type: 'color', blendMode: "normal", value: "rgba(255,255,255,1)"}];
        cap.borders = [{active: true, pattern: 'solid', thickness:1, value: "rgb(120,120,120)", side: BorderSide.all}];
        cap.borderRadius = { tl: px(2), tr: px(2), bl: px(2), br: px(2)};
    }
    cap.initView(container.id + ".cap");
    container.attach(cap);

    if (key === "leftclick" || key === "rightclick") {

        let _w = 512;
        let _h = 384;
        let h = 20;
        let w = 512 * h / _h;

        let img = new ImageView();
        img.keyValues["xIndex"] = xIndex;
        img.keyValues["h"] = h;
        img.keyValues["w"] = w;
        img.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            let y = parentBounds.height / 2 - this.keyValues["h"] / 2;
            let height = 24;
            return {
                x: this.keyValues["xIndex"],
                y: y,
                width: this.keyValues["w"],
                height: this.keyValues["h"],
                unit: 'px',
                position: "absolute"
            };
        };
        img.imageURI = "data:image/svg+xml;base64," + IMAGE_LEFTCLICK;
        img.imageWidth = w;
        img.imageHeight = h;
        img.initView(generateV4UUID());
        container.attach(img);
    } else {

        let letter = new Label();
        letter.keyValues["xIndex"] = xIndex;
        letter.pxBoundsForView = function (parentBounds: PXBounds): PXBounds {
            let y = 0;
            let height = 24;
            //if (['ctrl', 'alt', 'del'].contains(this.keyValues["key"].toLowerCase())) {
            //    y = 12;
            //    height = 10;
            //}
            return {
                x: this.keyValues["xIndex"],
                y: y,
                width: 24,
                height: height,
                unit: 'px',
                position: "absolute"
            };
        };
        letter.text = key;
        letter.keyValues["key"] = key;
        letter.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        letter.fontColor = "rgb(120,120,120)";
        letter.fontWeight = '400';

        if (['ctrl', 'alt', 'del', 'shift','drag'].includes(key.toLowerCase())) {
            letter.fontSize = 9;
            if (key.toLowerCase() === "shift") {
                letter.fontColor = "rgb(220,220,220)";
                letter.text = "&#xf357;";
                letter.fontSize = 12;
                letter.fontWeight = '900';
                letter.fontFamily = 'FontAwesome5ProSolid,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            }
            if (key.toLowerCase() === "alt") {

                letter.text = "alt";

                letter.fontSize = 12;
                letter.fontColor = "rgb(220,220,220)";
                letter.fontFamily = 'FontAwesome5ProRegular,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                if (getEnvironment().isMacOSX === true) {

                    letter.fontSize = 12;
                    letter.text = "&#x2325;";

                }
            }
            if (key.toLowerCase() === "drag") {
                letter.fontSize = 12;
                letter.fontColor = "rgb(220,220,220)";
                letter.fontWeight = '900';
                letter.text = "&#xf0b2;";
                letter.fontFamily = 'FontAwesome5ProSolid,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            }
        } else {
            letter.fontSize = 12;
        }


        letter.textAlignment = "center";

        letter.fillLineHeight = true;
        letter.initView(container.id + ".letter" + key);
        container.attach(letter);
    }

}