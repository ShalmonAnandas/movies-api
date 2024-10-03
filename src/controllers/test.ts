import { Request, Response } from 'express/index.js';

import { FlixHQ } from '../sources/flixhq.js';
import { Myflixerz } from '../sources/myflixerz.js';
import { VidsrcPro } from '../sources/vidsrc.pro.js';
import { VidStream } from '../sources/vidstream.to.js';
import { VidsrcMe } from '../sources/vidsrc.me.js';
import { VidsrcCC } from '../sources/vidsrc.cc.js';

export const flixhqTest = async (req: Request, res: Response) => {
    const flixhq  = await FlixHQ.test();
    res.status(200).json({"source": "FlixHQ", "status": flixhq});
}

export const myflixTest = async (req: Request, res: Response) => {
    const myflix = await Myflixerz.test();
    res.status(200).json({"source": "MyFlixerz", "status": myflix})
}
export const vsrcproTest = async (req: Request, res: Response) => {
    const vsrcpro = await VidsrcPro.test();
    res.status(200).json({"source": "VidsrcPro", "status": vsrcpro})
}
export const vstreamTest = async (req: Request, res: Response) => {
    const vstream = await VidStream.test();
    res.status(200).json({"source": "VidStream", "status": vstream})
}
export const vsrcmeTest = async (req: Request, res: Response) => {
    const vsrcme = await VidsrcMe.test();
    res.status(200).json({"source": "VidSrcMe", "status": vsrcme})
}
export const vsrcccTest = async (req: Request, res: Response) => {
    const vsrccc = await VidsrcCC.test();
    res.status(200).json({"source": "VidSrcCC", "status": vsrccc})
}

export const ProviderTest = { flixhqTest, myflixTest, vsrcccTest, vsrcmeTest, vsrcproTest, vstreamTest };

