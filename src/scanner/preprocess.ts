export function preprocessImage(
  source: ImageBitmap,
  mode: number
): ImageData {


  const canvas =
    document.createElement("canvas");


  const scale = 2;


  canvas.width =
    source.width * scale;


  canvas.height =
    source.height * scale;



  const ctx =
    canvas.getContext("2d");


  if(!ctx){

    throw new Error(
      "Canvas unavailable"
    );

  }



  ctx.drawImage(
    source,
    0,
    0,
    canvas.width,
    canvas.height
  );



  const image =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );



  const pixels =
    image.data;



  /*
    Mode 0:
    Original image
  */

  if(mode === 0){

    return image;

  }




  for(
    let i = 0;
    i < pixels.length;
    i += 4
  ){


    const r =
      pixels[i];


    const g =
      pixels[i + 1];


    const b =
      pixels[i + 2];



    let gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;



    /*
      Mode 1:
      Grayscale
    */

    if(mode === 1){


      pixels[i] =
        gray;


      pixels[i + 1] =
        gray;


      pixels[i + 2] =
        gray;


    }




    /*
      Mode 2:
      High contrast
    */

    if(mode === 2){


      gray =
        gray > 140
        ? 255
        : 0;



      pixels[i] =
        gray;


      pixels[i + 1] =
        gray;


      pixels[i + 2] =
        gray;


    }





    /*
      Mode 3:
      Slight sharpening
    */

    if(mode === 3){


      const contrast =
        (gray - 128) * 1.5 + 128;



      const value =
        Math.max(
          0,
          Math.min(
            255,
            contrast
          )
        );



      pixels[i] =
        value;


      pixels[i + 1] =
        value;


      pixels[i + 2] =
        value;


    }


  }



  return image;

}