import { rsaDecryptBlock } from "./rsa";
import { parseLicenseData } from "./parser";
import type { SALicenseData } from "./types";


function bytesToRawString(
  bytes: Uint8Array
): string {

  let result = "";

  for (const b of bytes) {

    /*
      PDF417 licence separators:
      e0/e1 are field delimiters
    */

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



  let debug = "";



  blocks.forEach(
    (block,index)=>{


      const result =
        rsaDecryptBlock(
          block,
          version
        );



      debug +=
        `\n========== BLOCK ${index} ==========\n`;


      debug +=
        `Length: ${result.length}\n\n`;



      for(
        let i=0;
        i<result.length;
        i++
      ){

        if(i % 16 === 0){

          debug +=
            i
              .toString(16)
              .padStart(4,"0")
            +
            ": ";

        }


        debug +=
          result[i]
          .toString(16)
          .padStart(2,"0")
          +
          " ";



        if(i % 16 === 15){

          debug += "\n";

        }

      }


      debug += "\n\n";



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
  );



  (window as any).__blockDebug =
    debug;



  /*
     FULL DECRYPTED STRING
  */

  const rawString =
    bytesToRawString(
      decrypted
    );


  (window as any).__rawLicenseString =
    rawString;



  /*
     Remove RSA header
  */

  const payload =
    decrypted.slice(16);



  const payloadRaw =
    bytesToRawString(
      payload
    );


  (window as any).__payloadRawString =
    payloadRaw;



  /*
     HEX DEBUG
  */

  let payloadHex = "";


  for(
    let i=0;
    i<payload.length;
    i++
  ){

    if(i % 16 === 0){

      payloadHex +=
        "\n" +
        i
          .toString(16)
          .padStart(4,"0")
        +
        ": ";

    }


    payloadHex +=
      payload[i]
      .toString(16)
      .padStart(2,"0")
      +
      " ";

  }



  (window as any).__payloadHex =
    payloadHex;



  return parseLicenseData(
    payload
  );

}