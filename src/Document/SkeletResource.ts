
import {instanceOfISkeletResource} from "../Guards/instanceOfISkeletResource";
import {ISkeletResource} from "./ISkeletResource";
import {IDatabase} from "../Loader/Databases/IDatabase";
import {assert, DictionaryLocalizedString, IDictionaryLocalizedString, safeCopy} from "mentatjs";
import {ColorBookInfo} from "../Loader/ColorPalette/ColorBookInfo";
import {WorkspaceData} from "./WorkspaceData";
import {ISkeletScriptBundle} from "./ISkeletScriptBundle";
import {Workspace} from "./Workspace";
import {ProjectSettings} from "./ProjectSettings";
import {Asset} from "./Asset";
import {SkeletComponent} from "../Plugin/SkeletComponent";


export class SkeletResource {
    private struct: ISkeletResource;
    private _data: Workspace | ColorBookInfo | DictionaryLocalizedString | Asset | SkeletComponent | ISkeletScriptBundle | ProjectSettings | IDatabase;

    static fromStruct(struct: ISkeletResource): SkeletResource {
        assert(instanceOfISkeletResource(struct), "Static SkeletResource.fromStruct expects a ISkeletResource as parameter.");
        let c = new SkeletResource();
        c.struct = safeCopy(struct);
        if (c.mime === "skelet/workspace") {
            c._data = new Workspace(struct.data as WorkspaceData);
        } else if (c.mime === "skelet/colorbookinfo") {
            c._data = c.struct.data as ColorBookInfo;
        } else if (c.mime === "skelet/dictionarylocalizedstring") {
            c._data = DictionaryLocalizedString.fromStruct(c.struct.data as IDictionaryLocalizedString);
        } else if (c.mime === "skelet/scriptbundle") {
            c._data = c.struct.data as ISkeletScriptBundle;
        } else if (c.mime === "skelet/projectsettings") {
            c._data = c.struct.data as ProjectSettings;
        } else if (c.mime === "skelet/deps") {
            c._data = undefined;
        } else if (c.mime === "skelet/group") {
            c._data = undefined;
        } else if (c.mime === "skelet/datasource") {
            c._data = c.struct.data as IDatabase;
        }  else {
            c._data = c.struct.data as Asset;
            //console.dir(struct);
            //throw "Unknown resource " + struct.mime;
        }
        return c;
    }

    get id(): string {
        return this.struct.id;
    }
    get title(): string {
        return this.struct.title;
    }
    set title(value: string) {
        assert(value !== undefined, "SkeletResource.title expects a string value.");
        this.struct.title = value;
    }
    get mime(): string {
        return this.struct.mime;
    }

    get data(): Workspace | ColorBookInfo | DictionaryLocalizedString | Asset | SkeletComponent | ISkeletScriptBundle | ProjectSettings | IDatabase {
        return this._data;
    }

    toJSON(): ISkeletResource {
        return safeCopy(this.struct);
    }

    defToJSON(): ISkeletResource {
        return JSON.parse(JSON.stringify(safeCopy(this.struct), function (key, value) {
            if (key === "data") {
                return undefined;
            }
            return value;
        }));
    }

}

