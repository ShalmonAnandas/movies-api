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
import { mapp, reverse, rc4, subst, subst_, debug, get_keys, error, log, isJSON, get_encrypt_order, enc_with_order, dec_with_order } from '../utils.js';
import { F2Cloud } from '../providers/f2cloud.js';
const HOST = 'vidsrc2.to';
const ALT_HOSTS = [HOST];
const ID = 'VS';
const SCRAPE_CONFIG = {
    ID: ID,
    // PlayStation bypasses dev tools detection
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36; PlayStation',
    EXPECTED_KEYS: 19,
    INJECT_URLS: [
        "all.js",
        "embed.js",
        "web.js"
    ],
    // input of encrypt function
    ENTRY: new RegExp(`https://.*?/ajax/embed/episode/(.*?)/sources\\?.*`.replace(/\//g, '/')),
    // output of encrypt function
    OUT: new RegExp(`https://.*?/ajax/embed/episode/.*?/sources\\?.*token=(.*?)$`.replace(/\//g, '/')),
    INIT_URL: `https://${HOST}/embed/movie/385687`,
    BTN_ID: "#btn-play",
    MAX_TIMEOUT: 2500
};
const SERVERS = [];
function enc(inp) {
    const keys = get_keys(ALT_HOSTS);
    const order = get_encrypt_order(ALT_HOSTS);
    if (order.length > 0)
        return enc_with_order(keys, order, inp);
    let a = mapp(subst(rc4(keys[0], reverse(inp))), keys[1], keys[2]);
    a = mapp(reverse(subst(rc4(keys[3], a))), keys[4], keys[5]);
    a = rc4(keys[8], reverse(mapp(a, keys[6], keys[7])));
    return subst(subst(a));
}
function dec(inp) {
    const keys = get_keys(ALT_HOSTS);
    const order = get_encrypt_order(ALT_HOSTS);
    if (order.length > 0)
        return dec_with_order(keys, order, inp);
    let a = subst_(inp);
    a = mapp(reverse(rc4(keys[8], subst_(a))), keys[7], keys[6]);
    a = rc4(keys[3], subst_(reverse(mapp(a, keys[5], keys[4]))));
    a = reverse(rc4(keys[0], subst_(mapp(a, keys[2], keys[1]))));
    return a;
}
function episode(data_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const t = new Date().getTime().toString(16);
        const time_params = `t=${encodeURIComponent(t)}&h=${encodeURIComponent(enc(t))}`;
        debug(ID, time_params);
        let url = `https://${HOST}/ajax/embed/episode/${data_id}/sources?token=${encodeURIComponent(enc(data_id))}&${time_params}`;
        debug(ID, url);
        const resp = yield (yield fetch(url)).json();
        // 0 is F2Cloud
        const f2cloud_id = resp.result[0].id;
        debug(ID, f2cloud_id);
        url = `https://${HOST}/ajax/embed/source/${f2cloud_id}?token=${encodeURIComponent(enc(f2cloud_id))}&${time_params}`;
        debug(ID, url);
        const resp2 = yield (yield fetch(url)).json();
        const f2cloud_url = resp2.result.url;
        debug(ID, f2cloud_url);
        const f2cloud_url_dec = dec(f2cloud_url);
        return yield F2Cloud.stream(f2cloud_url_dec);
    });
}
function movie(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield (yield fetch(`https://${HOST}/embed/movie/${id}`)).text();
        const data_id = (/data-id="(.*?)"/g).exec(resp)[1];
        debug(ID, data_id);
        debug(ID, enc(id));
        return yield episode(data_id);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, s = 1, e = 1) {
        const resp = yield (yield fetch(`https://${HOST}/embed/tv/${id}/${s}/${e}`)).text();
        const data_id = (/data-id="(.*?)"/g).exec(resp)[1];
        return yield episode(data_id);
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
            }
            log(ID, `${HOST} passed the tests`);
            return '';
        }
        catch (e) {
            error(ID, `${HOST} failed the tests`, e);
            return '';
        }
    });
}
export const Vidsrc = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, test, SCRAPE_CONFIG };
//# sourceMappingURL=vidsrc.js.map