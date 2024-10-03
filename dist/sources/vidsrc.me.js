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
import { webcrack } from 'webcrack';
import vm from 'node:vm';
import { isJSON, log, error, debug, NO_STREAM_ERROR } from '../utils.js';
const HOST = 'vidsrc.xyz';
const ALT_HOSTS = [HOST, 'vidsrc.me', 'vidsrc.net'];
const SERVERS = [];
const ID = "VDM";
const REFERER = `http://${HOST}`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
let js_context = vm.createContext(globalThis);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function fetchReferer(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, args = { headers: {} }) {
        if (args.headers == undefined)
            args.headers = {};
        if (args.headers['Referer'] == undefined && args.headers['Referer'] != "")
            args.headers['Referer'] = REFERER;
        args.headers['User-Agent'] = USER_AGENT;
        return fetch(url, args);
    });
}
function episode(data_id, _server) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${HOST}/embed/${data_id}`;
        debug(ID, url);
        const res = yield (yield fetchReferer(url)).text();
        let script = "";
        let enc_url = "";
        let script_id = "";
        for (let i = 0; i < 10; i++) {
            try {
                const url2 = 'https:' + (/id="player_iframe" src="(.*?)"/gm).exec(res)[1].trim();
                const res2 = yield (yield fetchReferer(url2)).text();
                const host = (new URL(url2)).host;
                const srcrcpLink = /src:\s*'(.*?)'/gm.exec(res2)[1];
                const url3 = `https://${host}${srcrcpLink}`;
                // sometimes it returns 404
                const res3 = yield (yield fetch(url3)).text();
                enc_url = (/<div id=".*?" style="display:none;">(.*?)<\/div>/gm).exec(res3)[1];
                const script_url = `https://${host}` + (/<script src="(.{20,}\.js\?_=.*?)"/gm).exec(res3)[1];
                const res_script = yield fetchReferer(script_url);
                debug(ID, `${data_id} -> ${res_script.status.toString()}`);
                if (res_script.status != 200) {
                    yield sleep(1000);
                    continue;
                }
                script = yield (res_script).text();
                script_id = /window\[bMGyx71TzQLfdonN\(["'](.*?)["'].*innerHTML\);$/gm.exec(script)[1];
                const new_script = (yield webcrack(script, { mangle: false })).code;
                try {
                    vm.runInContext(new_script, js_context);
                }
                catch (e) {
                }
                break;
            }
            catch (_a) {
            }
        }
        if (script == "")
            throw NO_STREAM_ERROR;
        const dec_url = vm.runInContext(`${script_id}('${enc_url}')`, js_context);
        debug(ID, dec_url);
        return { stream: dec_url };
    });
}
;
function movie(id, _server) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(ID, id);
        return episode(id, _server);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, s = 1, e = 1, _server) {
        debug(ID, id);
        return episode(`${id}/${s}-${e}`, _server);
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tests = [movie("tt1300854"), tv('tt1312171', 1, 1)];
            const results = yield Promise.all(tests);
            for (const r of results) {
                if (!isJSON(r))
                    throw `${JSON.stringify(r)} is not json`;
                debug(ID, JSON.stringify(r));
            }
            log(ID, `${HOST} passed the tests`);
            return `${HOST} passed the tests`;
        }
        catch (e) {
            error(ID, `${HOST} failed the tests`, e);
            return `${HOST} failed the tests`;
        }
    });
}
export const VidsrcMe = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, test };
//# sourceMappingURL=vidsrc.me.js.map