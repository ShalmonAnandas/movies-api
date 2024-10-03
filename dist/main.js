var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*
 * So yes it is JS and not Typescript ... bite me
 */
import { FlixHQ } from './sources/flixhq.js';
import { Myflixerz } from './sources/myflixerz.js';
import { VidsrcPro } from './sources/vidsrc.pro.js';
import { VidStream } from './sources/vidstream.to.js';
import { VidsrcMe } from './sources/vidsrc.me.js';
import { VidsrcCC } from './sources/vidsrc.cc.js';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        FlixHQ.test();
        Myflixerz.test();
        VidsrcPro.test();
        // sometimes fails due to cloudflare
        VidsrcMe.test();
        VidStream.test();
        VidsrcCC.test();
    });
}
main();
//# sourceMappingURL=main.js.map