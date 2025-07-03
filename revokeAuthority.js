import {
    Connection,
    clusterApiUrl,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction
  } from "@solana/web3.js";
  import {
    TOKEN_2022_PROGRAM_ID,
    tokenMetadataUpdateAuthority
  } from "@solana/spl-token";
  
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const privateKey = ["private key"];
  const payer = Keypair.fromSecretKey(Buffer.from(privateKey));
  const updateAuthorityKeypair = payer;  
  const mintPubkey = new PublicKey("593AXaxXiKsw25xZTU1orTiiRYPgijdDX4qeYGXfzrY8");  
  
  const newUpdateAuthority = null;
  
  (async () => {
    try {
      const accountInfo = await connection.getAccountInfo(mintPubkey);
      if (!accountInfo) {
        throw new Error("Metadata account (for mint) not found on chain.");
      }
      if (!accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        throw new Error("Provided mint is not owned by the Token-2022 program.");
      }
      console.log(`Verified metadata account: ${mintPubkey.toBase58()}`);
  
      console.log(
        `Revoking update authority for token mint ${mintPubkey.toBase58()} by setting newUpdateAuthority to null...`
      );
  
      const revokeAuthorityTx = new Transaction().add(
        await tokenMetadataUpdateAuthority(
          connection,
          payer,
          mintPubkey,
          updateAuthorityKeypair,
          newUpdateAuthority,
          [],                     
          undefined,             
          TOKEN_2022_PROGRAM_ID   
        )
      );
  
      const signature = await sendAndConfirmTransaction(connection, revokeAuthorityTx, [
        payer,
        updateAuthorityKeypair
      ]);
      console.log(`Transaction successful with signature: ${signature}`);
      console.log("✅ Update authority has been revoked (set to null).");
    } catch (error) {
      console.error("Error revoking update authority:", error);
    }
  })();
  
  