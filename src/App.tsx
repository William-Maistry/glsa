import { useEffect, useRef, useState } from "react";
import {
  readBarcodesFromImageData,
} from "@sec-ant/zxing-wasm/reader";

import { decodeSALicense } from "./decoder/saLicenseDecoder";


function processFrame(
  source: HTMLVideoElement,
  mode: number
): ImageData {

  const canvas =
    document.createElement("canvas");

  const scale = 2;

  canvas.width =
    source.videoWidth * scale;

  canvas.height =
    source.videoHeight * scale;


  const ctx =
    canvas.getContext("2d");


  if (!ctx) {
    throw new Error("Canvas error");
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


  if(mode===0){
    return image;
  }


  const pixels =
    image.data;


  for(
    let i=0;
    i<pixels.length;
    i+=4
  ){

    let gray =
      0.299*pixels[i] +
      0.587*pixels[i+1] +
      0.114*pixels[i+2];


    if(mode===1){

      pixels[i]=gray;
      pixels[i+1]=gray;
      pixels[i+2]=gray;

    }


    if(mode===2){

      gray =
        gray > 140
        ? 255
        : 0;


      pixels[i]=gray;
      pixels[i+1]=gray;
      pixels[i+2]=gray;

    }

  }


  return image;

}



async function scanFrame(
 image:ImageData
){

 return await readBarcodesFromImageData(
   image,
   {
     tryHarder:true,
     maxSymbols:5
   }
 );

}




function App(){

 const videoRef =
 useRef<HTMLVideoElement>(null);


 const running =
 useRef(true);



 const [status,setStatus]=
 useState(
  "Starting camera..."
 );


 const [data,setData]=
 useState("");


 const [debug,setDebug]=
 useState("");


 const [error,setError]=
 useState("");



 useEffect(()=>{


 let stream:
 MediaStream|null=null;



 async function startCamera(){


  try{


   stream =
   await navigator.mediaDevices.getUserMedia({

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



   if(videoRef.current){

    videoRef.current.srcObject =
    stream;


    await videoRef.current.play();

   }


   setStatus(
    "Camera active - scanning..."
   );


   scanLoop();


  }
  catch(e){

   setError(
    String(e)
   );

  }


 }



 async function scanLoop(){


 while(running.current){


  try{


   if(
    !videoRef.current ||
    videoRef.current.videoWidth===0
   ){

    await sleep(200);
    continue;

   }



   for(
    let mode=0;
    mode<3;
    mode++
   ){


    const image =
    processFrame(
     videoRef.current,
     mode
    );



    const results =
    await scanFrame(
     image
    );



    if(results.length){


     const result =
     results[0];


     const bytes =
     result.bytes as Uint8Array | undefined;



     const hex =
     bytes
     ?
     Array.from(bytes)
     .slice(0,120)
     .map(
       (b:number)=>
       b
       .toString(16)
       .padStart(2,"0")
     )
     .join(" ")
     :
     "NO BYTES";



     setDebug(`

FORMAT:
${result.format}


BYTE LENGTH:
${bytes?.length}


HEX START:
${hex}

TEXT LENGTH:
${result.text?.length}

`);




     if(bytes){


      try{


       const decoded =
       decodeSALicense(
        bytes
       );


       setData(
        JSON.stringify(
         decoded,
         null,
         2
        )
       );


       setStatus(
        "LICENSE DECODED"
       );


      }
      catch(err){


       setError(
        "Decoder error: "+
        String(err)
       );


       setData(
        result.text || ""
       );

      }


     }



     running.current=false;

     return;


    }


   }



  }
  catch(e){

   console.log(e);

  }



  await sleep(300);


 }


 }



 startCamera();



 return()=>{


  running.current=false;


  if(stream){

   stream
   .getTracks()
   .forEach(
    t=>t.stop()
   );

  }

 };


 },[]);



 return (

 <div
 style={{
  padding:20,
  fontFamily:"Arial"
 }}
 >

 <h2>
 SA PDF417 License Scanner
 </h2>


 <video

 ref={videoRef}

 style={{
  width:"100%",
  maxWidth:600,
  border:"2px solid black"
 }}

 playsInline
 muted

 />


 <h3>
 {status}
 </h3>



 {
 error &&
 <pre
 style={{
  color:"red"
 }}
 >
 {error}
 </pre>
 }



 <h3>
 Debug
 </h3>


 <pre
 style={{
  background:"#eee",
  padding:10,
  whiteSpace:"pre-wrap"
 }}
 >
 {debug}
 </pre>



 <h3>
 Result
 </h3>


 <textarea

 value={data}

 readOnly

 style={{
  width:"100%",
  height:300
 }}

 />


 </div>

 );

}



function sleep(
 ms:number
){

 return new Promise(
  resolve=>
  setTimeout(
   resolve,
   ms
  )
 );

}


export default App;
