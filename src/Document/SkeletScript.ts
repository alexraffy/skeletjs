import {instanceOfISkeletScript} from "../Guards/instanceOfISkeletScript";
import {ISkeletScript} from "./ISkeletScript";
import {assert, isDefined, safeCopy} from "mentatjs";

import {IFunction} from "../Compiler/IFunction";
import {instanceOfIFunction} from "../Guards/instance_of_i_function";
import {kFunctionType} from "../Compiler/kFunctionType";
import {kTargetKind} from "../Compiler/kTargetKind";


export class SkeletScript {
    private _data: ISkeletScript;
    constructor(struct: ISkeletScript) {
        assert(instanceOfISkeletScript(struct), "SkeletScript constructor expects a ISkeletScript as parameter.");
        this._data = struct;
    }
    static fromStruct(struct: ISkeletScript) {
        return new SkeletScript(struct);
    }
    toJSON(): ISkeletScript {
        return safeCopy(this._data);
    }
    get id(): string {
        return this._data.id;
    }
    get targetKind(): kTargetKind {
        return this._data.targetKind
    }
    get title(): string {
        return this._data.title;
    }
    set title(value: string) {
        assert(isDefined(value) && typeof value === "string", "SkeletScript.title expects a string");
        this._data.title = value;
    }

    get type(): "class" | "text" {
        return this._data.type;
    }
    get classInherits(): string {
        return this._data.classInfo?.doInherits;
    }
    get classImplements(): string[] {
        return this._data.classInfo?.doImplements;
    }

    get functions(): IFunction[] {
        return safeCopy(this._data.functions);
    }
    addFunction(fn: IFunction) {
        assert(instanceOfIFunction(fn), "SkeletScript.addFunction expects a IFunction as parameter.");
        this._data.functions.push(safeCopy(fn));
    }
    removeFunction(id: string) {
        assert(isDefined(id) && id !== "", "SkeletScript.removeFunction expects a string as parameter.");
        let idx = -1;
        for (let i = 0; i < this._data.functions.length; i += 1) {
            if (this._data.functions[i].id) {
                idx = i;
            }
        }
        if (idx > -1) {
            this._data.functions.splice(idx, 1);
        }
    }
    updateFunction(fn: IFunction) {
        assert(instanceOfIFunction(fn), "SkeletScript.updateFunction expects a IFunction as parameter.");
        for (let i = 0; i < this._data.functions.length; i += 1) {
            if (this._data.functions[i].id === fn.id) {
                this._data.functions[i] = safeCopy(fn);
            }
        }
    }
    findFunctionWithType(type: kFunctionType) {
        return this._data.functions.find((t) => { return t.action_type === type;});
    }
    findFunctionWithId(id: string): IFunction {
        assert(isDefined(id), "SkeletScript.findFunctionWithId expects a string as parameter.");
        let found = this.functions.find((f) => { return f.id === id;});
        if (isDefined(found)) {
            return found;
        }
        return undefined;
    }
}