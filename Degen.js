import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    createInitializeMetadataPointerInstruction,
    getMint,
    getMetadataPointerState,
    mintTo,
    createAccount,
        createSetAuthorityInstruction,
    setAuthority,
    AuthorityType,
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    createRemoveKeyInstruction,
    unpack,
    pack,
} from "@solana/spl-token-metadata";

import { addKeypairToEnvFile } from '@solana-developers/node-helpers';
const privateKey = ["private key"];

const payer = Keypair.fromSecretKey(Buffer.from(privateKey));

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

let transaction;
let transactionSignature;

const mintKeypair = Keypair.generate();
await addKeypairToEnvFile(mintKeypair, 'mintKeypair');
const mint = mintKeypair.publicKey;
const decimals = 8;

const mintAuthority = payer.publicKey;
const updateAuthority = payer.publicKey;
const metaData = {
    updateAuthority: updateAuthority,
    mint: mint,
    name: "Degen Lab",
    symbol: "DGNLB",
    uri: "https://raw.githubusercontent.com/degenlabai/Degen-Lab-Token/refs/heads/main/Degen.json",
    additionalMetadata: [["description", "Only Possible On Solana"]],
};

const metadataExtension = 4; 
const metadataLen = pack(metaData).length;
const mintLen = getMintLen([ExtensionType.MetadataPointer]);

await new Promise(resolve => setTimeout(resolve, 20000)); 

console.log("10 seconds have passed, continuing execution...");
const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen
);

const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
});

const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
    mint,
    updateAuthority,
    mint,
    TOKEN_2022_PROGRAM_ID
);
   
await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");
const initializeMintInstruction = createInitializeMintInstruction(
    mint,
    decimals,
    mintAuthority,
    null,
    TOKEN_2022_PROGRAM_ID
);

const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint,
    updateAuthority: updateAuthority,
    mint: mint,
    mintAuthority: mintAuthority,
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri,
});

const updateFieldInstruction = createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint,
    updateAuthority: updateAuthority,
    fields: [["uri", "https://raw.githubusercontent.com/degenlabai/Degen-Lab-Token/refs/heads/main/Degen.json"]],

});
await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    initializeMintInstruction,
    initializeMetadataInstruction,
    updateFieldInstruction
);
await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair]
);

console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`
);
await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

const mintInfo = await getMint(
    connection,
    mint,
    "confirmed",
    TOKEN_2022_PROGRAM_ID
);
const metadataPointer = getMetadataPointerState(mintInfo);
console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));

const slicedBuffer = mintInfo.tlvData.subarray(72);
const metadata = unpack(slicedBuffer);
console.log("\nMetadata:", JSON.stringify(metadata, null, 2));
await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

const removeKeyInstruction = createRemoveKeyInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint,
    updateAuthority: updateAuthority,
    idempotent: true,
});

transaction = new Transaction().add(removeKeyInstruction);
transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
);
await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

console.log(
    "\nRemove Additional Metadata Field:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`
);

console.log(
    "\nMint Account:",
    `https://solana.fm/address/${mint}?cluster=devnet-alpha`
);

const sourceTokenAccount = await createAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
);

transactionSignature = await mintTo(
    connection,
    payer,
    mint,
    sourceTokenAccount,
    mintAuthority,
    690000000000000000,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
);

console.log(
    "\nMint Tokens:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`
);

await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

console.log(
    "\nMint Account:",
    `https://solana.fm/address/${mint}?cluster=devnet-alpha`
);

  async function revokeMintAuthority(connection, mint,  payer) {
    try {
        const mintAccountInfo = await connection.getAccountInfo(mint);
        if (!mintAccountInfo) {
            throw new Error("Mint account does not exist.");
        }
        if (mintAccountInfo.owner.toBase58() !== TOKEN_2022_PROGRAM_ID.toBase58()) {
            throw new Error("The mint account is not owned by the SPL Token program.");
        }
        await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

        const instruction = await createSetAuthorityInstruction(
            mint, // Mint account public key
            payer.publicKey, // Current mint authority
            AuthorityType.MintTokens, // The type of authority to change (minting tokens)
            null,    
            [payer], 
            TOKEN_2022_PROGRAM_ID // Program ID for SPL Token 2022 standard
        );

        const transaction =await new Transaction().add(instruction);
        await new Promise(resolve => setTimeout(resolve, 20000)); // 10-second delay

console.log("10 seconds have passed, continuing execution...");

        console.log("Sending transaction to revoke mint authority...");
        console.log("Mint:", mint.toBase58());
        console.log("Current Mint Authority:", payer.publicKey.toBase58());
        console.log("Program ID:", TOKEN_2022_PROGRAM_ID.toBase58());

        const transactionSignature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer], 
            {
                commitment: "finalized",
                preflightCommitment: "finalized",
            }
        );

        console.log("Mint authority revoked. The token is now non-mintable.");
        console.log(`Transaction Signature: ${transactionSignature}`);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
}

await revokeMintAuthority(connection, mint,  payer);




