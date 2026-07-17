import {
  readBarcodesFromImageData
} from "@sec-ant/zxing-wasm/reader";

import type {
  ScanResult
} from "./types";





function captureFrame(
  video:HTMLVideoElement
):ImageData {


  const canvas =
    document.createElement("canvas");



  canvas.width =
    video.videoWidth;


  canvas.height =
    video.videoHeight;



  const ctx =
    canvas.getContext("2d");



  if(!ctx){

    throw new Error(
      "Canvas unavailable"
    );

  }



  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );



  return ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

}







async function scanFrame(
  image:ImageData
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








export async function startCameraScanner(
  video:HTMLVideoElement,
  onResult:(result:ScanResult)=>void,
  running:{
    current:boolean
  }
){



  const stream =
    await navigator.mediaDevices
    .getUserMedia({

      video:{

        facingMode:{
          ideal:"environment"
        },

        width:{
          ideal:1920
        },

        height:{
          ideal:1080
        }

      },

      audio:false

    });





  video.srcObject =
    stream;



  await video.play();



  running.current =
    true;





  while(
    running.current
  ){


    try{


      if(
        video.videoWidth === 0
      ){

        await delay(200);

        continue;

      }





      const image =
        captureFrame(
          video
        );



      const results =
        await scanFrame(
          image
        );



      if(
        results.length > 0
      ){


        onResult(
          results[0]
        );


        return;

      }


    }
    catch(e){

      console.error(e);

    }



    await delay(100);

  }

}







export function stopCameraScanner(
  video:HTMLVideoElement,
  running:{
    current:boolean
  }
){


  running.current =
    false;



  const stream =
    video.srcObject as MediaStream|null;



  if(stream){


    stream
    .getTracks()
    .forEach(
      track =>
        track.stop()
    );


    video.srcObject =
      null;

  }

}








function delay(
  ms:number
){

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}