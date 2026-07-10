import {
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  PDF417Reader
} from "@zxing/library";


export async function decodePdf417Raw(
  image: HTMLImageElement
) {

  const canvas =
    document.createElement("canvas");


  canvas.width =
    image.naturalWidth;


  canvas.height =
    image.naturalHeight;


  const ctx =
    canvas.getContext("2d");


  if(!ctx)
    throw new Error("No canvas");


  ctx.drawImage(
    image,
    0,
    0
  );


  const imageData =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );


  const luminance =
    new RGBLuminanceSource(
      imageData.data,
      imageData.width,
      imageData.height
    );


  const bitmap =
    new BinaryBitmap(
      new HybridBinarizer(
        luminance
      )
    );


  const reader =
    new PDF417Reader();


  const result =
    reader.decode(bitmap);


  return {

    text:
      result.getText(),


    rawBytes:
      result.getRawBytes(),


    format:
      result.getBarcodeFormat()

  };

}