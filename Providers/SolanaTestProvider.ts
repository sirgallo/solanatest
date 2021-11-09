import { struct, u32, ns64 } from '@solana/buffer-layout';
import * as web3 from '@solana/web3.js';

export class SolanaTestProvider {
  private connection: web3.Connection;
  constructor(private cluster: web3.Cluster) {
    this.connection = new web3.Connection(web3.clusterApiUrl(cluster));
  }

  consoleLog() {
    console.log(web3);
  }

  async getBasicInformation(): Promise<boolean> {
    try {
      const slot = await this.connection.getSlot();
      console.log(`Current slot height: ${slot}`);
      const blockTime = await this.connection.getBlockTime(slot);
      console.log(`Current block time: ${blockTime}`);
      const block = await this.connection.getBlock(slot);
      console.log(`Current block: ${block.blockhash} with rewards: ${JSON.stringify(block.rewards ? block.rewards[0].lamports : 0)} lamports`);
      const slotLeader = await this.connection.getSlotLeader();
      console.log(`Current slotLeader: ${slotLeader}`);

      return true;
    } catch (err) {
      console.log('Error stack: ', err);

      return false;
    }
  }

  async getAirDrop(): Promise<string> {
    const keypair = web3.Keypair.generate();
    const payer = web3.Keypair.generate();
    console.log(`Payer public key: ${payer.publicKey}`);

    const airdropSig = await this.connection.requestAirdrop(
      payer.publicKey,
      web3.LAMPORTS_PER_SOL
    );

    console.log(`airdrop signature: ${airdropSig}`)
    
    await this.connection.confirmTransaction(airdropSig);

    const allocateTransaction = new web3.Transaction({
      feePayer: payer.publicKey
    });

    const keys = [
      {
        pubkey: keypair.publicKey,
        isSigner: true,
        isWritable: true
      }
    ];

    const params = { space: 100 };

    const allocateStruct = {
      index: 8,
      layout: struct([
        u32('instruction'),
        ns64('space')
      ])
    };

    const data = Buffer.alloc(allocateStruct.layout.span);
    const layoutFields = Object.assign({
      instruction: allocateStruct.index
    }, params);

    allocateStruct.layout.encode(layoutFields, data);

    allocateTransaction.add(new web3.TransactionInstruction({
      keys,
      programId: web3.SystemProgram.programId,
      data
    }));

    return await web3.sendAndConfirmTransaction(this.connection, allocateTransaction, [payer, keypair]);
  }
}