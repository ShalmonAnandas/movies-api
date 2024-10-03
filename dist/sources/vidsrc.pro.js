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
import { debug, error, log, isJSON } from '../utils.js';
const HOST = 'vidsrc.pro';
const ALT_HOSTS = [HOST];
const ID = 'VSP';
const SCRAPE_CONFIG = {
    ID: ID,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36;',
    EXPECTED_KEYS: 0,
    INJECT_URLS: [],
    // input of encrypt function
    ENTRY: new RegExp(''),
    // output of encrypt function
    OUT: new RegExp(''),
    INIT_URL: `https://${HOST}/embed/movie/385687`,
    BTN_ID: "",
    MAX_TIMEOUT: 2500
};
const SERVERS = [];
const HEADERS = {
    Referer: `https://${HOST}`
};
function dec(inp) {
    return atob(inp.split("").reverse().join(""));
}
function episode(hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const servers = JSON.parse(dec(hash));
        const server = servers[0];
        const url = `https://vidsrc.pro/api/e/${server.hash}`;
        debug(ID, url);
        const resp = yield (yield fetch(url)).json();
        return { stream: resp.source, subtitles: resp.subtitles };
    });
}
function movie(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${HOST}/embed/movie/${id}`;
        const resp = (yield (yield fetch(url, { headers: HEADERS })).text()).replace(/ /g, '').replace(/\n/g, '');
        const config = JSON.parse((/window.vConfig=({.*?})<\/script>/g).exec(resp)[1]);
        debug(ID, config.hash);
        return yield episode(config.hash);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, s = 1, e = 1) {
        const url = `https://${HOST}/embed/tv/${id}/${s}/${e}`;
        const resp = (yield (yield fetch(url, { headers: HEADERS })).text()).replace(/ /g, '').replace(/\n/g, '');
        const config = JSON.parse((/window.vConfig=({.*?})<\/script>/g).exec(resp)[1]);
        debug(ID, config.hash);
        return yield episode(config.hash);
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tests = [movie("385687"), tv("tt0944947", 1, 1), tv("tt1190634", 1, 1)];
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
export const VidsrcPro = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, test, SCRAPE_CONFIG };
//# sourceMappingURL=vidsrc.pro.js.map