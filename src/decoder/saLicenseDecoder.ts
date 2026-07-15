import { rsaDecryptBlock } from "./rsa";
import { parseLicenseData } from "./parser";
import type { SALicenseData } from "./types";



export function decodeSALicense(
  bytes: Uint8Array
): SALicenseData {


  if(bytes.length !== 720){

    throw new Error(
      `Invalid barcode length. Expected 720 bytes, got ${bytes.length}`
    );

  }



  /*
      PDF417 structure:

      Bytes 0-3:
      Version header

      Bytes 4-5:
      Reserved 00 00

      Bytes 6-719:
      RSA encrypted blocks

  */



  const versionBytes =
    bytes.slice(0,4);



  let version = 2;



  /*
      Current South African licences:

      01 9b 09 45 = Version 2

      Older:
      01 e1 02 45 = Version 1

  */



  if(
    versionBytes[1] === 0xe1
  ){

    version = 1;

  }



  const encrypted =
    bytes.slice(6);




  const blocks = [

    encrypted.slice(0,128),

    encrypted.slice(128,256),

    encrypted.slice(256,384),

    encrypted.slice(384,512),

    encrypted.slice(512,640),

    encrypted.slice(640,714)

  ];



  let decrypted =
    new Uint8Array();



  for(
    const block of blocks
  ){


    const result =
      rsaDecryptBlock(
        block,
        version
      );



    const combined =
      new Uint8Array(
        decrypted.length +
        result.length
      );



    combined.set(
      decrypted,
      0
    );


    combined.set(
      result,
      decrypted.length
    );


    decrypted =
      combined;

  }




  /*
      First 10 bytes are the
      decrypted internal header.
  */


const payload =
  decrypted.slice(10);



let hex = "";

for (
  let i = 0;
  i < payload.length;
  i++
){

  if(i % 16 === 0){

    hex +=
      "\n" +
      i
        .toString(16)
        .padStart(4,"0") +
      ": ";

  }

  hex +=
    payload[i]
      .toString(16)
      .padStart(2,"0") +
    " ";

}



(window as any).__payloadHex =
  hex;



return parseLicenseData(
  payload
);

}