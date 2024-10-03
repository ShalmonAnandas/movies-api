/*
 * So yes it is JS and not Typescript ... bite me 
 */
import { FlixHQ } from './sources/flixhq.js';
import { Myflixerz } from './sources/myflixerz.js';
import { VidsrcPro } from './sources/vidsrc.pro.js';
import { VidStream } from './sources/vidstream.to.js';
import { VidsrcMe } from './sources/vidsrc.me.js';
import { VidsrcCC } from './sources/vidsrc.cc.js';

async function main() {
  FlixHQ.test();
  Myflixerz.test();
  VidsrcPro.test();
  // sometimes fails due to cloudflare
  VidsrcMe.test();
  VidStream.test();
  VidsrcCC.test();
}

main();

