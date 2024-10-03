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
import { mapp, reverse, subst_, subst, rc4, debug, try_stream, get_keys, error, log, isJSON, get_encrypt_order, enc_with_order, dec_with_order } from '../utils.js';
import { F2Cloud } from '../providers/f2cloud.js';
import { FMCloud } from '../providers/fmcloud.js';
const HOST = 'aniwave.to';
const ALT_HOSTS = [HOST];
const SERVER_F2CLOUD = '41';
const SERVER_MEGACLOUD = '28';
const SERVER_FMCLOUD = '45';
const SERVERS = [
    { id: SERVER_F2CLOUD, handler: F2Cloud },
    { id: SERVER_MEGACLOUD, handler: F2Cloud },
    { id: SERVER_FMCLOUD, handler: FMCloud },
];
const ID = 'AW';
const SCRAPE_CONFIG = {
    ID: ID,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36; PlayStation',
    EXPECTED_KEYS: 18,
    INJECT_URLS: [
        "all.js",
        "embed.js",
        "scripts.js"
    ],
    // input of encrypt function
    ENTRY: new RegExp(`https://.*?/ajax/episode/list/(.*?)\\?`.replace(/\//g, '/')),
    // output of encrypt function
    OUT: new RegExp(`https://.*?/ajax/episode/list/.*?\\?vrf=(.*?)$`.replace(/\//g, '/')),
    INIT_URL: "https://aniwave.to/watch/one-piece.x3ln/ep-1",
    BTN_ID: "#player-wrapper",
    MAX_TIMEOUT: 2500
};
function enc(inp) {
    const keys = get_keys(ALT_HOSTS);
    const order = get_encrypt_order(ALT_HOSTS);
    if (order.length > 0)
        return enc_with_order(keys, order, inp);
    let a = reverse(subst(rc4(keys[2], mapp(inp, keys[0], keys[1]))));
    a = mapp(subst(rc4(keys[3], reverse(a))), keys[4], keys[5]);
    a = subst(rc4(keys[8], reverse(mapp(a, keys[6], keys[7]))));
    return subst(a);
}
function dec(inp) {
    const keys = get_keys(ALT_HOSTS);
    const order = get_encrypt_order(ALT_HOSTS);
    if (order.length > 0)
        return dec_with_order(keys, order, inp);
    let a = subst_(inp);
    a = mapp(reverse(rc4(keys[8], subst_(a))), keys[7], keys[6]);
    a = reverse(rc4(keys[3], subst_(mapp(a, keys[5], keys[4]))));
    return mapp(rc4(keys[2], subst_(reverse(a))), keys[1], keys[0]);
}
function episode(data_id_1) {
    return __awaiter(this, arguments, void 0, function* (data_id, server = SERVER_F2CLOUD) {
        let url = `https://${HOST}/ajax/server/list/${data_id}?vrf=${encodeURIComponent(enc(data_id))}`;
        const resp = yield (yield fetch(url)).json();
        const new_data_id = (new RegExp(`data-sv-id="${server}" data-link-id="(.*?)"`)).exec(resp.result)[1];
        url = `https://${HOST}/ajax/server/${new_data_id}?vrf=${encodeURIComponent(enc(new_data_id))}`;
        const resp2 = yield (yield fetch(url)).json();
        const url_dec = dec(resp2.result.url);
        return yield try_stream(SERVERS, server, url_dec);
    });
}
function movie(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, server = SERVER_F2CLOUD) {
        return yield tv(id, 1, 1, server);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, _ = 1, e = 1, server = SERVER_F2CLOUD) {
        const resp = yield (yield fetch(`https://${HOST}/watch/${id}/ep-${e}`)).text();
        let data_id = (/data-id="(.*?)"/g).exec(resp)[1];
        debug(ID, data_id);
        const url = `https://${HOST}/ajax/episode/list/${data_id}?vrf=${encodeURIComponent(enc(data_id))}`;
        debug(ID, url);
        const resp2 = yield (yield fetch(url)).json();
        data_id = (new RegExp(`data-num="${e}".*?data-ids="(.*?)"`, 'g')).exec(resp2.result)[1];
        debug(ID, data_id);
        return yield episode(data_id, server);
    });
}
function search(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${HOST}/filter?keyword=${query}`;
        const resp = yield (yield fetch(url)).text();
        const results = resp.match(new RegExp(`<a class="name d-title" href=".*?">.*?</a>`, 'g'));
        const ret = [];
        for (const r of results) {
            const [, type_raw, id, title] = (new RegExp(`href="/(.*?)/(.*?)" .*>(.*?)</a>`)).exec(r);
            let type = 'tv';
            if (type_raw !== 'tv')
                type = 'movie';
            const item = { type, title, id };
            ret.push(item);
        }
        return ret;
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tests = [tv("one-piece.x3ln", 1, 1)];
            const results = yield Promise.all(tests);
            for (const r of results) {
                if (!isJSON(r))
                    throw `${JSON.stringify(r)} is not json`;
            }
            const results2 = yield search("one piece");
            if (results2[0].type == 'tv') {
                const r = (yield tv(results2[0].id, 1, 2));
                if (!isJSON(r))
                    throw `${JSON.stringify(r)} is not json`;
            }
            else {
                const r = (yield movie(results2[0].id));
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
export const Aniwave = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, test, search, SCRAPE_CONFIG };
//# sourceMappingURL=aniwave.js.map