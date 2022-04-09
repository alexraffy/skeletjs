

export var documentProjectDEPREC = 1;

// MIGRATED
//
/*
function openfile_callback() {
    Session.instance.load_counter -= 1;
    if (Session.instance.load_counter <= 0) {
        // upgrade if necessary
        // load scripts
        if (isDefined(Session.instance.Scripts)) {
            for (let i = 0; i < Session.instance.Scripts.length; i += 1) {
                let s = Session.instance.Scripts[i];
                console.warn("Loading Script ", s);
                if (s.filename.endsWith('.js')) {
                    var js = s.data,
                        jstag = document.createElement('script');
                    jstag.type = 'text/javascript';
                    // jstag.appendChild(document.createTextNode(js));
                    Application.instance.elHead.appendChild(jstag);
                }
            }
        }
        Application.instance.notifyAll(this, "noticeCheckMissingDeps");
        upgradeProject();
        nextWorkspace();
        pushHistory(`Skelet document "${Session.instance.filename}" loaded`);

        electronRefreshWorkspaceMenu();



    }
}
 */

// MIGRATED
/*
function _upgradeNode(node: any, parentNode: Layer): Layer {

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
                SkLogger.write("Upgrade node key " + key + " not defined");
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
                    tp.dataSource = safeCopy(np.dataSource);
                }
                if (isDefined(np.symbol_id)) {
                    tp.symbol_id = np.symbol_id;
                }
                if (isDefined(np.symbol_node_id)) {
                    tp.symbol_node_id = np.symbol_node_id;
                }
                tp.value = safeCopy(np.value);
                target.properties.push(tp);
            }
        } else if (key === "bounds") {



        } else if (key === "anchors") {

        } else if (key === "states") {

        } else if (key === "symbol_properties") {


        }
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


    if (isDefined(node.subViews)) {
        for (let x = 0; x < node.subViews.length; x += 1) {
            let subTarget = _upgradeNode(node.subViews[x], l);
            if (subTarget) {
                l.adopt(subTarget);
            }
        }
    }
    return l;
}

 */


// MIGRATED
/*

function upgradeNodesLegacy(workspace: any) {
    let upgradedWorkspace = new Workspace();
    upgradedWorkspace.workspace_guid = workspace.workspace_guid;
    upgradedWorkspace.title = workspace.title;

    for (let i = 0; i < workspace.data.rows.length; i += 1) {
        let r = workspace.data.rows[i];
        if (!isDefined(r.special_id)) {
            if (r.title === "Views") {
                r.special_id = "workspace.views";

            }
            if (r.title === "ViewControllers") {
                r.special_id = "workspace.viewControllers";
            }
        }
        if (r.special_id === "workspace.views") {
            let viewGroup: Layer = Layer.create("Views", "group", undefined);
            viewGroup.data.special_id = "workspace.views";
            viewGroup.data.parent_id = "";
            viewGroup.data.isPage = false;
            upgradedWorkspace.viewContainer = viewGroup;

            for (let x = 0; x < r.subViews.length; x += 1) {
                upgradedWorkspace.viewContainer.adopt(_upgradeNode(r.subViews[x], undefined));

            }
        }

    }
    return upgradedWorkspace;
}
 */

