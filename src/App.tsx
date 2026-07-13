import { useState } from "react";
import {
  readBarcodesFromImageData,
} from "@sec-ant/zxing-wasm/reader";


type ScanResult = {
  format: string;
  text: string;
  bytes?: Uint8Array;
  method: string;
};



function createImageData(
  image: HTMLImageElement,
  mode: number
): ImageData {


  const canvas =
    document.createElement("canvas");


  const scale =
    mode >= 10 ? 3 : 2;


  canvas.width =
    image.naturalWidth * scale;


  canvas.height =
    image.naturalHeight * scale;


  const ctx =
    canvas.getContext("2d");


  if (!ctx) {
    throw new Error(
      "Canvas unavailable"
    );
  }


  ctx.drawImage(
    image,
    0,
    0,
    canvas.width,
    canvas.height
  );


  const img =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );


  const pixels =
    img.data;



  // 0 = original
  // 1 = grayscale
  // 2-6 = thresholds


  if(mode === 0){
    return img;
  }



  for(
    let i = 0;
    i < pixels.length;
    i += 4
  ){

    const r =
      pixels[i];

    const g =
      pixels[i+1];

    const b =
      pixels[i+2];


    let gray =
      0.299*r +
      0.587*g +
      0.114*b;



    if(mode === 1){

      pixels[i] =
        gray;

      pixels[i+1] =
        gray;

      pixels[i+2] =
        gray;

    }



    if(
      mode >= 2 &&
      mode <= 6
    ){

      const threshold =
        80 +
        ((mode-2)*25);



      gray =
        gray > threshold
          ? 255
          : 0;



      pixels[i] =
        gray;

      pixels[i+1] =
        gray;

      pixels[i+2] =
        gray;

    }



    if(mode === 7){

      gray =
        Math.min(
          255,
          gray * 1.5
        );


      pixels[i] =
        gray;

      pixels[i+1] =
        gray;

      pixels[i+2] =
        gray;

    }


  }


  return img;

}





async function tryScan(
  imageData: ImageData,
  method:string
):Promise<ScanResult|null>{


  try{


    const results =
      await readBarcodesFromImageData(
        imageData,
        {
          tryHarder:true,
          maxSymbols:5
        }
      );



    if(
      results.length === 0
    ){
      return null;
    }



    const result =
      results[0];



    const bytes =
      result.bytes
      ?
      new Uint8Array(
        result.bytes
      )
      :
      undefined;



    return {

      format:
        result.format,

      text:
        result.text,

      bytes,

      method

    };


  }
  catch{

    return null;

  }

}






async function scanImage(
  file:File
):Promise<ScanResult|null>{


  const url =
    URL.createObjectURL(file);



  try{


    const img =
      new Image();



    img.src =
      url;



    await new Promise(
      resolve =>
        img.onload =
          resolve
    );



    // Different processing attempts

    const modes = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ];



    for(
      const mode of modes
    ){


      const data =
        createImageData(
          img,
          mode
        );



      const result =
        await tryScan(
          data,
          "MODE_" + mode
        );



      if(result){

        return result;

      }


    }



    return null;



  }
  finally{

    URL.revokeObjectURL(url);

  }


}

function App() {


  const [status,setStatus] =
    useState("");

  const [data,setData] =
    useState("");

  const [debug,setDebug] =
    useState("");

  const [error,setError] =
    useState("");




  async function handleFile(
    event:
      React.ChangeEvent<HTMLInputElement>
  ){


    const file =
      event.target.files?.[0];


    if(!file){
      return;
    }



    setStatus(
      "Scanning image..."
    );


    setData("");

    setDebug("");

    setError("");



    try{


      const result =
        await scanImage(
          file
        );



      if(!result){

        throw new Error(
          "No PDF417 barcode detected"
        );

      }



      const bytes =
        result.bytes;



      let hex =
        "NO BYTES";



      if(bytes){


        hex =
          Array.from(bytes)
          .slice(0,200)
          .map(
            (b:number)=>
              b
              .toString(16)
              .padStart(2,"0")
          )
          .join(" ");

      }




      setDebug(`

METHOD:
${result.method}


FORMAT:
${result.format}


BYTE LENGTH:
${bytes?.length ?? "NULL"}


HEX START:
${hex}


TEXT LENGTH:
${result.text.length}

`);




      setData(
        result.text
      );


      setStatus(
        "PDF417 FOUND!"
      );



    }
    catch(err){


      console.error(err);



      setError(
        err instanceof Error
        ?
        err.message
        :
        "Unknown error"
      );


      setStatus("");

    }


  }





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
        South African PDF417 Scanner
      </h2>



      <p>
        Take a clear photo of the barcode,
        then upload it.
      </p>



      <input

        type="file"

        accept="image/*"

        capture="environment"

        onChange={
          handleFile
        }

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
        Debug Information
      </h3>



      <pre
        style={{
          background:"#eee",
          padding:15,
          whiteSpace:"pre-wrap",
          overflowWrap:"break-word"
        }}
      >
        {debug}
      </pre>





      <h3>
        Barcode Text
      </h3>



      <textarea

        value={data}

        readOnly

        style={{
          width:"100%",
          height:300,
          fontFamily:"monospace"
        }}

      />



    </div>

  );

}




export default App;