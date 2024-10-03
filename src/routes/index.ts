import { Router } from "express/index.js";
import { ProviderTest } from "../controllers/test.js";

const router = Router();

router.get('/flixhq-test', ProviderTest.flixhqTest);
router.get('/myflix-test', ProviderTest.myflixTest);
router.get('/vsrc-cc-test', ProviderTest.vsrcccTest);
router.get('/vsrc-me-test', ProviderTest.vsrcmeTest);
router.get('/vsrc-pro-test', ProviderTest.vsrcproTest);
router.get('/vstream-test', ProviderTest.vstreamTest);

export default router;