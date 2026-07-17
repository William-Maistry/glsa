import {
  readBarcodesFromImageData
} from "@sec-ant/zxing-wasm/reader";

import {
  preprocessImage
} from "./preprocess";

import type {
  ScanResult
} from "./types";





async function decodeImage(
  image: ImageData
):Promise<ScanResult[]> {


  const results =
    await readBarcodesFromImageData(
      image,
      {
        tryHarder:true,
        maxSymbols:5
      }
    );



  return results.map(
    result => ({

      format:
        String(result.format),


      text:
        result.text || "",


      bytes:
        result.bytes as Uint8Array

    })
  );

}








export async function scanImage(
  file:File
):Promise<ScanResult[]> {


  const bitmap =
    await createImageBitmap(
      file
    );



  const modes = [

    0, // original

    1, // grayscale

    2, // threshold

    3  // sharpen

  ];




  for(
    let i = 0;
    i < modes.length;
    i++
  ){



    const image =
      preprocessImage(
        bitmap,
        modes[i]
      );



    const results =
      await decodeImage(
        image
      );



    if(
      results.length > 0
    ){

      return results;

    }

  }



  return [];

}