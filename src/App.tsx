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
    resolve =>
      setTimeout(resolve,ms)
  );

}




function processFrame(
  source:HTMLVideoElement
):ImageData{


  const canvas =
    document.createElement(
      "canvas"
    );


  const scale = 2;


  canvas.width =
    source.videoWidth * scale;


  canvas.height =
    source.videoHeight * scale;



  const ctx =
    canvas.getContext(
      "2d"
    );


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

  return await readBarcodesFromImageData(
    image,
    {
      tryHarder:true,
      maxSymbols:5
    }
  );

}





async function decodeBytes(
  bytes:Uint8Array,
  setData:(x:string)=>void,
  setStatus:(x:string)=>void
){


  try {


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
      "Licence decoded successfully"
    );


  }
  catch(e){

    setStatus(
      "Decode failed: " +
      String(e)
    );

  }

}






function App(){


  const videoRef =
    useRef<HTMLVideoElement>(null);



  const running =
    useRef(true);



  const [
    status,
    setStatus
  ] =
  useState(
    "Starting camera..."
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


    while(
      running.current
    ){


      try{


        if(
          !videoRef.current ||
          videoRef.current.videoWidth===0
        ){

          await sleep(200);
          continue;

        }



        const image =
          processFrame(
            videoRef.current
          );



        const results =
          await scanImage(
            image
          );



        if(
          results.length
        ){


          const bytes = results[0].bytes as Uint8Array | undefined;



          if(bytes){

            await decodeBytes(
              bytes,
              setData,
              setStatus
            );

          }



          running.current =
            false;


          return;

        }


      }
      catch(e){

        console.log(e);

      }



      await sleep(300);

    }

  }







  useEffect(()=>{


    let stream:
      MediaStream|null=null;



    async function start(){


      try{


        stream =
          await navigator.mediaDevices
          .getUserMedia({

            video:{
              facingMode:{
                ideal:
                "environment"
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
          "Camera active - scanning"
        );


        scanLoop();


      }
      catch(e){

        setError(
          String(e)
        );

      }

    }



    start();



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








  async function handleImage(
    e:React.ChangeEvent<HTMLInputElement>
  ){


    const file =
      e.target.files?.[0];


    if(!file)
      return;



    const img =
      new Image();



    img.onload =
    async()=>{


      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        img.width;


      canvas.height =
        img.height;



      const ctx =
        canvas.getContext(
          "2d"
        );


      if(!ctx)
        return;



      ctx.drawImage(
        img,
        0,
        0
      );



      const image =
        ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );



      const results =
        await scanImage(
          image
        );



      if(results.length){

        const bytes = results[0].bytes as Uint8Array;


        await decodeBytes(
          bytes,
          setData,
          setStatus
        );

      }
      else{

        setStatus(
          "No PDF417 found"
        );

      }


    };



    img.src =
      URL.createObjectURL(file);

  }







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



<video

ref={videoRef}

playsInline

muted

style={{
width:"100%",
maxWidth:600,
border:"2px solid black"
}}

/>



<h3>
{status}
</h3>



<input
type="file"
accept="image/*"
capture="environment"
onChange={handleImage}
/>



{
error &&
<p style={{color:"red"}}>
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