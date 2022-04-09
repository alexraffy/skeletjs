import {SkeletControl} from "./SkeletControl";
import {getEnvironment} from "../Environment/getEnvironment";
import {SkeletEnvironment} from "../Environment/SkeletEnvironment";


export function findControlForClassName(className: string) : SkeletControl | undefined {
    let sk: SkeletControl;
    let env: SkeletEnvironment = getEnvironment();
    for (let i = 0; i < env.Controls.length; i += 1) {
        for (let x = 0; x < env.Controls[i].controls.length; x += 1) {
            if (env.Controls[i].controls[x].className === className) {
                return env.Controls[i].controls[x];
            }
        }
    }
    return undefined;
}
