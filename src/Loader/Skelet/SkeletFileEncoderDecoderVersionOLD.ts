

import {ISkeletFileEncoderDecoder} from "./ISkeletFileEncoderDecoder";
import {generateV4UUID, isDefined, Logging, safeCopy, stringToLocalizedString} from "mentatjs";
import {upgradeDocument} from "./upgradeDocument";
import {deserializeColorBookInfo} from "../ColorPalette/deserializeColorBookInfo";
import {getEnvironment} from "../../Environment/getEnvironment";
import {ProjectSettings} from "../../Document/ProjectSettings";
import {safeRestore} from "../../Utils/safeRestore";
import {ISkeletDocument} from "../../Document/ISkeletDocument";
import {ISkeletResource} from "../../Document/ISkeletResource";
import {upgradeNodesLegacy} from "./upgradeNodesLegacy";
import {SkeletDocument} from "../../Document/SkeletDocument";
import {FontInfo} from "../Font/FontInfo";
import {findAssetWithPath} from "../../Document/findAssetWithPath";
import * as JSZip from "jszip";
import {Asset} from "../../Document/Asset";
import {SkeletComponent} from "../../Plugin/SkeletComponent";


export class SkeletFileEncoderDecoderVersionOLD implements ISkeletFileEncoderDecoder {

    private m_updateFunc: (value: number)=>void;

    constructor(updateFunction:(value: number)=>void) {
        this.m_updateFunc = updateFunction;
    }

