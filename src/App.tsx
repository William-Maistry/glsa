import {
  useEffect,
  useRef,
  useState
} from "react";


import {
  scanImage
} from "./scanner/scanImage";


import {
  startCameraScanner,
  stopCameraScanner
} from "./scanner/scanCamera";


import {
  decodeBarcode
} from "./decoders/router";


import type {
  ScannerMode
} from "./scanner/types";







function App(){


  const videoRef =
    useRef<HTMLVideoElement>(null);



  const cameraRunning =
    useRef({
      current:false
    });




  const [
    mode,
    setMode
  ] =
  useState<ScannerMode>(
    "licence"
  );



  const [
    status,
    setStatus
  ] =
  useState(
    "Ready"
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







async function processResult(
  result:any
){


  try{


    const decoded =
      decodeBarcode(
        result,
        mode
      );



    setData(
      JSON.stringify(
        decoded,
        null,
        2
      )
    );



    setStatus(
      "Decoded successfully"
    );


  }
  catch(e){


    setError(
      e instanceof Error
      ? e.message
      : String(e)
    );


  }


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
    "Scanning image..."
  );


  setData("");

  setError("");



  try{


    const results =
      await scanImage(
        file
      );



    if(
      results.length === 0
    ){

      throw new Error(
        "No barcode detected"
      );

    }



    await processResult(
      results[0]
    );


  }
  catch(e){


    setError(
      e instanceof Error
      ? e.message
      : String(e)
    );


    setStatus(
      ""
    );

  }


}









async function startQRScanner(){


  if(
    !videoRef.current
  ){

    return;

  }



  setStatus(
    "QR live scanning..."
  );



  setError("");



  try{


    await startCameraScanner(

      videoRef.current,

      async(result)=>{


        await processResult(
          result
        );


        stopQRScanner();


      },

      cameraRunning.current

    );


  }
  catch(e){


    setError(
      e instanceof Error
      ? e.message
      : String(e)
    );


  }


}








function stopQRScanner(){


  if(
    videoRef.current
  ){


    stopCameraScanner(

      videoRef.current,

      cameraRunning.current

    );


  }


}








useEffect(()=>{


  return ()=>{

    stopQRScanner();

  };


},[]);








return (

<div

style={{

padding:20,

fontFamily:"Arial",

maxWidth:900,

margin:"auto"

}}

>


<h2>
South African Document Scanner
</h2>







<h3>
Scanner Type
</h3>



<select

value={mode}

onChange={
e => {

setMode(
e.target.value as ScannerMode
);

setData("");

setStatus(
"Ready"
);

}

}

>


<option value="licence">
Driver Licence
</option>


<option value="pdf417">
Smart ID Card
</option>


<option value="qr">
QR Code
</option>


</select>









<h3>
Scan With Phone Camera
</h3>


<p>
Use this option to take a photo of the document.
</p>


<input

type="file"

accept="image/*"

capture="environment"

onChange={handleImage}

/>










{
mode === "qr" &&

<>


<h3>
QR Live Scanner
</h3>



<button
onClick={startQRScanner}
>
Start Live QR Scanner
</button>



<button

onClick={stopQRScanner}

style={{

marginLeft:10

}}

>
Stop QR Scanner
</button>





<video

ref={videoRef}

playsInline

muted

style={{

width:"100%",

maxWidth:600,

marginTop:20,

border:"2px solid black"

}}

/>



</>

}









<h3>
Upload From Files
</h3>



<input

type="file"

accept="image/*"

onChange={handleImage}

/>









<h3>
Status
</h3>


<p>
{status}
</p>








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