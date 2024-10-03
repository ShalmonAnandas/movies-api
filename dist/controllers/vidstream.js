var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { VidsrcCC } from '../sources/vidsrc.cc.js';
export const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const testResponse = yield VidsrcCC.test();
    res.status(200).json({ message: testResponse });
});
export const VidSrcApi = { test };
//# sourceMappingURL=vidstream.js.map