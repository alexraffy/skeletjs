
import * as JSZip from "jszip";
import {ISkeletFileEncoderDecoder} from "./ISkeletFileEncoderDecoder";
import {
    assert, DictionaryLocalizedString, generateV4UUID,
    IDictionaryLocalizedString,
    isDefined, Logging,
    safeCopy,
    stringToLocalizedString
} from "mentatjs";
import {SkeletDocument} from "../../Document/SkeletDocument";
import {instanceOfSkeletDocument} from "../../Guards/instanceOfSkeletDocument";
import {ProjectSettings} from "../../Document/ProjectSettings";
import {mimeInfo} from "../mimeInfo";
import {getExtension} from "../getExtension";
import {upgradeDocument} from "./upgradeDocument";
import {ColorBookInfo} from "../ColorPalette/ColorBookInfo";
import {getEnvironment} from "../../Environment/getEnvironment";
import {ISkeletScriptBundle} from "../../Document/ISkeletScriptBundle";
import {safeRestore} from "../../Utils/safeRestore";
import {ISkeletDocument} from "../../Document/ISkeletDocument";
import {ISkeletResource} from "../../Document/ISkeletResource";
import {FontInfo} from "../Font/FontInfo";
import {getMimeFromExtension} from "../getMimeFromExtension";
import {Workspace} from "../../Document/Workspace";
import {Asset} from "../../Document/Asset";




export class SkeletFileEncoderDecoderVersion10 implements ISkeletFileEncoderDecoder {

    version: string = "10";

    private m_updateFunc: (value: number)=>void;

    constructor(updateFunction:(value: number)=>void) {
        assert(isDefined(updateFunction), "SkeletFileEncoderDecoderVersion10.constructor expects a function as a parameter.");
        this.m_updateFunc = updateFunction;
    }

