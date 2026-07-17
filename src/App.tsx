import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  readBarcodesFromImageData
} from "@sec-ant/zxing-wasm/reader";

import {
  decodeSALicense
} from "./decoder/saLicenseDecoder";



function sleep(ms:number){
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}




function processFrame(
  source:HTMLVideoElement
):ImageData {


  const canvas =
    document.createElement("canvas");


  canvas.width =
    source.videoWidth;


  canvas.height =
    source.videoHeight;



  const ctx =
    canvas.getContext("2d");


  if(!ctx){

    throw new Error(
      "Canvas error"
    );

  }



  ctx.drawImage(
    source,
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






async function scanImage(
  image:ImageData
){

  const results =
    await readBarcodesFromImageData(
      image,
      {
        tryHarder:true,
        maxSymbols:1
      }
    );


  return results;

}






async function tryDecode(
  bytes:Uint8Array,
  setData:(x:string)=>void,
  setStatus:(x:string)=>void
):Promise<boolean>{


  try{


    const decoded =
      decodeSALicense(bytes);



    setData(
      JSON.stringify(
        decoded,
        null,
        2
      )
    );



    setStatus(
      "Licence decoded successfully"
    );



    return true;


  }
  catch(e){


    const message =
      e instanceof Error
      ? e.message
      : String(e);



    setStatus(
      "Decode failed: " + message
    );


    return false;

  }

}


function App(){


  const videoRef =
    useRef<HTMLVideoElement>(null);


  const running =
    useRef(false);


  const busy =
    useRef(false);


  const streamRef =
    useRef<MediaStream|null>(null);




  const [
    status,
    setStatus
  ] =
  useState(
    "Choose a scan method"
  );



  const [
    data,
    setData
  ] =
  useState("");



  const [
    error,
    setError
  ] =
  useState("");







  async function scanLoop(){


    while(running.current){


      try{


        if(
          !videoRef.current ||
          videoRef.current.videoWidth === 0
        ){

          await sleep(200);
          continue;

        }



        if(busy.current){

          await sleep(50);
          continue;

        }



        busy.current = true;



        const image =
          processFrame(
            videoRef.current
          );



        const results =
          await scanImage(
            image
          );



        busy.current = false;



        for(const result of results){


          const bytes =
            result.bytes as Uint8Array;



          if(!bytes){
            continue;
          }




          const success =
            await tryDecode(
              bytes,
              setData,
              setStatus
            );



          if(success){

            stopCamera();

            return;

          }

        }


      }
      catch(e){


        busy.current = false;


        setStatus(
          String(e)
        );


      }



      await sleep(100);

    }

  }









  async function startCamera(){


    try{


      setError("");



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



      streamRef.current =
        stream;



      if(videoRef.current){

        videoRef.current.srcObject =
          stream;


        await videoRef.current.play();

      }



      running.current = true;



      setStatus(
        "Live camera scanning..."
      );



      scanLoop();


    }
    catch(e){


      setError(
        String(e)
      );

    }

  }








  function stopCamera(){


    running.current = false;



    if(streamRef.current){


      streamRef.current
      .getTracks()
      .forEach(
        t=>t.stop()
      );


      streamRef.current = null;

    }

  }







  async function scanMultipleCrops(
    img:HTMLImageElement
  ){


    const canvas =
      document.createElement("canvas");



    let width =
      img.width;


    let height =
      img.height;



    const maxWidth = 1600;



    if(width > maxWidth){


      const scale =
        maxWidth / width;


      width =
        Math.floor(
          width * scale
        );


      height =
        Math.floor(
          height * scale
        );

    }



    canvas.width =
      width;


    canvas.height =
      height;



    const ctx =
      canvas.getContext("2d");



    if(!ctx){

      return [];

    }



    ctx.drawImage(
      img,
      0,
      0,
      width,
      height
    );



    const crops = [

      {
        y:0,
        h:0.55
      },

      {
        y:0.10,
        h:0.60
      },

      {
        y:0.20,
        h:0.70
      }

    ];



    for(const crop of crops){


      const cropCanvas =
        document.createElement("canvas");



      cropCanvas.width =
        width;



      cropCanvas.height =
        Math.floor(
          height * crop.h
        );



      const cropCtx =
        cropCanvas.getContext("2d");



      if(!cropCtx){

        continue;

      }



      cropCtx.drawImage(
        canvas,
        0,
        Math.floor(
          height * crop.y
        ),
        width,
        Math.floor(
          height * crop.h
        ),
        0,
        0,
        width,
        Math.floor(
          height * crop.h
        )
      );



      const image =
        cropCtx.getImageData(
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );



      const results =
        await scanImage(
          image
        );



      if(results.length > 0){

        return results;

      }


    }



    return [];

  }



  async function handleImage(
  e:React.ChangeEvent<HTMLInputElement>
){


  const file =
    e.target.files?.[0];



  if(!file){

    return;

  }



  setStatus(
    "Processing image..."
  );



  const img =
    new Image();



  img.onload =
  async()=>{


    const results =
      await scanMultipleCrops(
        img
      );



    if(results.length === 0){


      setStatus(
        "No PDF417 barcode detected"
      );


      return;

    }



    for(const result of results){


      const bytes =
        result.bytes as Uint8Array;



      if(!bytes){

        continue;

      }



      const success =
        await tryDecode(
          bytes,
          setData,
          setStatus
        );



      if(success){

        return;

      }


    }



    setStatus(
      "PDF417 detected but decoding failed"
    );


  };



  img.src =
    URL.createObjectURL(file);

}








useEffect(()=>{


  return ()=>{

    stopCamera();

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
South African Licence Scanner
</h2>





<h3>
1. Live Camera Scanner
</h3>


<button
onClick={startCamera}
>
Start Live Scanner
</button>



<button
onClick={stopCamera}
style={{
marginLeft:10
}}
>
Stop
</button>





<br/>
<br/>





<h3>
2. Take Photo Using Phone Camera
</h3>


<input
type="file"
accept="image/*"
capture="environment"
onChange={handleImage}
/>






<h3>
3. Choose Existing Image / File
</h3>


<input
type="file"
accept="image/*"
onChange={handleImage}
/>







<br/>
<br/>






<video

ref={videoRef}

playsInline

muted

style={{
width:"100%",
maxWidth:600,
border:"3px solid black"
}}

/>








<h3>
{status}
</h3>






{
error &&
<p
style={{
color:"red"
}}
>
{error}
</p>
}








<h3>
Decoded Data
</h3>




<pre
style={{
background:"#eee",
padding:15,
whiteSpace:"pre-wrap"
}}
>
{data}
</pre>







</div>

);

}


export default App;