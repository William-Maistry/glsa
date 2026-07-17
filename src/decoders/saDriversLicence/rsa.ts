import forge from "node-forge";
import {
  VERSION2_KEY_128,
  VERSION2_KEY_74,
  VERSION1_KEY_128,
  VERSION1_KEY_74
} from "./keys";


function uint8ArrayToForgeBuffer(
  bytes: Uint8Array
) {

  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return forge.util.createBuffer(
    binary,
    "raw"
  );

}



function rsaDecrypt(
  block: Uint8Array,
  keyPem: string
): Uint8Array {


  const publicKey =
    forge.pki.publicKeyFromPem(
      keyPem
    );


  const encrypted =
    uint8ArrayToForgeBuffer(block)
    .getBytes();



  /*
    The SA licence system uses
    RSA public key operation.

    We are effectively reversing
    the RSA "encryption" done by
    the licensing authority.
  */

  const decrypted =
    publicKey.encrypt(
      encrypted,
      "RAW"
    );


  const output =
    new Uint8Array(
      decrypted.length
    );


  for (
    let i = 0;
    i < decrypted.length;
    i++
  ) {

    output[i] =
      decrypted.charCodeAt(i);

  }


  return output;

}





export function rsaDecryptBlock(
  block: Uint8Array,
  version: number = 2
): Uint8Array {


  let key: string;


  if (version === 1) {

    if (block.length === 128) {
      key = VERSION1_KEY_128;
    }
    else {
      key = VERSION1_KEY_74;
    }

  }
  else {

    if (block.length === 128) {
      key = VERSION2_KEY_128;
    }
    else {
      key = VERSION2_KEY_74;
    }

  }



  return rsaDecrypt(
    block,
    key
  );

}