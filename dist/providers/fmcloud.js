var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from 'node-fetch';
const ALT_HOSTS = [];
function stream(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = (yield (yield fetch(url)).text());
        const reg = new RegExp(/<script.*?>(.*?)<\/script>/gm);
        let script = reg.exec(resp.match(reg).at(-1))[1];
        script = eval(script.replace('eval', ''));
        const sources = "{" + (/videop.setup\(\{(.*?)\}\);/gm).exec(script)[1] + "}";
        const data = eval(`let s = ${sources}; s`);
        return data;
    });
}
export const FMCloud = { stream, ALT_HOSTS };
//# sourceMappingURL=fmcloud.js.map