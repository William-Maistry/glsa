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
      setTimeout(resolve, ms)
  );

}




function processFrame(
  source:HTMLVideoElement
):ImageData {


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    source.videoWidth;


  canvas.height =
    source.videoHeight;



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
  image:ImageData,
  setDebug:(x:string)=>void
){


  const results =
    await readBarcodesFromImageData(
      image,
      {
        tryHarder:true,
        maxSymbols:10
      }
    );



  setDebug(
    `ZXing detected: ${results.length} barcode(s)\n` +
    `Bytes: ${
      results[0]?.bytes?.length ?? 0
    }`
  );



  return results;

}








async function tryDecode(
  bytes:Uint8Array,
  setData:(x:string)=>void,
  setStatus:(x:string)=>void,
  setDebug:(x:string)=>void
):Promise<boolean>{


  try{


    const decoded =
      decodeSALicense(
        bytes
      );



    setDebug(
      (window as any).__licenseDebug ||
      "No parser debug data"
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



    return true;


  }
  catch(e){


    setDebug(
      "Decode error:\n" +
      String(e)
    );


    return false;

  }

}









function App(){


  const videoRef =
    useRef<HTMLVideoElement>(null);



  const running =
    useRef(true);



  const busy =
    useRef(false);




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
    debug,
    setDebug
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
          videoRef.current.videoWidth === 0
        ){

          await sleep(200);
          continue;

        }



        if(busy.current){

          await sleep(50);
          continue;

        }



        busy.current=true;



        const image =
          processFrame(
            videoRef.current
          );



        const results =
          await scanImage(
            image,
            setDebug
          );



        busy.current=false;




        for(
          const result of results
        ){


          const bytes =
            result.bytes as Uint8Array;



          const success =
            await tryDecode(
              bytes,
              setData,
              setStatus,
              setDebug
            );



          if(success){

            running.current=false;
            return;

          }

        }


      }
      catch(e){


        busy.current=false;


        setDebug(
          String(e)
        );

      }




      await sleep(100);

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
        "Camera active - align barcode"
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



  setStatus(
    "Processing image..."
  );



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
        image,
        setDebug
      );



    for(
      const result of results
    ){


      const bytes =
        result.bytes as Uint8Array;



      const success =
        await tryDecode(
          bytes,
          setData,
          setStatus,
          setDebug
        );



      if(success)
        return;

    }



    setStatus(
      "Barcode found but decode failed"
    );


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
border:"3px solid black"
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





<h3>
Parser Debug
</h3>


<pre
style={{
background:"#ddd",
padding:15,
whiteSpace:"pre-wrap"
}}
>
{debug}
</pre>



</div>

);


}


export default App;