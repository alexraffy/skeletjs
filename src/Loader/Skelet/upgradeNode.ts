import {LayerData} from "../../Layer/LayerData";
import {
    Anchor,
    Anchors,
    BorderRadius,
    Bounds, generateV4UUID, isDefined,
    LayerProperty, NumberWithUnit,
    PropertyTextStyle,
    px,
    safeCopy
} from "mentatjs";
import {kFunctionType} from "../../Compiler/kFunctionType";
import {Layer} from "../../Layer/Layer";
import {LayerState} from "../../Layer/LayerState";
import {kTargetKind} from "../../Compiler/kTargetKind";



export function upgradeNode(node: any, parentNode: LayerData): LayerData {

    let target = new LayerData("", "frame", "");
    if (isDefined(parentNode)) {
        target.parent_id = parentNode.id;
    } else {
        target.parent_id = "";
    }

    for (let key in node) {
        if (!["subViews", "states", "properties", "bounds", "anchors", "symbol_properties"].includes(key)) {
            if (isDefined(target[key])) {
                target[key] = node[key];
            } else {
                console.log("Upgrade node key " + key + " not defined");
            }
        } else if (key === "properties") {
            for (let i = 0; i < node.properties.length; i += 1) {
                let np = node.properties[i];
                let tp = new LayerProperty();
                tp.id = np.id;
                tp.property_id = np.property_id;
                tp.type = np.type;
                tp.title = np.title;
                tp.group = np.group;
                if (isDefined(np.dataSource)) {
                    try {
                        tp.dataSource = safeCopy(np.dataSource);
                    } catch (e) {
                        console.warn("UpgradeNode: ERROR copying dataSource ",np, np.dataSource);
                    }
                }
                if (isDefined(np.symbol_id)) {
                    tp.symbol_id = np.symbol_id;
                }
                if (isDefined(np.symbol_node_id)) {
                    tp.symbol_node_id = np.symbol_node_id;
                }
                try {
                    tp.value = safeCopy(np.value);
                } catch (e) {
                    console.warn("UpgradeNode: ERROR copying value ",np, np.value);
                }
                let exists = false;
                for (let j = 0; j < target.properties.length; j++) {
                    if (target.properties[j].property_id === tp.property_id) {
                        target.properties[j] = tp;
                        exists = true;
                    }
                }
                if (exists === false) {
                    target.properties.push(tp);
                }

            }
        } else if (key === "bounds") {



        } else if (key === "anchors") {

        } else if (key === "states") {

        } else if (key === "symbol_properties") {


        }
    }

    if (!isDefined(target.kind)) {
        target.kind = "LayerData";
    }

    // update properties
    for (let i = 0; i < target.properties.length; i += 1) {
        let p = target.properties[i];

        if (p && p.property_id === "view.borderRadius") {
            let value = p.value;
            if (isDefined(value.tr) && !isDefined(value.tr.amount)) {
                p.value = new BorderRadius(value.tr,value.tl,value.bl,value.br);
            }
        }

        if (p && p.type === 'TextStyle') {
            let ts = new PropertyTextStyle();
            let tsValue: PropertyTextStyle = Object.assign(ts, p.value);
            // update props with number to numberWithUnit
            try {
                if (tsValue.size.amount === undefined) {
                    tsValue.size = { amount :parseInt(p.value.size), unit: "px" };

                }
            } catch (_) {
                tsValue.size = { amount: parseInt(p.value.size), unit: 'px' };
            }

            try {
                if (tsValue.wordSpacing !== 'normal') {
                    if ((tsValue.wordSpacing as NumberWithUnit).amount === undefined) {
                        tsValue.wordSpacing = { amount: parseInt(p.value.wordSpacing), unit: 'px'};
                    }
                }
            } catch (_) {
                tsValue.wordSpacing = 'normal';
            }

            try {
                if (tsValue.letterSpacing !== 'normal') {
                    if ((tsValue.letterSpacing as NumberWithUnit).amount === undefined) {
                        tsValue.letterSpacing = { amount: parseInt(p.value.letterSpacing), unit: 'px'};
                    }
                }
            } catch (_) {
                tsValue.letterSpacing = 'normal';
            }

            try {
                if (tsValue.lineHeight !== 'normal') {
                    if ((tsValue.lineHeight as NumberWithUnit).amount === undefined) {
                        (tsValue.lineHeight as NumberWithUnit) = { amount: parseInt(p.value.lineHeight), unit: 'px' };
                    }
                }
            } catch (_) {
                tsValue.lineHeight = 'normal';
            }

            if (tsValue.kerning === undefined) {
                tsValue.kerning = 'normal';
            }
            p.value = tsValue;

        }

    }


    if (node.className === "MentatJS.View") {
        node.canHaveChildren = true;
    }

    if (!isDefined(node.states)) {
        node.states = [];
    }

    if (node.isPage === false && target.functions.targetKind === kTargetKind.frontend && target.functions.functions.length === 0) {
        target.functions.functions.push({
                kind: "IFunction",
                id: "init",
                action_type: kFunctionType.frontend_init,
                optional: false,
                server_side: false,
                return_type: "void",
                parameters: [],
                modifiers: [],
                trad_id: "IFE_INIT",
                help_trad_id: "IFE_INIT_HELP",
                triggered_by: [""],
                triggers: [],
                value: "// initialize control if necessary",
                deletable: false,
                editable: true,
                renamable: false,
                language: "ts"

            }
        );
    }


    if (node.isPage === true) {



        if (node.states.length === 0) {
            // add a default state
            let newState: LayerState = {
                id: generateV4UUID(),
                overrides: [],
                isDefaultState: true,
                localization: "en-US",
                responsiveStep: {
                    width: 0
                },
                type: "active",
                title: "Default"
            }
            target.states.push(newState);
            target.current_state = newState.id;
        }
    }

    let l = new Layer(target);

    // bounds
    if (isDefined(node.bounds)) {
        let blp = new LayerProperty();
        blp.id = generateV4UUID();
        blp.group = "hidden_style";
        blp.title = "Bounds";
        blp.type = "bounds";
        blp.value = new Bounds(0, 0, 0, 0);
        if (isDefined(node.bounds.x) && isDefined(node.bounds.x.amount)) {
            blp.value.x = node.bounds.x;
        } else {
            blp.value.x = {amount: parseInt(node.bounds.x.toString()), unit: "px"};
        }
        if (isDefined(node.bounds.y) && isDefined(node.bounds.y.amount)) {
            blp.value.y = node.bounds.y;
        } else {
            blp.value.y = {amount: parseInt(node.bounds.y.toString()), unit: "px"};
        }
        if (isDefined(node.bounds.z) && isDefined(node.bounds.z.amount)) {
            blp.value.z = node.bounds.z;
        } else {
            if (isDefined(node.bounds.z)) {
                blp.value.z = px(parseInt(node.bounds.z.toString()));
            } else {
                blp.value.z = px(0);
            }
        }

        if (isDefined(node.bounds.width) && isDefined(node.bounds.width.amount)) {
            blp.value.width = node.bounds.width;
        } else {
            blp.value.width = {amount: parseInt(node.bounds.width.toString()), unit: "px"};
        }
        if (isDefined(node.bounds.height) && isDefined(node.bounds.height.amount)) {
            blp.value.height = node.bounds.height;
        } else {
            blp.value.height = {amount: parseInt(node.bounds.height.toString()), unit: "px"};
        }
        if (!isDefined(node.bounds.rotation)) {
            blp.value.rotation = new NumberWithUnit(0, "deg");
        }
        if (!isDefined(node.bounds.elevation)) {
            blp.value.elevation = new NumberWithUnit(0, "auto");
        }

        if (l.isPage === true) {
            if (isDefined(parentNode) && parentNode.special_id === "workspace.views") {
                l.pageLayer = l;
            }
        }
        l.setPropertyValue("view.bounds", blp.value);
    }

    // Anchors
    if (isDefined(node.anchors)) {
        let blp = new LayerProperty();
        blp.id = generateV4UUID();
        blp.group = "hidden_style";
        blp.title = "Anchors";
        blp.type = "anchors";
        blp.value = {
            kind: "Anchors",
            top: new Anchor(false, "top", "parent", "leading", px(0)),
            left: new Anchor(false, "left", "parent", "leading", px(0)),
            right: new Anchor(false, "right", "parent", "leading", px(0)),
            bottom: new Anchor(false, "bottom", "parent", "leading", px(0)),
            width: new Anchor(false, "width", "parent", "leading", px(0)),
            height: new Anchor(false, "height", "parent", "leading", px(0)),
            centerv: new Anchor(false, "centerv", "parent", "leading", px(0)),
            centerh: new Anchor(false, "centerh", "parent", "leading", px(0))
        } as Anchors;
        l.setPropertyValue("view.anchors",blp.value);
    }

    /*
    if (isDefined(node.subViews)) {
        for (let x = 0; x < node.subViews.length; x += 1) {
            let subTarget = _upgradeNode(node.subViews[x], l);
            if (subTarget) {
                l.adopt(subTarget);
            }
        }
    }

     */
    return l.data;
}