    encoder(document: SkeletDocument): Promise<Uint8Array> {
        assert(instanceOfSkeletDocument(document), "SkeletFileEncoderDecoderVersion10.encoder expects a SkeletDocument as parameter.");
        return new Promise( (resolve, reject) => {
            let manifest: {file: string; mime: string; meta: {[key:string]: any}}[] = [];
            let zip = new JSZip();
            console.log("JSZIP Support: ");
            console.log("uint8array=" + JSZip.support.uint8array);
            console.log("blob=" + JSZip.support.blob);
            console.log("arraybuffer=" + JSZip.support.arraybuffer);
            console.log("nodebuffer=" + JSZip.support.nodebuffer);

            zip.file("VERSION", "10");

            zip.folder("resources");
            document.resources.forEach( (r) => {
                console.log(r.mime + " " + r.title);
                if (r.mime === "skelet/projectsettings") {
                    let data: ProjectSettings = safeCopy(document.projectSettings);
                    let fileName = "resources/project.settings";
                    zip.file(fileName, JSON.stringify(data));
                    manifest.push({
                        file: fileName,
                        mime: "skelet/projectsettings",
                        meta: {
                            project_guid: data.project_guid,
                            resource: r.defToJSON(),
                        }
                    })
                } else if (r.mime === "skelet/workspace") {
                    const data = (r.data as Workspace).toJSON()
                    let fileName = "resources/" + data.title + ".workspace"
                    zip.file(fileName, JSON.stringify(data));
                    manifest.push({
                        file: fileName,
                        mime: "skelet/workspace",
                        meta: {
                            workspace_guid: data.workspace_guid,
                            title: data.title,
                            resource: r.defToJSON(),
                        }
                    });
                } else if (r.mime === "skelet/deps") {

                } else if (r.mime === "skelet/scriptbundle") {
                    const data = (r.data as ISkeletScriptBundle);
                    let fileName = "resources/" + data.title + ".bundle"
                    zip.file(fileName, JSON.stringify(data));
                    manifest.push({
                        file: fileName,
                        mime: "skelet/scriptbundle",
                        meta: {
                            bundle_id: data.id,
                            resource: r.defToJSON(),
                        }
                    });
                } else if (r.mime === "skelet/colorbookinfo") {
                    const data = (r.data as ColorBookInfo);
                    let fileName = "resources/" + data.title + ".acb"
                    zip.file(fileName, JSON.stringify(data));
                    manifest.push({
                        file: fileName,
                        mime: "skelet/colorbookinfo",
                        meta: {
                            colorbookdid: data.id,
                            resource: r.defToJSON(),
                        }
                    });
                } else if (r.mime === "skelet/dictionary") {
                    const data: IDictionaryLocalizedString = (r.data as DictionaryLocalizedString).toJSON();
                    let fileName = "resources/" + data.id + ".dict"
                    zip.file(fileName, JSON.stringify(data));
                    manifest.push({
                        file: fileName,
                        mime: "skelet/dictionary",
                        meta: {
                            id: data.id,
                            resource: r.defToJSON(),
                        }
                    });
                } else {

                    let mime_info = mimeInfo(r.mime);
                    if (isDefined(mime_info) && isDefined(mime_info.extensions)) {
                        const data: Asset = r.data as Asset;
                        let ext = mime_info.extensions[0];
                        let fileName = "resources/" + data.title + "." + ext;
                        let uintarray = new Uint8Array(data.data);
                        if (isDefined(uintarray) && uintarray.length > 0) {
                            try {
                                console.log("Asset " + data.title + " size: "+ uintarray.length);
                                zip.file(fileName, uintarray);
                                manifest.push({
                                    file: fileName,
                                    mime: data.mime,
                                    meta: {
                                        resource: r.defToJSON()
                                    }
                                });
                            } catch (eZip) {
                                console.log("Could not write file " + fileName);
                            }
                        }
                    }
                }
            });
            zip.file("MANIFEST", JSON.stringify(manifest));
            zip.generateAsync<"uint8array">({type: "uint8array"}).then(
                (value: Uint8Array) => {
                    resolve(value);
                }).catch((errorGenerate) => {
                    console.log("Error generating skelet file");
                    console.log(errorGenerate.message);
                    console.dir(errorGenerate.stack);
                    reject(errorGenerate.message);
            });


        });
    }

