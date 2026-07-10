import {
  BrowserPDF417Reader
} from "@zxing/browser";


export async function decodePdf417Raw(
  image: HTMLImageElement
) {

  const reader =
    new BrowserPDF417Reader();


  const result =
    await reader.decodeFromImageElement(
      image
    );


  return {

    text:
      result.getText(),


    format:
      result.getBarcodeFormat(),


    rawBytes:
      result.getRawBytes
      ? result.getRawBytes()
      : null

  };

}