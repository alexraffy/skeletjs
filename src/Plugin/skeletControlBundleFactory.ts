import {ISkeletScriptBundle} from "../Document/ISkeletScriptBundle";
import {kTargetKind} from "../Compiler/kTargetKind";
import {assert, generateV4UUID, isDefined} from "mentatjs";
import {genFunction} from "./genFunction";
import {ISkeletScript} from "../Document/ISkeletScript";
import {genFunctionParam} from "./genFunctionParam";


export function skeletControlBundleFactory(title: string): ISkeletScriptBundle {
    assert(isDefined(title) && typeof title === "string", "skeletControlBundleFactory expects a string as parameter.");
    let ret: ISkeletScriptBundle = {
        kind: "ISkeletScriptBundle",
        id: generateV4UUID(),
        title: title,
        scripts: []
    };

    let script: ISkeletScript = {
        kind: "ISkeletScriptFile",
        id: generateV4UUID(),
        targetKind: kTargetKind.frontend,
        title: title,
        type: "class",
        path: "/src/frontend",
        classInfo: {
            doInherits: "SkeletComponentIntegration",
            doImplements: []
        },
        hiddenImportSection: "import {View} from \"mentatjs\";",
        functions: []
    };
    ret.scripts.push(script);

    let fnPositioning = genFunction("positioning", false, "Bounds",
        [genFunctionParam("layer", "Layer", false, undefined),
            genFunctionParam("x", "NumberWithUnit", false, undefined),
            genFunctionParam("y", "NumberWithUnit", false, undefined)],
        "return new Bounds(x, y, 100, 30);", false, true, false, "ts");
    script.functions.push(fnPositioning);

    let fnProperties = genFunction("properties", false, "LayerProperty[]",
        [], "return []", false, true, false, "ts");
    script.functions.push(fnProperties);

    let fnApplyProperty = genFunction("applyProperty", false, "void", [
        genFunctionParam("property_id", "string", false, undefined),
        genFunctionParam("value", "any", false, undefined)
    ], "", false, true, false, "ts");
    script.functions.push(fnApplyProperty);

    let fnIconFactory = genFunction("listIcon", false, "View", [
            genFunctionParam("layer", "Layer", false, undefined),
            genFunctionParam("bounds", "Bounds", false, undefined)
        ], "let icon = new View();\nicon.getDefaultStyle().bounds = bounds;\nreturn icon;\n",
        false, true, false, "ts");
    script.functions.push(fnIconFactory);

    let fnViewWasSelected = genFunction("layerWasSelected", false, "void",
        [genFunctionParam("layer", "Layer", false, undefined)],"",
        false, true, false, "ts");
    script.functions.push(fnViewWasSelected);

    let fnComponentIcon = genFunction("libraryIconSetup", false, "void",
        [genFunctionParam("layer", "Layer", false, undefined)],"",
        false, true, false, "ts");
    script.functions.push(fnComponentIcon);

    return ret;
}
