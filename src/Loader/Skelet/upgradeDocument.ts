import {ISkeletDocument} from "../../Document/ISkeletDocument";
import {assert, generateV4UUID, isDefined, stringToLocalizedString} from "mentatjs";
import {ISkeletResource} from "../../Document/ISkeletResource";
import {ISkeletScriptBundle} from "../../Document/ISkeletScriptBundle";
import {instanceOfISkeletDocument} from "../../Guards/instanceOfISkeletDocument";
import {TargetFactory} from "../../Compiler/TargetFactory";
import {WorkspaceData} from "../../Document/WorkspaceData";
import {upgradeNode} from "./upgradeNode";
import {ColorBookInfo} from "../ColorPalette/ColorBookInfo";
import {generateDocumentPalette} from "../ColorPalette/generateDocumentPalette";


export function upgradeDocument(doc: ISkeletDocument) {
    assert(instanceOfISkeletDocument(doc), "upgradeDocument expects a ISkeletDocument as parameter.");

    if (!isDefined(doc.projectSettings.title) || doc.projectSettings.title === "") {
        doc.projectSettings.title = "Unnamed Project";
    }
    // check that the outputDirectory exists
    if (!isDefined(doc.projectSettings.outputDirectory)) {
        doc.projectSettings.outputDirectory = "${TMP}/${PROJECT_ID}";
    }

    // check that we have a script bundle
    let hasBundle = false;
    let hasDocumentSwatch = false;
    for (let i = 0; i < doc.resources.length; i += 1) {
        if (doc.resources[i].mime === "skelet/workspace") {
            if (isDefined(doc.resources[i].data) && !isDefined((doc.resources[i].data as WorkspaceData).kind)) {
                let w = (doc.resources[i].data as WorkspaceData);
                w.kind = "WorkspaceData";

                for (let j = 0; j < w.layers.length; j ++) {
                    w.layers[j] = upgradeNode(w.layers[j], undefined);
                }
            }
        }
        if (doc.resources[i].mime === "skelet/colorbookinfo") {
            hasDocumentSwatch = true;
        }
        if (doc.resources[i].mime === "skelet/scriptbundle") {
            hasBundle = true;
        }
    }
    if (hasDocumentSwatch === false) {
        let cbi = generateDocumentPalette("Document Swatch");
        cbi.id = generateV4UUID();
        let res: ISkeletResource = {
            kind: "ISkeletResource",
            id: cbi.id,
            title: "Document Swatch",
            compileOptions: {
                compile: false
            },
            includeInResources: false,
            mime: "skelet/colorbookinfo",
            data: cbi,
            last_modified: "",
            stringData: ""
        };
        doc.resources.push(res);

    }

    if (hasBundle === false) {
        let res: ISkeletResource = {
            kind: "ISkeletResource",
            id: generateV4UUID(),
            title: "Scripts Bundle",
            compileOptions: {
                compile: true
            },
            includeInResources: false,
            mime: "skelet/scriptbundle",
            data: {
                kind: "ISkeletScriptBundle",
                id: generateV4UUID(),
                title: "Scripts Bundle",
                scripts: []
            } as ISkeletScriptBundle,
            last_modified: "",
            stringData: ""
        }
        doc.resources.push(res);
    }
    // 2. do we have targets ?
    if (doc.projectSettings.targets === undefined || doc.projectSettings.targets.length === 0) {
        doc = TargetFactory.createFrontEndTarget(doc, generateV4UUID(), stringToLocalizedString("", "global", "Frontend"),
            stringToLocalizedString("", "global", "Web Frontend in Typescript"));
        doc = TargetFactory.createBackEndTarget(doc, generateV4UUID(), stringToLocalizedString("", "global", "Backend"),
            stringToLocalizedString("", "global", "Server Backend in Typescript"));
    }
    return doc;

}