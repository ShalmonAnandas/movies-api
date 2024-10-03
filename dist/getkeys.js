/*
 * The idea is to use the AST of the original script to find the RC4 function
 * Then open a real url, patch the script in a way that the RC4 function
 * can exfiltrate its parameters (keys) and gather them
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import { executablePath } from 'puppeteer';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import fs from 'fs';
import { keys_path, debug, error, log, rc4, mapp, subst, reverse, enc_with_order } from './utils.js';
import { F2Cloud } from './providers/f2cloud.js';
import { Watchseries } from './sources/watchseries.js';
import { Vidsrc } from './sources/vidsrc.js';
import { Aniwave } from './sources/aniwave.js';
const ID = 'GK';
//const FLIX2: ScrapeConfig = {
//  ID: 'FL',
//  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
//  EXPECTED_KEYS: 5,
//  INJECT_URLS: [
//    "all.js",
//    "embed.js"
//  ],
//  ENTRY: new RegExp('', ''),
//  OUT: new RegExp('', ''),
//  INIT_URL: "https://2flix.to/tv/the-big-bang-theory-watch-online-jjgjg/1-1",
//  BTN_ID: ".playnow-btn",
//  MAX_TIMEOUT: 2500
//}
//
//const VIDSRCCC: ScrapeConfig = {
//  ID: "CC",
//  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36, Playstation',
//  EXPECTED_KEYS: 5,
//  INJECT_URLS: [
//    "all.js",
//    "all.min.js",
//    "embed.js",
//    "embed.min.js"
//  ],
//  ENTRY: new RegExp('', ''),
//  OUT: new RegExp('', ''),
//  INIT_URL: "https://vidsrc.cc/v2/embed/tv/tt0898266",
//  BTN_ID: "#btn-play",
//  MAX_TIMEOUT: 5000,
//}
const ENTRIES = {};
const funcs = [reverse, subst];
const mfuncs = [[subst], [reverse, subst]];
/**
 * Returns names of the (sorted) functions used to produce `expected`
 *
 * @param {string} expected The expected value.
 * @param {Trace} prev_trace The trace of the step before (can be empty in case of first step).
 * @param {string} r1 Only used for the first step. It is the entry value (e.g. `LoFbkLSv`).
 * @return {Array} Names of the functions.
 */
function find_funcs(expected = "", prev_trace = {}, r1 = "") {
    let fun = [];
    if (prev_trace["type"] == "rc4") {
        r1 = rc4(prev_trace["0"], prev_trace["1"]);
        fun = [rc4];
    }
    else if (prev_trace["type"] == "map") {
        r1 = mapp(prev_trace["0"], prev_trace["1"], prev_trace["2"]);
        fun = [mapp];
    }
    if (r1 === expected) {
        return fun;
    }
    if (r1 === "")
        r1 = expected;
    for (let i = 0; i < funcs.length; i++) {
        const r2 = funcs[i](r1);
        if (r2 == expected)
            return [...fun, funcs[i]];
        for (let j = 0; j < mfuncs[i].length; j++) {
            const r3 = mfuncs[i][j](r2);
            if (r3 == expected)
                return [...fun, funcs[i], mfuncs[i][j]];
        }
    }
    throw "NO COMBINATION";
}
/**
 * Returns the result of the previous trace (it is the argument of the current trace)
 *
 * @param {Trace} trace The trace that has per argument the previous trace result
 * @return {string} Result
 */
