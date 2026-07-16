import { rsaDecryptBlock } from "./rsa";
import { parseLicenseData } from "./parser";
import type { SALicenseData } from "./types";


function bytesToRawString(
  bytes: Uint8Array
): string {

  let result = "";

  for (const b of bytes) {

    if (
      b === 0xe0 ||
      b === 0xe1
    ) {

      result += "|";

    }
    else if (
      b >= 32 &&
      b <= 126
    ) {

      result += String.fromCharCode(b);

    }
    else {

      result += ".";

    }

  }

  return result;

}



export function decodeSALicense(
  bytes: Uint8Array
): SALicenseData {


  if (bytes.length !== 720) {

    throw new Error(
      `Invalid barcode length. Expected 720 bytes, got ${bytes.length}`
    );

  }



  const versionBytes =
    bytes.slice(0,4);



  let version = 2;


  if (
    versionBytes[1] === 0xe1
  ) {

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



  let blockDebug = "";



  blocks.forEach(
    (block,index)=>{


      const result =
        rsaDecryptBlock(
          block,
          version
        );


      blockDebug +=
        `\n========== BLOCK ${index} ==========\n`;


      blockDebug +=
        `Length: ${result.length}\n\n`;



      for(
        let i=0;
        i<result.length;
        i++
      ){

        if(i % 16 === 0){

          blockDebug +=
            i
            .toString(16)
            .padStart(4,"0")
            +
            ": ";

        }


        blockDebug +=
          result[i]
          .toString(16)
          .padStart(2,"0")
          +
          " ";


        if(i % 16 === 15){

          blockDebug += "\n";

        }

      }


      const combined =
        new Uint8Array(
          decrypted.length +
          result.length
        );


      combined.set(
        decrypted
      );


      combined.set(
        result,
        decrypted.length
      );


      decrypted =
        combined;


    }
  );



  /*
    RAW DECRYPTED STRING
  */


  const rawString =
    bytesToRawString(
      decrypted
    );


  const payload =
    decrypted.slice(16);


  const payloadRawString =
    bytesToRawString(
      payload
    );



  (window as any).__rawLicenseString =
    rawString;



  (window as any).__payloadRawString =
    payloadRawString;



  /*
     SHOW EVERYTHING IN CURRENT DEBUG WINDOW
  */


  (window as any).__blockDebug =

`
================ RAW LICENSE STRING ================

${rawString}


================ PAYLOAD STRING ====================

${payloadRawString}


================ BLOCK DEBUG ======================

${blockDebug}

`;



  return parseLicenseData(
    payload
  );

}