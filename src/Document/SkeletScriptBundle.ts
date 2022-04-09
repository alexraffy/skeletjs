import {instanceOfISkeletScript} from "../Guards/instanceOfISkeletScript";
import {instanceOfSkeletScript} from "../Guards/instanceOfSkeletScript";
import {ISkeletScriptBundle} from "./ISkeletScriptBundle";
import {instanceOfISkeletScriptBundle} from "../Guards/instanceOfISkeletScriptBundle";
import {assert, isDefined, safeCopy} from "mentatjs";
import {SkeletScript} from "./SkeletScript";
import {ISkeletScript} from "./ISkeletScript";


export class SkeletScriptBundle {
    private _data: ISkeletScriptBundle;
    constructor(struct: ISkeletScriptBundle) {
        assert(instanceOfISkeletScriptBundle(struct), "SkeletScriptBundle constructor expects a ISkeletScriptBundle as parameter.");
        this._data = struct;
    }
    static fromStruct(struct: ISkeletScriptBundle): SkeletScriptBundle {
        let n = new SkeletScriptBundle(struct);
        return n;
    }
    get id(): string {
        return this._data.id;
    }
    get title(): string {
        return this._data.title;
    }


    scripts(): SkeletScript[] {
        let ret = [];
        let scripts = this._data.scripts;
        for (let i = 0; i < scripts.length; i += 1) {
            ret.push(SkeletScript.fromStruct(scripts[i]));
        }
        return ret;
    }

    getScriptWithId(id: string): SkeletScript | undefined {
        assert(isDefined(id), "SkeletScriptBundle.getScriptWithId expects a string as parameter.");
        for (let i = 0; i < this._data.scripts.length; i += 1) {
            if (this._data.scripts[i].id === id) {
                return SkeletScript.fromStruct(this._data.scripts[i]);
            }
        }
        return undefined;
    }

    addScript(s: ISkeletScript) {
        assert(instanceOfISkeletScript(s), "SkeletScriptBundle.addScript expects a ISkeletScript as parameter.");
        this._data.scripts.push(safeCopy(s));
    }

    updateScript(script: SkeletScript) {
        assert(instanceOfSkeletScript(script), "SkeletScriptBundle.updateScript expects a SkeletScript as parameter.");
        for (let i = 0; i < this._data.scripts.length; i += 1) {
            if (this._data.scripts[i].id === script.id) {
                this._data.scripts[i] = script.toJSON();
            }
        }
    }

    toJSON(): ISkeletScriptBundle {
        return safeCopy(this._data);
    }

}
