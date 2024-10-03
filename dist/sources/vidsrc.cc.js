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
import { isJSON, log, error, debug, rc4, NO_STREAM_ERROR } from '../utils.js';
import { UpCloud } from '../providers/upcloud.js';
const HOST = 'vidsrc.cc';
const ALT_HOSTS = [HOST];
const SERVER_UPCLOUD = 'UpCloud';
const SERVER_VIDCLOUD = 'VidCloud';
const SERVERS = [
    { id: SERVER_UPCLOUD, handler: UpCloud },
];
const ID = "VSC";
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
function enc(input) {
    let key = "78B22E5E862BC";
    return encodeURIComponent(btoa(btoa(rc4(key, input))));
}
function episode(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, type = 'tv', s = 1, e = 1, _server = SERVER_VIDCLOUD) {
        const postfix = type == 'tv' ? `tv/${id}/${s}/${e}` : `movie/${id}`;
        const url = `https://${HOST}/v2/embed/${postfix}`;
        debug(ID, url);
        const res = yield (yield fetch(url, {
            headers: {
                'Host': HOST,
                'User-Agent': USER_AGENT,
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Dest': 'iframe',
                'Referer': HOST,
            }
        })).text();
        const new_data_id = (new RegExp(`data-id="(.*?)" data-number=`, 'g')).exec(res)[1];
        debug(ID, new_data_id);
        const v_value = (new RegExp(`var v = "(.*?)"`, 'g')).exec(res)[1];
        debug(ID, `v value: ${v_value}`);
        const vrf = encodeURIComponent(enc(id));
        debug(ID, `vrf: ${vrf}`);
        const api_url = `https://${HOST}/api/episodes/${new_data_id}/servers?id=${id}&season=${s}&episode=${e}&type=${type}&isMobile=false&v=${encodeURIComponent(v_value)}&vrf=${vrf}`;
        debug(ID, api_url);
        const res2 = yield (yield fetch(api_url, {
            headers: {
                'Host': HOST,
                'User-Agent': USER_AGENT,
                'Referer': HOST,
            }
        })).json();
        const server_hash = res2.data.find(v => v.name == _server);
        debug(ID, `server hash: ${server_hash.hash}`);
        if (server_hash == undefined)
            throw NO_STREAM_ERROR;
        // not used at the moment ... it could be useful in the future
        const key = encodeURIComponent(btoa(id + "-" + new_data_id));
        debug(ID, `key: ${key}`);
        const embed_url = `https://${HOST}/api/source/${server_hash.hash}`;
        debug(ID, `embed url: ${embed_url}`);
        const res3 = yield (yield fetch(embed_url, {
            headers: {
                'Host': HOST,
                'User-Agent': USER_AGENT,
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
            }
        })).json();
        if (res3.success == false)
            throw NO_STREAM_ERROR;
        debug(ID, res3.data.source);
        return { stream: res3.data.source, subtitles: res3.data.subtitles };
    });
}
;
function movie(id, _server) {
    return __awaiter(this, void 0, void 0, function* () {
        debug(ID, id);
        return episode(id, 'movie', 1, 1, _server);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, s = 1, e = 1, _server) {
        debug(ID, id);
        return episode(id, 'tv', s, e, _server);
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const tests = [movie("385687"), tv('tt0944947', 2, 3)];
            const tests = [tv('tt0944947', 2, 3)];
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
export const VidsrcCC = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, test };
//# sourceMappingURL=vidsrc.cc.js.map