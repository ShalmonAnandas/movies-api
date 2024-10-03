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
import { debug, try_stream, error, isJSON, log } from '../utils.js';
import { UpCloud } from '../providers/upcloud.js';
const HOST = 'vidstream.to';
const ALT_HOSTS = [HOST];
const SERVER_UPCLOUD = 'UpCloud';
const SERVERS = [
    { id: SERVER_UPCLOUD, handler: UpCloud },
];
const ID = 'VDT';
// watchseries sometimes crashes ... just retry
const SCRAPE_CONFIG = {
    ID: ID,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36, Playstation',
    EXPECTED_KEYS: 0,
    INJECT_URLS: [],
    // input of encrypt function
    ENTRY: new RegExp(''),
    // output of encrypt function
    OUT: new RegExp(''),
    INIT_URL: ``,
    BTN_ID: "",
    MAX_TIMEOUT: 3500
};
function episode(data_id_1) {
    return __awaiter(this, arguments, void 0, function* (data_id, server = SERVER_UPCLOUD) {
        const url = `https://${HOST}/ajax/movie/episode/servers/${data_id}`;
        const resp = yield (yield fetch(url)).text();
        const new_data_id = (new RegExp(`data-id="(.*?)".*${server}.*?<\/a>`)).exec(resp)[1];
        debug(ID, new_data_id);
        const url2 = `https://${HOST}/ajax/movie/episode/server/sources/${new_data_id}`;
        const resp2 = yield (yield fetch(url2)).json();
        debug(ID, resp2.data.link);
        return yield try_stream(SERVERS, server, resp2.data.link);
    });
}
function movie(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, server = SERVER_UPCLOUD) {
        const url = `https://${HOST}/watch-movie/${id}`;
        const redirect = yield fetch(url, { redirect: 'manual' });
        debug(ID, redirect.headers.get("location"));
        const new_url = redirect.headers.get("location");
        const new_id = new_url.split("/").at(-1);
        return yield episode(new_id, server);
    });
}
function tv(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, s = 1, e = 1, server = SERVER_UPCLOUD) {
        debug(ID, id);
        const real_id = id.split("-").at(-1);
        const seasons_url = `https://${HOST}/ajax/movie/seasons/${real_id}`;
        const resp_seasons = yield (yield fetch(seasons_url)).text();
        const season_id = (/data-id="(.*?)"/g).exec(resp_seasons)[s];
        debug(ID, season_id);
        const episodes_url = `https://${HOST}/ajax/movie/season/episodes/${season_id}`;
        const resp_episodes = yield (yield fetch(episodes_url)).text();
        const episode_id = (/data-id="(.*?)"/g).exec(resp_episodes)[e];
        debug(ID, episode_id);
        return yield episode(episode_id, server);
    });
}
function search(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${HOST}/search?keyword=${encodeURIComponent(query)}`;
        const resp = yield (yield fetch(url)).text();
        const results = resp.match(new RegExp(`<a href=".*?" title=".*?">`, 'gm'));
        const ret = [];
        for (const r of results) {
            const [, type_raw, id, title] = (new RegExp(`href="/(.*?)/(.*?)" title="(.*?)"`)).exec(r);
            let type = 'tv';
            if (type_raw !== 'watch-series')
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
            const tests = [tv("watch-the-big-bang-theory-39508", 1, 1), movie("watch-the-lord-of-the-rings-16510")];
            const results = yield Promise.all(tests);
            for (const r of results) {
                if (!isJSON(r))
                    throw `${JSON.stringify(r)} is not json`;
            }
            const results2 = yield search("the big bang theory tv series");
            if (results2[0].type == 'tv') {
                const r = (yield tv(results2[0].id, 1, 1));
                if (!isJSON(r))
                    throw `${JSON.stringify(r)} is not json`;
            }
            else {
                const r = (yield movie(results2[0].id));
                if (!isJSON(r))
                    throw `${JSON.stringify(r)} is not json`;
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
export const VidStream = { HOST, ALT_HOSTS, SERVERS, ID, movie, tv, search, SCRAPE_CONFIG, test };
//# sourceMappingURL=vidstream.to.js.map