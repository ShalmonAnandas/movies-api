var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FlixHQ } from '../sources/flixhq.js';
import { Myflixerz } from '../sources/myflixerz.js';
import { VidsrcPro } from '../sources/vidsrc.pro.js';
import { VidStream } from '../sources/vidstream.to.js';
import { VidsrcMe } from '../sources/vidsrc.me.js';
import { VidsrcCC } from '../sources/vidsrc.cc.js';
export const flixhqTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const flixhq = yield FlixHQ.test();
    res.status(200).json({ "source": "FlixHQ", "status": flixhq });
});
export const myflixTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const myflix = yield Myflixerz.test();
    res.status(200).json({ "source": "MyFlixerz", "status": myflix });
});
export const vsrcproTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vsrcpro = yield VidsrcPro.test();
    res.status(200).json({ "source": "VidsrcPro", "status": vsrcpro });
});
export const vstreamTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vstream = yield VidStream.test();
    res.status(200).json({ "source": "VidStream", "status": vstream });
});
export const vsrcmeTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vsrcme = yield VidsrcMe.test();
    res.status(200).json({ "source": "VidSrcMe", "status": vsrcme });
});
export const vsrcccTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vsrccc = yield VidsrcCC.test();
    res.status(200).json({ "source": "VidSrcCC", "status": vsrccc });
});
export const ProviderTest = { flixhqTest, myflixTest, vsrcccTest, vsrcmeTest, vsrcproTest, vstreamTest };
//# sourceMappingURL=test.js.map