    version: string = "OLD";
    encoder(document: SkeletDocument): Promise<Uint8Array> {
        return new Promise( function (resolve, reject) {
            reject({message: "File format not supported"})
        });
    }
    decoder(fileData: Uint8Array): Promise<ISkeletDocument> {
        return new Promise((resolve, reject) => {
            let environment = getEnvironment();
            let zip = new JSZip();
            let counter: number = 0;
            let document: ISkeletDocument = {
                kind: "ISkeletDocument",
                version: "OLD",
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
                document: document,
                callback: function () {
                    this.counter --;
                    if (this.counter <=0) {
                        this.document = upgradeDocument(this.document);
                        this.resolve(safeCopy(this.document));
                    }
                }
            }

            zip.loadAsync(fileData).then( (z) => {
                z.file("project.json").async("string").then((content) => {
                    let meta = JSON.parse(content);
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

                    if (!isDefined(ps.targets)) {
                        ps.targets = [];

                    }



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
                    // project settings
                    let projectSettings: ISkeletResource = {
                        kind: "ISkeletResource",
                        id: generateV4UUID(),
                        mime: "skelet/projectsettings",
                        title: "Project Settings",
                        compileOptions: {
                            compile: false
                        },
                        includeInResources: false,
                        stringData: "",
                        last_modified: (+ new Date()).toString(),
                        data: undefined
                    };
                    document.resources.push(projectSettings);
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
                        console.log(relativePath);
                        if (relativePath.startsWith('workspaces/') && relativePath.endsWith('.json')) {
                            delegate.counter++;
                        }
                        if (relativePath.startsWith('assets/') && !relativePath.endsWith('assets/')) {
                            delegate.counter++;
                        }
                        if (relativePath.startsWith('components/') && relativePath.endsWith('.json')) {
                            delegate.counter++;
                        }
                        if (relativePath.startsWith('scripts/') && relativePath.endsWith('.js')) {
                            delegate.counter++;
                        }
                        if (relativePath.startsWith('document.palette')) {
                            delegate.counter++;
                        }
                    });
                    z.forEach((relativePath, zipEntry) => {

                        if (relativePath.startsWith('workspaces/') && relativePath.endsWith('.json')) {
                            zipEntry.async("text").then((content) => {
                                let i = 0;
                                let workspace = upgradeNodesLegacy(safeRestore(content));
                                if (workspace.workspace_guid === undefined || workspace.workspace_guid === "") {
                                    workspace.workspace_guid = generateV4UUID();
                                }
                                if (workspace.title === undefined || workspace.title === "") {
                                    workspace.title = "Untitled workspace";
                                }
                                let sr: ISkeletResource = {
                                    kind: "ISkeletResource",
                                    id: workspace.workspace_guid,
                                    title: workspace.title,
                                    last_modified: (+ new Date()).toString(),
                                    stringData: "",
                                    includeInResources: false,
                                    compileOptions: {
                                        compile: false
                                    },
                                    mime: "skelet/workspace",
                                    data: workspace
                                };
                                document.resources.push(sr);
                                document_index += 1;

                                //document.workspaces.push(safeCopy(workspace));
                                delegate.callback();
                            });

                        }
                        if (relativePath.startsWith('assets/') && !relativePath.endsWith('assets/')) {
                            zipEntry.async('uint8array').then((content) => {
                                if (Logging.enableLogging === true) {
                                    Logging.log('loading ' + relativePath);
                                }
                                let a: Asset = new Asset();


                                // save the file in temp
                                //let filename = path.basename(relativePath);
                                //let newPath = path.format({
                                //    dir: tempFolder,
                                //    base: filename
                                //});
                                // find the asset id
                                let asset: Asset = safeCopy(findAssetWithPath(ps, relativePath));
                                let contentString = content.toString();
                                asset.data = Buffer.alloc(contentString.length, contentString);



                                let sr: ISkeletResource = {
                                    kind: "ISkeletResource",
                                    id: asset.id,
                                    title: asset.title,
                                    last_modified: (+ new Date()).toString(),
                                    stringData: "",
                                    includeInResources: false,
                                    compileOptions: {
                                        compile: false
                                    },
                                    mime: asset.mime,
                                    data: asset
                                };
                                document.resources.push(sr);
                                document_index += 1;


                                //asset.currentPath = newPath;
                                //fs.writeFileSync(newPath, content);

                                delegate.callback();
                            });

                        }
                        if (relativePath.startsWith('components/') && relativePath.endsWith('.json')) {
                            zipEntry.async("text").then((content) => {
                                try {
                                    let json = JSON.parse(content);
                                    let sc: SkeletComponent = Object.assign(new SkeletComponent(), json);
                                    environment.Components.push(sc);

                                    let sr: ISkeletResource = {
                                        kind: "ISkeletResource",
                                        id: sc.id,
                                        title: sc.componentName,
                                        last_modified: (+ new Date()).toString(),
                                        stringData: "",
                                        includeInResources: false,
                                        compileOptions: {
                                            compile: false
                                        },
                                        mime: "skelet/component",
                                        data: sc
                                    };
                                    document.resources.push(sr);
                                    document_index += 1;


                                    /*

                                    // do we have all the deps ?
                                    for (let depIndex= 0; depIndex < sc.deps.length; depIndex += 1) {
                                        let foundDep = options.installedNPMPackages.find((elem) => { return elem.name === sc.deps[depIndex];});
                                        if (!isDefined(foundDep)) {
                                            Session.instance.unknownDeps.push({name: sc.deps[depIndex], versionRequired: "latest"});
                                        }
                                    }

                                    let sk: SkeletControl = generateControlFromComponent(sc, sc.componentName, sc.componentName, { isReact: (sc.selectedFramework === "JSX"), React: options.React, ReactDOM: options.ReactDOM, Babel: options.Babel});

                                    let ccg = Session.instance.Controls.find((cg) => {
                                        return cg.group === "Symbols & Custom Components";
                                    });
                                    if (!ccg) {
                                        ccg = {group: "Symbols & Custom Components", controls: []};
                                        Session.instance.Controls = [ccg, ...Session.instance.Controls];

                                    }
                                    ccg.controls.push(sk);

                                     */

                                } catch (e) {
                                    console.warn(e.message);
                                }
                                delegate.callback();
                            });

                        }
                        if (relativePath.startsWith('scripts/') && relativePath.endsWith('.js')) {
                            delegate.callback();
                        }
                        if (relativePath.startsWith('document.palette')) {
                            zipEntry.async("text").then((content) => {
                                let cbi = deserializeColorBookInfo(content);
                                cbi.id = "document.palette";
                                let res: ISkeletResource = {
                                    kind: "ISkeletResource",
                                    id: "document.palette",
                                    mime: "skelet/colorbookinfo",
                                    title: "Document Swatch",
                                    compileOptions: {
                                        compile: false
                                    },
                                    includeInResources: false,
                                    data: cbi,
                                    stringData: "",
                                    last_modified: ""
                                }
                                document.resources.push(res);
                                delegate.callback();
                            })
                        }
                    });





                }).catch((error) => {
                    reject({message: "Archive does not contains file project.json. Wrong format."});
                });

            }).catch((error) => {
                reject({message: "Wrong format."});
            });
        });
    }

}