function get_result_from_prev_trace(trace) {
    if (trace["type"] == "rc4") {
        return trace["1"];
    }
    else if (trace["type"] == "map") {
        return trace["0"];
    }
    return "";
}
function get_result_from_trace(trace) {
    if (trace["type"] == "rc4") {
        return rc4(trace["0"], trace["1"]);
    }
    else if (trace["type"] == "map") {
        return mapp(trace["0"], trace["1"], trace["2"]);
    }
    return "";
}
function get_func_from_trace(trace) {
    if (trace["type"] == "rc4") {
        return rc4;
    }
    else if (trace["type"] == "map") {
        return mapp;
    }
    return ((v) => v);
}
// Assumption: 
// - while intercepting using puppeteer we ONLY get keys (not false positives)
// - the order of the keys intercepted is critical
// - we log only the first usage of the encrypt function (we get there `entry` and `out`)
// - `entry` and `out` must be related to `traces`
//
// The idea is that we log every call to "important" functions (e.g. rc4, mapp)
// The logs must be in the correct order
// With the logs we know parameters and we can compute the output
// We then try all the combinations to find the correct functions
// 
function reverse_crypt_function(traces, entry = "", out = "") {
    let log = '';
    const funcs = [];
    if (entry != "") {
        const prev_res = get_result_from_prev_trace(traces[0]);
        const comb = find_funcs(entry, {}, prev_res);
        funcs.push(...comb);
        log += (`0. ${comb.map(f => f.name)}\n`);
    }
    for (let i = 1; i < traces.length; i++) {
        const prev_res = get_result_from_prev_trace(traces[i]);
        const comb = find_funcs(prev_res, traces[i - 1]);
        funcs.push(...comb);
        log += (`${i}. ${comb.map(f => f.name)}\n`);
    }
    const prev_res = get_result_from_trace(traces[traces.length - 1]);
    const comb = find_funcs(out, {}, prev_res);
    funcs.push(get_func_from_trace(traces[traces.length - 1]));
    funcs.push(...comb);
    log += (`L${traces.length}. ${comb.map(f => f.name)}\n`);
    debug(ID, log);
    return funcs;
}
// finding possible names for the rc4 function
// a new source is not generated since some functions depend on the min algorithm
// used originally
function get_rc4_names(source) {
    return __awaiter(this, void 0, void 0, function* () {
        function rec_search(p) {
            var _a, _b, _c;
            const body = ((_a = p === null || p === void 0 ? void 0 : p.body) === null || _a === void 0 ? void 0 : _a.body) || ((_b = p === null || p === void 0 ? void 0 : p.consequent) === null || _b === void 0 ? void 0 : _b.body) || ((_c = p === null || p === void 0 ? void 0 : p.init) === null || _c === void 0 ? void 0 : _c.body);
            if (!body || (body === null || body === void 0 ? void 0 : body.length) == undefined || body.length == 0)
                return { fors: 0, whiles: 0 };
            let fors = 0;
            let whiles = 0;
            for (const n of body) {
                if (n.type == 'ForStatement')
                    fors++;
                if (n.type == 'WhileStatement')
                    whiles++;
                const r = rec_search(n);
                fors += r.fors;
                whiles += r.whiles;
            }
            return { fors, whiles };
        }
        const ast = parser.parse(source);
        const names = [];
        const MyVisitor = {
            FunctionDeclaration(path) {
                const s = source.slice(path.node.start, path.node.end);
                const name = s.split("{")[0].replace("(", "\\(").replace(")", "\\)");
                const r = rec_search(path === null || path === void 0 ? void 0 : path.node);
                if (r.fors >= 3 && !names.find(t => t.code == s)) {
                    names.push({ name: name, code: s, type: 'rc4', source: 'func' });
                    return;
                }
                if ((r.whiles == 1 || r.fors == 1) && path.node.params.length == 3 && !names.find(t => t.code == s)) {
                    names.push({ name: name, code: s, type: 'map', source: 'func' });
                    return;
                }
            },
            Function(path) {
                const s = source.slice(path.node.start, path.node.end);
                //const name = s.split("{")[0].replace("(", "\\(").replace(")", "\\)");
                const r = rec_search(path === null || path === void 0 ? void 0 : path.node);
                if (r.fors >= 3 && !names.find(t => t.code == s)) {
                    //names.push({ name: name, code: s, type: 'func_expr', source: 'func' });
                }
            }
        };
        // dirty bypass ... can you help me?
        traverse.default(ast, MyVisitor);
        return names;
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// https://gist.github.com/jabney/5018b4adc9b2bf488696
function entropy(str) {
    const len = str.length;
    const frequencies = Array.from(str)
        .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {});
    return Object.values(frequencies)
        .reduce((sum, f) => sum - f / len * Math.log2(f / len), 0);
}
function handle_intercept(request_1, config_1) {
    return __awaiter(this, arguments, void 0, function* (request, config, entries_outs = {}) {
        const url = decodeURIComponent(request.url());
        const host = (new URL(url)).host;
        if (config.INJECT_URLS.some(v => url.includes(v))) {
            let body = yield (yield fetch(url)).text();
            const funcs = yield get_rc4_names(body);
            debug(ID, url);
            debug(ID, JSON.stringify(funcs));
            // risky approach since we could modify multiple functions
            // ... but in the worst case we would just be printing so no harm
            for (const n of funcs) {
                const proxy = `if(arguments){arguments['host']='${host}';arguments['type']='${n.type}';window.mylog(arguments);}`;
                switch (n.type) {
                    case 'func_expr':
                        const reg_res = (/^function.*?{/gm).exec(n.code);
                        if (reg_res) {
                            const func_name = reg_res[0];
                            const updated = n.code.replace(func_name, `${func_name}${proxy}`);
                            body = body.replaceAll(n.code, updated);
                        }
                        break;
                    default:
                        const sel = (new RegExp(`${n.name}\\s*{`, 'gms')).exec(body);
                        if (sel) {
                            const rep = `${sel[0]}${proxy}`;
                            body = body.replaceAll(sel[0], rep);
                        }
                        break;
                }
            }
            request.respond({
                status: 200,
                body: body
            });
        }
        else {
            if (ENTRIES[host] && ENTRIES[host].ENTRY.test(url)) {
                if (entries_outs[host] == undefined)
                    entries_outs[host] = { entry: "", out: "" };
                if (entries_outs[host].entry == "")
                    entries_outs[host].entry = ENTRIES[host].ENTRY.exec(url)[1];
                debug(ID, `ENTRY : ${entries_outs[host].entry} for ${host}`);
            }
            if (ENTRIES[host] && ENTRIES[host].OUT.test(url)) {
                if (entries_outs[host] == undefined)
                    entries_outs[host] = { entry: "", out: "" };
                if (entries_outs[host].out == "")
                    entries_outs[host].out = ENTRIES[host].OUT.exec(url)[1];
                debug(ID, `OUT : ${entries_outs[host].out} for ${host}`);
            }
            request.continue();
        }
    });
}
function find_keys(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = [
            '--no-sandbox',
            '--disable-web-security',
        ];
        const options = {
            args,
            executablePath: process.env.PUPPETEER_EXEC_PATH || executablePath(),
            headless: false,
        };
        const browser = yield puppeteer.launch(options);
        const page = yield browser.newPage();
        const keys = {};
        let keysNum = 0;
        const traces = {};
        const entries_outs = {};
        page.setDefaultNavigationTimeout(30000);
        yield page.setUserAgent(config.USER_AGENT);
        yield page.setViewport({
            width: 1080,
            height: 1080
        });
        yield page.setRequestInterception(true);
        page.on('request', (request) => __awaiter(this, void 0, void 0, function* () {
            yield handle_intercept(request, config, entries_outs);
        }));
        const closed = false;
        function add_key(host, key, trace) {
            if (!keys[host].includes(key) && entropy(key) > 3.2) {
                keys[host].push(key);
                if (!traces[host].includes(trace))
                    traces[host].push(trace);
                return true;
            }
        }
        yield page.exposeFunction('mylog', (data) => {
            if (!data['0'])
                return;
            if (data['type'] == 'func_expr' && Object.values(data).includes('tt0898266'))
                console.log(ID, JSON.stringify(data));
            if (!keys[data['host']]) {
                keys[data['host']] = [];
                traces[data['host']] = [];
            }
            if (data['type'] == 'rc4') {
                if (add_key(data['host'], data['0'], data)) {
                    keysNum++;
                }
            }
            else if (data['type'] == 'map') {
                if (add_key(data['host'], data['1'], data)) {
                    keysNum++;
                }
                if (add_key(data['host'], data['2'], data)) {
                    keysNum++;
                }
            }
        });
        yield page.goto(config.INIT_URL);
        yield page.waitForSelector(config.BTN_ID, { timeout: 5000 });
        try {
            for (let i = 0; i < 50; i++) {
                if (closed) {
                    break;
                }
                yield page.bringToFront();
                const btn = yield page.$(config.BTN_ID);
                if (btn && !closed) {
                    yield page.evaluate((element) => {
                        element.click();
                    }, btn);
                }
                yield sleep(100);
            }
        }
        catch (e) {
            if (!closed)
                error(ID, "", e);
        }
        if (keysNum < config.EXPECTED_KEYS) {
            yield sleep(config.MAX_TIMEOUT || 2500);
        }
        yield browser.close();
        debug(ID, `${config.ID} got ${keysNum}/${config.EXPECTED_KEYS}`);
        return ({ keys, traces, entries_outs });
    });
}
// TODO: generalize and refactor
function prepare_entries(arr) {
    for (const e of arr) {
        if (e.SCRAPE_CONFIG.ENTRY) {
            for (const h of e.ALT_HOSTS) {
                ENTRIES[h] = e.SCRAPE_CONFIG;
            }
        }
    }
}
function test_keys_funcs(keys, funcs, entry, out) {
    const res = enc_with_order(keys, funcs, entry);
    return res == out;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // disabled
        return;
        prepare_entries([Vidsrc, F2Cloud, Watchseries, Aniwave]);
        const promises = [find_keys(Vidsrc.SCRAPE_CONFIG), find_keys(Watchseries.SCRAPE_CONFIG), find_keys(Aniwave.SCRAPE_CONFIG)];
        const results_promises = (yield Promise.all(promises));
        const results = { keys: {}, traces: {}, entries_outs: {}, encrypt_order: {} };
        for (const r of results_promises) {
            results.keys = Object.assign({}, results.keys, r.keys);
            results.traces = Object.assign({}, results.traces, r.traces);
            results.entries_outs = Object.assign({}, results.entries_outs, r.entries_outs);
        }
        const keys = results["keys"];
        const traces = results["traces"];
        const entries_outs = results["entries_outs"];
        for (const t in traces) {
            const entry = entries_outs[t].entry;
            const out = entries_outs[t].out;
            if (entry && out && keys[t]) {
                const funcs = reverse_crypt_function(traces[t], entry, out);
                if (test_keys_funcs(keys[t], funcs, entry, out)) {
                    log(ID, `Encrypt function found for ${t}`);
                    results.encrypt_order[t] = funcs.map(f => f.name);
                }
            }
        }
        fs.writeFileSync(keys_path, JSON.stringify(results));
        log(ID, `Keys successfully stored in ${keys_path}`);
    });
}
main();
//# sourceMappingURL=getkeys.js.map