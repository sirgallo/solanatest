#!/usr/bin/env node

import { SolanaTestProvider } from './Providers/SolanaTestProvider';

export class App {
  constructor() {}

  async execute(): Promise<boolean> {

    const cluster = new SolanaTestProvider('testnet');
    await cluster.getBasicInformation();
    //console.log(await cluster.getAirDrop());
    return true;
  }
}

new App()
  .execute()
  .then(resp => {
    console.log(resp);
  })
  .catch(err => {
    console.log(err);
  });