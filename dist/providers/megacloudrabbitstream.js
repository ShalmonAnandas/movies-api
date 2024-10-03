var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RabbitStream from './rabbitstream.js';
export const MegaCloudRabbitStream = {
    ALT_HOSTS: [],
    stream(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = url.split("/").at(-1).split("?").at(0);
            return yield RabbitStream.stream(id, 1);
        });
    }
};
//# sourceMappingURL=megacloudrabbitstream.js.map