// MIGRATED
/*

export function openProjectFileLegacy(filename: string, options: { React: any, ReactDOM: any, Babel: any, installedNPMPackages: {name: string, version: string}[]}) {
    "use strict";

    if (Logging.enableLogging === true) {
        SkLogger.write("Opening Skelet File: ", filename);
    }
    Session.instance.SymbolsCache = [];
    Session.instance.Scripts = [];
    if (Session.instance.isElectron === true) {
        const { remote } = require("electron");
        const path = require("path");
        const app = remote.app;
        let tempFolder = app.getPath('temp');
        const fs = require('fs');
        let zip = new JSZip();
        let data = fs.readFileSync(filename);
        Session.instance.load_counter = 0;
        zip.loadAsync(data).then(function (z) {
            z.file("project.json").async("string").then(function (content) {
                let meta = JSON.parse(content);
                let ps: ProjectSettings = Object.assign(new ProjectSettings(), meta);

                Session.instance.project_guid = meta.project_guid;
                Session.instance.currentTitle = meta.title;
                Session.instance.Scripts = meta.scripts;
                Session.instance.Assets = meta.assets;

                if (!isDefined(Session.instance.Scripts)) {
                    Session.instance.Scripts = [];
                }
                if (!isDefined(Session.instance.Assets)) {
                    Session.instance.Assets = [];
                }


                // check fonts
                let unknownFonts: string[] = [];
                if (isDefined(ps.info)) {
                    for (let i = 0; i < ps.info.fontsUsed.length; i += 1) {
                        let found = (Session.instance.Fonts.rows as any as FontInfo[]).find((f: FontInfo) => {
                            return f.postscriptName === ps.info.fontsUsed[i];
                        });
                        if (!isDefined(found)) {
                            unknownFonts.push(ps.info.fontsUsed[i]);
                        } else {
                            // load the font
                            loadTypeface(found);
                        }
                    }
                }

                Session.instance.unknownFonts = unknownFonts;

                // check plugins
                let unknownPlugins: {pluginID: string, pluginName: string, pluginVersion: string, versionRequired: string}[] = [];
                if (isDefined(ps.info)) {
                    for (let i = 0; i < ps.info.pluginsUsed.length; i += 1) {
                        let found = Session.instance.Plugins.find((p) => { return p.id === ps.info.pluginsUsed[i].pluginId});
                        if (found) {
                            if (found.version !== ps.info.pluginsUsed[i].pluginVersion) {
                                unknownPlugins.push({
                                    pluginID: found.id,
                                    pluginName: found.name,
                                    pluginVersion: found.version,
                                    versionRequired: ps.info.pluginsUsed[i].pluginVersion
                                });
                            }
                        } else {
                            unknownPlugins.push({
                                pluginID: ps.info.pluginsUsed[i].pluginId,
                                pluginName: ps.info.pluginsUsed[i].pluginName,
                                pluginVersion: ps.info.pluginsUsed[i].pluginVersion,
                                versionRequired: ""
                            });
                        }
                    }
                }
                Session.instance.unknownPlugins = unknownPlugins;




                if (isDefined(meta.version)) {
                    Session.instance.skelet_version = meta.version;
                } else {
                    Session.instance.skelet_version = 10;
                }


                z.forEach(function (relativePath, zipEntry) {
                    if (relativePath.startsWith('workspaces/') && relativePath.endsWith('.json')) {
                        if (Logging.enableLogging === true) {
                            SkLogger.write('loading ' + relativePath);
                        }
                        Session.instance.load_counter += 1;
                        zipEntry.async("text").then(function (content) {
                            let i = 0;
                            let workspace = upgradeNodesLegacy(safeRestore(content));
                            if (workspace.workspace_guid === undefined || workspace.workspace_guid === "") {
                                workspace.workspace_guid = generateV4UUID();
                            }
                            if (workspace.title === undefined || workspace.title === "") {
                                workspace.title = "Untitled workspace";
                            }


                            function recur_findSymbol(node: Layer, array) {
                                if (!isDefined(node)) {
                                    console.warn("node is not defined");
                                    return array;
                                }
                                if (!isDefined(node.className)) {
                                    console.warn("node className is not defined");
                                    console.dir(node);
                                    return array;
                                }

                                if (node.isSymbol === true) {
                                    array.push(node);
                                }
                                for (let i = 0; i < node.children.length; i += 1) {
                                    array = recur_findSymbol(node.children[i], array);
                                }
                                return array;
                            }
                            let array = [];
                            for (let i = 0; i < workspace.viewContainer.children.length; i += 1) {
                                array = recur_findSymbol(workspace.viewContainer.children[i], array);
                            }
                            Session.instance.SymbolsCache.push(...array);

                            Session.instance.Workspaces.workspaces.push(workspace);
                            if (Logging.enableLogging === true) {
                                SkLogger.write("Workspace " + workspace.workspace_guid);
                                console.dir(workspace);
                            }

                            openfile_callback();
                        });
                    }
                    if (relativePath.startsWith('assets/') && !relativePath.endsWith('assets/')) {
                        Session.instance.load_counter += 1;
                        zipEntry.async('uint8array').then(function (content) {
                            if (Logging.enableLogging === true) {
                                SkLogger.write('loading ' + relativePath);
                            }
                            Session.instance.load_counter += 1;
                            // save the file in temp
                            let filename = path.basename(relativePath);
                            let newPath = path.format({
                                dir: tempFolder,
                                base: filename
                            });
                            // find the asset id
                            let asset = findAssetWithPath(relativePath);
                            asset.currentPath = newPath;
                            fs.writeFileSync(newPath, content);
                            Session.instance.load_counter -= 1;
                            openfile_callback();
                        });
                    }
                    if (relativePath.startsWith('components/') && relativePath.endsWith('.json')) {
                        Session.instance.load_counter += 1;
                        zipEntry.async("text").then(function (content) {
                            try {
                                let json = JSON.parse(content);
                                let sc: SkeletComponent = Object.assign(new SkeletComponent(), json);
                                Session.instance.Components.push(sc);
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

                            } catch (e) {
                                console.warn(e.message);
                            }
                            openfile_callback();

                        })
                    }
                    if (relativePath.startsWith('scripts/') && relativePath.endsWith('.js')) {
                        //if (!isDefined(MentatJS.tempScripts)) {
                        //    MentatJS.tempScripts = [];
                        //}
                        Session.instance.load_counter += 1;
                        zipEntry.async("text").then(function (content) {
                            let filename_script = relativePath.substr( relativePath.indexOf('scripts/') + 8);
                            let script = Session.instance.Scripts.find((elem) => { return elem.filename === filename_script; });
                            script.data = content;
                            openfile_callback();
                        });
                    }
                    if (relativePath.startsWith('document.palette')) {
                        Session.instance.load_counter += 1;
                        zipEntry.async("text").then(function (content) {
                            Session.instance.documentPalette = deserializeColorBookInfo(content);
                            openfile_callback();
                        })

                    }
                });


            });

        }).catch((error) => {

            Session.instance.project_guid = generateV4UUID();
            Session.instance.currentTitle = "Untitled";
            Session.instance.Scripts = [];
            Session.instance.Assets = [];
            Session.instance.skelet_version = 10;
            let workspace = newWorkspace("Untitled");
            Session.instance.Workspaces.workspaces.push(workspace);
            Session.instance.load_counter -= 1;
            openfile_callback();

            window.alert('An error occured loading the skelet file.');
        });
    }
}
*/