    decoder(fileData: Uint8Array): Promise<ISkeletDocument> {
        return new Promise((resolve, reject) => {
            let manifest: {file: string; mime: string; meta: {[key:string]: any}}[] = [];
            let environment = getEnvironment();
            let zip = new JSZip();
            let counter: number = 0;
            let document: ISkeletDocument = {
                kind: "ISkeletDocument",
                version: "10",
                loaded: false,
                resources: [],
                fontsUsed: [],
                notifications: [],
                projectSettings: {
                    kind: "ProjectSettings",
                    project_guid: generateV4UUID(),
                    title: "",
                    scripts: [],
                    components: [],
                    info: {
                        fontsUsed: [],
                        controlsCount: 0,
                        pluginsUsed: []
                    },
                    assets: [],
                    targets: [],
                    outputDirectory: "${TMP}/${PROJECT_ID}"
                },
                opened_files: [],
                editing_file: "",
                intlStrings: {
                    kind: "IDictionaryLocalizedString",
                    id: "intlString",
                    entries: []
                }
            }

            let delegate = {
                resolve: resolve,
                reject: reject,
                counter: 0,
                count: 0,
                document: document,
                m_updateFunc: this.m_updateFunc,
                callback: function () {

                    this.counter--;
                    this.m_updateFunc(100 * (parseFloat("" + (this.count - this.counter)) / parseFloat("" + this.count)));

                    if (this.counter <= 0) {
                        this.document = upgradeDocument(this.document);
                        this.resolve(safeCopy(this.document));
                    }
                }
            }
            zip.loadAsync(fileData).then(function (z) {
                z.file("MANIFEST").async("string").then((content) => {
                    manifest = JSON.parse(content);

                    let psResourceManifest = manifest.find((m) => { return m.mime === "skelet/projectsettings";});
                    let psResource: ISkeletResource = psResourceManifest?.meta?.resource;

                    z.file("resources/project.settings").async("string").then((psString) => {
                        let meta = JSON.parse(psString);
                        let ps: ProjectSettings = Object.assign({
                            kind: "ProjectSettings",
                            project_guid: generateV4UUID(),
                            title: "",
                            scripts: [],
                            components: [],
                            info: {
                                fontsUsed: [],
                                controlsCount: 0,
                                pluginsUsed: []
                            },
                            assets: [],
                            targets: undefined
                        }, meta);
                        document.projectSettings = ps;

                        let document_index = -1;
                        //console.dir(ps);

                        // fonts
                        if (isDefined(ps.info)) {
                            for (let i = 0; i < ps.info.fontsUsed.length; i += 1) {
                                let found = (environment.Fonts.rows as any as FontInfo[]).find((f: FontInfo) => {
                                    return f.postscriptName === ps.info.fontsUsed[i];
                                });
                                if (!isDefined(found)) {
                                    document.notifications.push(
                                        {
                                            message: stringToLocalizedString("", "en-US", "Font not found: " + ps.info.fontsUsed[i]),
                                            action: [
                                                {
                                                    title: stringToLocalizedString("", "en-US", "Search online for " + ps.info.fontsUsed[i]),
                                                    code: "SEARCHONLINE",
                                                    param: ps.info.fontsUsed[i]
                                                }
                                            ]
                                        }
                                    );

                                } else {
                                    document.fontsUsed.push(found.postscriptName);
                                }
                            }
                        }
                        if (isDefined(psResource)) {
                            psResource.data = safeCopy(ps);
                        } else {
                            psResource = {
                                kind: "ISkeletResource",
                                id: ps.project_guid,
                                title: ps.title,
                                last_modified: "",
                                includeInResources: false,
                                compileOptions: { compile: false},
                                mime: "skelet/projectsettings",
                                data: safeCopy(ps),
                                stringData: ""
                            };
                        }
                        document.resources.push(psResource);
                        document_index += 1;

                        // check plugins
                        let deps: ISkeletResource = {
                            kind: "ISkeletResource",
                            id: generateV4UUID(),
                            mime: "skelet/deps",
                            title: "Dependencies",
                            compileOptions: {
                                compile: false
                            },
                            includeInResources: false,
                            stringData: "",
                            last_modified: (+ new Date()).toString(),
                            data: undefined
                        };
                        document.resources.push(deps);
                        document_index += 1;


                        document_index += 1;
                        let resourceLeaf_Workspace = {
                            id: "Workspaces",
                            children: [],
                            index: document_index
                        }


                        document_index += 1;
                        let resourceLeaf_Assets = {
                            id: "Assets",
                            children: [],
                            index: document_index
                        }


                        document_index += 1;
                        let resourceLeaf_Bundles = {
                            id: "Bundles",
                            children: [],
                            index: document_index
                        }


                        document_index += 1;
                        let resourceLeaf_Palettes = {
                            id: "Palettes",
                            children: [],
                            index: document_index
                        }


                        document_index += 1;
                        let resourceLeaf_Traductions = {
                            id: "Traductions",
                            children: [],
                            index: document_index
                        }


                        if (isDefined(ps.info)) {
                            for (let i = 0; i < ps.info.pluginsUsed.length; i += 1) {
                                let found = environment.Plugins.find((p) => { return p.id === ps.info.pluginsUsed[i].pluginId});
                                if (found) {
                                    if (found.version !== ps.info.pluginsUsed[i].pluginVersion) {
                                        document.notifications.push(
                                            {
                                                message: stringToLocalizedString("", "en-US",
                                                    `Document expects plugin ${found.name} version ${ps.info.pluginsUsed[i].pluginVersion},<br/>You currently have version ${found.version}`
                                                ),
                                                action: [
                                                    {
                                                        code: "UPDATEPLUGIN",
                                                        param: found.id,
                                                        title: stringToLocalizedString("", "en-US", "UPDATE")
                                                    }
                                                ]
                                            }
                                        );
                                    }
                                } else {
                                    document.notifications.push(
                                        {
                                            message: stringToLocalizedString("", "en-US",
                                                `Missing plugin ${ps.info.pluginsUsed[i].pluginName} version ${ps.info.pluginsUsed[i].pluginVersion}.`
                                            ),
                                            action: [
                                                {
                                                    code: "INSTALLPLUGIN",
                                                    param: ps.info.pluginsUsed[i].pluginId,
                                                    title: stringToLocalizedString("", "en-US", "INSTALL")
                                                }
                                            ]
                                        }
                                    );

                                }
                            }
                        }
                        // count all docs to open
                        z.forEach((relativePath, zipEntry) => {
                            Logging.log(relativePath);
                            if (relativePath.startsWith("resources/") && !relativePath.endsWith("resources/")) {
                                delegate.counter++;
                            }
                        });
                        delegate.count = delegate.counter;
                        z.forEach((relativePath, zipEntry) => {

                            if (relativePath.startsWith('resources/') && relativePath.endsWith('.workspace')) {
                                zipEntry.async("text").then((content) => {
                                    let i = 0;
                                    let workspace = safeRestore(content);
                                    if (workspace.workspace_guid === undefined || workspace.workspace_guid === "") {
                                        workspace.workspace_guid = generateV4UUID();
                                    }
                                    if (workspace.title === undefined || workspace.title === "") {
                                        workspace.title = "Untitled workspace";
                                    }
                                    Logging.log("Found workspace " + workspace.title);
                                    let foundResource: ISkeletResource = manifest.find((m) => { return m.file === relativePath;}).meta.resource;
                                    foundResource.data = workspace;
                                    document.resources.push(foundResource);
                                    document_index += 1;
                                    resourceLeaf_Workspace.children.push(
                                        {
                                            id: workspace.workspace_guid,
                                            children: [],
                                            index: document_index
                                        }
                                    );
                                    //document.workspaces.push(safeCopy(workspace));
                                    delegate.callback();
                                });

                            } else {
                                let extension = getExtension(relativePath);
                                if (extension === "bundle") {
                                    delegate.callback();
                                } else if (extension === "acb") {
                                    delegate.callback();
                                } else if (extension === "dict") {
                                    delegate.callback();
                                } else {
                                    let supported = ["png", "jpeg", "jpg", "svg"];
                                    if (supported.includes(extension)) {
                                        zipEntry.async('uint8array').then((content) => {
                                            let m = manifest.find((m) => { return m.file === relativePath;});
                                            let mInfo = getMimeFromExtension(extension);
                                            let resource = Object.assign({
                                                kind: "ISkeletResource",
                                                id: generateV4UUID(),
                                                title: "",
                                                stringData: "",
                                                mime: mInfo,
                                                compileOptions: {compile: false},
                                                includeInResources: true,
                                                last_modified: "",
                                                data: undefined
                                            } as ISkeletResource,m.meta.resource);

                                            let a = new Asset();
                                            a.id = resource.id;
                                            a.mime = mInfo;
                                            a.title = resource.title;
                                            a.data = content;
                                            resource.data = a;
                                            document.resources.push(resource);

                                            document_index += 1;
                                            resourceLeaf_Assets.children.push(
                                                {
                                                    id: resource.id,
                                                    children: [],
                                                    index: document_index
                                                }
                                            );

                                            delegate.callback();
                                        });
                                    } else {
                                        delegate.callback();
                                    }
                                }


                            }
                        });


                    }).catch( (errorPS) => {
                        delegate.reject("File not found: resources/project.settings");
                    })

                });
            }).catch((error) => {
                reject({message: "Wrong format."});
            });





        });
    }


}