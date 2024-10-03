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
import { try_stream, isJSON, log, error, debug } from '../utils.js';
import { UpCloud } from '../providers/upcloud.js';
const HOST = 'flixhq.to';
const ALT_HOSTS = [HOST];
const SERVER_UPCLOUD = 'UpCloud';
const SERVER_VIDCLOUD = 'Vidcloud';
const SERVER_UPSTREAM = 'Upstream';
const SERVERS = [
    { id: SERVER_UPCLOUD, handler: UpCloud },
    { id: SERVER_VIDCLOUD, handler: UpCloud },
    { id: SERVER_UPSTREAM, handler: UpCloud },
];
const ID = "FH";
function episode(data_id_1) {
    return __awaiter(this, arguments, void 0, function* (data_id, server = SERVER_UPCLOUD) {
        let url = `https://${HOST}/ajax/episode/servers/${data_id}`;
        const resp = (yield (yield fetch(url)).text()).replace(/\n/g, '');
        const new_data_id = (new RegExp(`data-id="(.*?)".*title=".*?${server}"`, 'g')).exec(resp)[1];
        url = `https://${HOST}/ajax/episode/sources/${new_data_id}`;
        const json_data = yield (yield fetch(url)).json();
        return yield try_stream(SERVERS, server, json_data.link);
    });
}
;
function movie(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, server = SERVER_UPCLOUD) {
        let movie_id = id.split("-").at(-1);
        let url = `https://${HOST}/ajax/episode/list/${movie_id}`;
        const resp = (yield (yield fetch(url)).text()).replace(/\n/g, '');
        movie_id = (new RegExp(`data-linkid="(.*?)".*title="${server}"`, 'gs')).exec(resp)[1];
        url = `https://${HOST}/ajax/episode/sources/${movie_id}`;
        const json_data = yield (yield fetch(url)).json();
        return yield try_stream(SERVERS, server, json_data.link);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, s = 1, e = 1, server = SERVER_UPCLOUD) {
        const tv_id = id.split("-").at(-1);
        let resp = yield (yield fetch(`https://${HOST}/ajax/season/list/${tv_id}`)).text();
        let data_id = (/data-id="(.*?)"/gm).exec(resp)[s];
        resp = yield (yield fetch(`https://${HOST}/ajax/season/episodes/${data_id}`)).text();
        data_id = (/data-id="(.*?)"/gm).exec(resp)[e];
        return yield episode(data_id, server);
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tests = [movie("watch-the-pastor-111166"), tv("watch-the-big-bang-theory-39508", 1, 1)];
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
export const FlixHQ = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, test };
//# sourceMappingURL=flixhq.js.map