// TODO MIGRATE
/*
export function saveProjectFile(filename: string, silent: boolean) {
    let isSilent = false;
    if (!isDefined(silent)) {
        isSilent = false;
    } else {
        isSilent = silent;
    }
    if (Session.instance.isElectron === true) {
        let project_settings = new ProjectSettings();
        project_settings.project_guid = Session.instance.Workspaces.project_guid;
        project_settings.title = Session.instance.Workspaces.title;
        project_settings.scripts = [];
        project_settings.assets = [];
        project_settings.components = [];

        // write scripts info
        for (let i = 0; i < Session.instance.Scripts.length; i += 1) {
            let s = Session.instance.Scripts[i];
            project_settings.scripts.push({
                id: s.id,
                filename: s.filename,
                isNPMDep: false,
                npmName: '',
                npmVersion: ''
            });
        }

        // write components info
        for (let i = 0; i < Session.instance.Components.length; i += 1) {
            let c = Session.instance.Components[i];
            project_settings.components.push({
                id: c.id,
                title: c.componentName,
                filename: path.normalize('components/' + c.id + ".json")
            });
        }

        let allInfo: {
            pluginsUsed: {pluginId: string, pluginName: string, pluginVersion: string}[];
            controlsCount: number;
            fontsUsed: string[];
        } = {
            pluginsUsed: [],
            controlsCount: 0,
            fontsUsed: []
        };

        // extract all info controls used
        function recurFindControls(base: Layer) {
            let sk: SkeletControl = findControlForClassName(base.className);
            if (sk) {
                let exists = allInfo.pluginsUsed.find((elem) => {
                    return elem.pluginId === sk.pluginGuid
                });
                if (!exists) {
                    let findPlugin = Session.instance.Plugins.find((elem) => {
                        return elem.id === sk.pluginGuid;
                    });
                    if (findPlugin) {
                        allInfo.pluginsUsed.push({
                            pluginId: findPlugin.id,
                            pluginName: findPlugin.name,
                            pluginVersion: findPlugin.version
                        });
                    }
                }
            }
            allInfo.controlsCount += 1;

            let textStyleProperty = base.property("label.textStyle");
            if (textStyleProperty) {
                let font = (<PropertyTextStyle>textStyleProperty.value).weight;
                let exists = allInfo.fontsUsed.find((elem) => { return elem === font});
                if (!exists) {
                    allInfo.fontsUsed.push(font);
                }
            }
            for (let i = 0; i < base.children.length; i += 1) {
                recurFindControls(base.children[i]);
            }
        }
        for (let i = 0; i < Session.instance.Workspaces.workspaces.length; i += 1) {
            let wArray = Session.instance.Workspaces.workspaces[i].viewContainer.children;
            for (let x = 0; x < wArray.length; x += 1) {
                recurFindControls(wArray[x]);
            }
        }
        project_settings.info = allInfo;
        project_settings.assets = Session.instance.Assets;


        let zip = new JSZip();
        zip.file('project.json', JSON.stringify(project_settings));

        // save the scripts
        for (let i = 0; i < Session.instance.Scripts.length; i += 1) {
            let s = Session.instance.Scripts[i];

            zip.file('scripts/' + s.filename, s.data);
        }

        // save the components
        for (let i = 0; i < Session.instance.Components.length; i += 1) {
            let c = Session.instance.Components[i];
            zip.file('components/' + c.id + ".json", JSON.stringify(c));
        }

        // save the document palette
        if (isDefined(Session.instance.documentPalette)) {
            zip.file("document.palette", serializeColorBookInfo(Session.instance.documentPalette));
        }



        // save the workspaces data
        for (let i = 0; i < Session.instance.Workspaces.workspaces.length; i++) {
            let workspace = {
                workspace_guid: Session.instance.Workspaces.workspaces[i].workspace_guid,
                title: Session.instance.Workspaces.workspaces[i].title,
            };
            if (workspace.workspace_guid === "") {
                workspace.workspace_guid = generateV4UUID();
                Session.instance.Workspaces.workspaces[i].workspace_guid = workspace.workspace_guid;
            }

            let workspace_zipName = workspace.workspace_guid + ".db";
            let workspace_zipPath = 'workspaces/' + workspace_zipName;
            let tempPath = app.getPath('temp');
            let workspace_tempFile = path.normalize(tempPath + "/" + workspace_zipName);

            // sqlite rows
            var sqlite3 = require('sqlite3').verbose();
            var db = new sqlite3.Database(workspace_tempFile);

            db.serialize(function() {
                db.run("CREATE TABLE info (workspace_guid TEXT, name TEXT)");
                var stmt = db.prepare("INSERT INTO info VALUES (?,?)");
                stmt.run(workspace.workspace_guid, workspace.title);
                stmt.finalize();

                db.run("CREATE TABLE views (layer_id TEXT, parent_id: TEXT, json TEXT)");

                function writeRecur(db, layer: Layer) {
                    var stmt = db.prepare("INSERT INTO views VALUES (?,?,?)");
                    stmt.run(layer.id, layer.data.parent_id, safeStore(layer.data));
                    stmt.finalize();
                    for (let i = 0; i < layer.children.length; i += 1) {
                        writeRecur(db, layer.children[i]);
                    }
                }
                for (let x = 0; x < Session.instance.Workspaces.workspaces[i].viewContainer.children.length; x += 1 ) {
                    writeRecur(db, Session.instance.Workspaces.workspaces[i].viewContainer.children[x])
                }

            });

            db.close();
            let dbData = fs.readFileSync(workspace_tempFile);

            zip.file(workspace_zipPath, dbData);
        }
        // save the assets
        function writeasset_recur(asset: Asset, zip, fs) {
            let data = fs.readFileSync(asset.currentPath);
            zip.file(asset.path, data);
            if (isDefined(asset.children)) {
                for (let i = 0; i < asset.children.length; i += 1) {
                    writeasset_recur(asset.children[i], zip, fs);
                }
            }
        }

        for (let i = 0; i < Session.instance.Assets.length; i += 1) {
            let a = Session.instance.Assets[i];
            writeasset_recur(a, zip, fs);
        }

        zip.generateAsync({type: "uint8array"})
            .then(function (content) {
                // see FileSaver.js
                require('fs').writeFileSync(filename, content);
            }).catch(function (error) {
            console.warn('Could not save file. Try saving under a different name.');
        });
    }
}

*/


