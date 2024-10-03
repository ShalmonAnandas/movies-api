import {Request, Response } from 'express/index.js'
import { VidsrcCC } from '../sources/vidsrc.cc.js'

export const test = async (req: Request, res: Response) => {
    const testResponse  = await VidsrcCC.test();
    res.status(200).json({message: testResponse})
}

export const VidSrcCCApi = { test }