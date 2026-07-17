import type {
  ScanResult,
  DecodedResult
} from "../scanner/types";


import {
  decodeQR
} from "./qr/decoder";


import {
  decodePDF417
} from "./pdf417/decoder";


import {
  decodeSALicense
} from "./saDriversLicence/decoder";







export type DecodeMode =
  | "licence"
  | "pdf417"
  | "qr";









export function decodeBarcode(
  result:ScanResult,
  mode:DecodeMode
):DecodedResult {



  /*
    Driver licence mode

    PDF417 bytes are passed
    into your RSA decoder
  */

  if(
    mode === "licence"
  ){


    if(
      !result.bytes
    ){

      throw new Error(
        "No barcode bytes available"
      );

    }



    return {

      type:"licence",

      data:
        decodeSALicense(
          result.bytes
        )

    };


  }







  /*
    Generic PDF417

    Just return text
  */

  if(
    mode === "pdf417"
  ){


    return decodePDF417(
      result.text
    );


  }







  /*
    QR code

    Return text or JSON
  */

  if(
    mode === "qr"
  ){


    return decodeQR(
      result.text
    );


  }






  throw new Error(
    "Unsupported decoder mode"
  );


}