// TODO MIGRATE
/*
export function saveProjectFileLegacy(filename: string, silent: boolean) {
    let isSilent = false;
    if (!isDefined(silent)) {
        isSilent = false;
    } else {
        isSilent = silent;
    }
    if (Session.instance.isElectron === true) {

        let zipData = null;

        const { remote, ipcRenderer } = require("electron");
        const fs = require('fs');


        // if (isSilent === false) {
        //     // take a snapshot of the canvas
        //     let tb64 = '';
        //     let canvasView = Session.instance.canvasViewRef;
        //     if (canvasView) {
        //         let w = 0;
        //         let h = 0;
        //         for (let i = 0; i < Session.instance.CurrentWorkspace.data.rows[0].subViews.length; i += 1) {
        //             let n = Session.instance.CurrentWorkspace.data.rows[0].subViews[i];
        //             if (n) {
        //                 let b = calculateBounds(n, "");
        //
        //                 if (w < NUConvertToPoint(n.bounds.x).amount + NUConvertToPoint(n.bounds.width).amount) {
        //                     w = NUConvertToPoint(n.bounds.x).amount + NUConvertToPoint(n.bounds.width).amount;
        //                 }
        //                 if (h < NUConvertToPoint(n.bounds.y).amount + NUConvertToPoint(n.bounds.height).amount) {
        //                     h = NUConvertToPoint(n.bounds.y).amount + NUConvertToPoint(n.bounds.height).amount;
        //                 }
        //             }
        //         }
        //         if ((w > NUConvertToPoint(canvasView.bounds.width).amount) || (w === 0)) {
        //             w = NUConvertToPoint(canvasView.bounds.width).amount;
        //         }
        //         if ((h > NUConvertToPoint(canvasView.bounds.height).amount) || (h === 0)) {
        //             h = NUConvertToPoint(canvasView.bounds.height).amount;
        //         }
        //
        //         html2canvas(canvasView.getDiv(), {width: w, height: h}).then(canvas => {
        //             var resizedCanvas = document.createElement("canvas");
        //             var resizedContext = resizedCanvas.getContext("2d");
        //             resizedCanvas.height = 128;
        //             resizedCanvas.width = 128;
        //             resizedContext.drawImage(canvas, 0, 0, 128, 128);
        //             let tb64 = resizedCanvas.toDataURL();
        //             ipcRenderer.send('welcome.recents.add', {filename: filename, thumbnailB64: tb64});
        //         });
        //
        //
        //     }
        // }


        let project_settings = new ProjectSettings();
        project_settings.project_guid = Session.instance.Workspaces.project_guid;
        project_settings.title = Session.instance.Workspaces.title;
        project_settings.scripts = [];
        project_settings.assets = [];
        project_settings.components = [];

        // write scripts info
        for (let i = 0; i < Session.instance.Scripts.length; i += 1) {
            let s = Session.instance.Scripts[i];
            project_settings.scripts.push({
                id: s.id,
                filename: s.filename,
                isNPMDep: false,
                npmName: '',
                npmVersion: ''
            });
        }

        // write components info
        for (let i = 0; i < Session.instance.Components.length; i += 1) {
            let c = Session.instance.Components[i];
            project_settings.components.push({
                id: c.id,
                title: c.componentName,
                filename: path.normalize('components/' + c.id + ".json")
            });
        }

        let allInfo: {
            pluginsUsed: {pluginId: string, pluginName: string, pluginVersion: string}[];
            controlsCount: number;
            fontsUsed: string[];
        } = {
            pluginsUsed: [],
            controlsCount: 0,
            fontsUsed: []
        };

        // extract all info controls used
        function recurFindControls(base: Layer) {
            let sk: SkeletControl = findControlForClassName(base.className);
            if (sk) {
                let exists = allInfo.pluginsUsed.find((elem) => {
                    return elem.pluginId === sk.pluginGuid
                });
                if (!exists) {
                    let findPlugin = Session.instance.Plugins.find((elem) => {
                        return elem.id === sk.pluginGuid;
                    });
                    if (findPlugin) {
                        allInfo.pluginsUsed.push({
                            pluginId: findPlugin.id,
                            pluginName: findPlugin.name,
                            pluginVersion: findPlugin.version
                        });
                    }
                }
            }
            allInfo.controlsCount += 1;

            let textStyleProperty = base.property("label.textStyle");
            if (textStyleProperty) {
                let font = (<PropertyTextStyle>textStyleProperty.value).weight;
                let exists = allInfo.fontsUsed.find((elem) => { return elem === font});
                if (!exists) {
                    allInfo.fontsUsed.push(font);
                }
            }
        //    for (let i = 0; i < base.subViews.length; i += 1) {
        //        recurFindControls(base.subViews[i]);
        //    }
        }
        //for (let i = 0; i < Session.instance.Workspaces.workspaces.length; i += 1) {
        //    let wArray = Session.instance.Workspaces.workspaces[i].data.rows[0].subViews;
        //    for (let x = 0; x < wArray.length; x += 1) {
        //        recurFindControls(wArray[x]);
        //    }
       // }
        project_settings.info = allInfo;
        project_settings.assets = Session.instance.Assets;


        let zip = new JSZip();
        zip.file('project.json', JSON.stringify(project_settings));

        // save the scripts
        for (let i = 0; i < Session.instance.Scripts.length; i += 1) {
            let s = Session.instance.Scripts[i];

            zip.file('scripts/' + s.filename, s.data);
        }

        // save the components
        for (let i = 0; i < Session.instance.Components.length; i += 1) {
            let c = Session.instance.Components[i];
            zip.file('components/' + c.id + ".json", JSON.stringify(c));
        }

        // save the document palette
        if (isDefined(Session.instance.documentPalette)) {
            zip.file("document.palette", serializeColorBookInfo(Session.instance.documentPalette));
        }



        // save the workspaces data
        for (let i = 0; i < Session.instance.Workspaces.workspaces.length; i++) {
            let workspace = {
                workspace_guid: Session.instance.Workspaces.workspaces[i].workspace_guid,
                title: Session.instance.Workspaces.workspaces[i].title,
                //data: Session.instance.Workspaces.workspaces[i].data
            };


            if (workspace.workspace_guid === "") {
                workspace.workspace_guid = generateV4UUID();
                Session.instance.Workspaces.workspaces[i].workspace_guid = workspace.workspace_guid;
            }


            let workspace_string = safeStore(workspace);
            zip.file('workspaces/' + workspace.workspace_guid + ".json", workspace_string);
        }
        // save the assets
        function writeasset_recur(asset: Asset, zip, fs) {
            let data = fs.readFileSync(asset.currentPath);
            zip.file(asset.path, data);
            if (isDefined(asset.children)) {
                for (let i = 0; i < asset.children.length; i += 1) {
                    writeasset_recur(asset.children[i], zip, fs);
                }
            }
        }

        for (let i = 0; i < Session.instance.Assets.length; i += 1) {
            let a = Session.instance.Assets[i];
            writeasset_recur(a, zip, fs);
        }

        zip.generateAsync({type: "uint8array"})
            .then(function (content) {
                // see FileSaver.js
                require('fs').writeFileSync(filename, content);
            }).catch(function (error) {
            console.warn('Could not save file. Try saving under a different name.');
        });

    }
}

 */
