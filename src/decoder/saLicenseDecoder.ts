import { rsaDecryptBlock } from "./rsa";
import { parseLicenseData } from "./parser";
import type { SALicenseData } from "./types";


function bytesToAscii(bytes: Uint8Array): string {

  let result = "";

  for (const b of bytes) {

    if (b >= 32 && b <= 126) {
      result += String.fromCharCode(b);
    }

  }

  return result;

}



export function decodeSALicense(
  bytes: Uint8Array
): SALicenseData {


  if (bytes.length !== 720) {
    throw new Error(
      `Invalid barcode length ${bytes.length}`
    );
  }



  const version =
    bytes[1] === 0xe1
    ? 1
    : 2;



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



  blocks.forEach((block,index)=>{


    const result =
      rsaDecryptBlock(
        block,
        version
      );


    debug +=
    `\nBLOCK ${index}\n`;


    debug +=
    Array.from(result)
    .map(
      b =>
      b.toString(16)
      .padStart(2,"0")
    )
    .join(" ");



    const merged =
      new Uint8Array(
        decrypted.length +
        result.length
      );


    merged.set(
      decrypted
    );


    merged.set(
      result,
      decrypted.length
    );


    decrypted =
      merged;


  });



  (window as any).__blockDebug =
    debug;



  /*
      Remove RSA header
  */

  const payload =
    decrypted.slice(16);



  const rawString =
    bytesToAscii(
      payload
    );



  (window as any).__rawBarcodeString =
    rawString;



  return parseLicenseData(
    rawString
  );

}