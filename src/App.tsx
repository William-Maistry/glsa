import { useState } from "react";
import {
  readBarcodesFromImageData,
} from "@sec-ant/zxing-wasm/reader";


function preprocessImage(
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

  if (!ctx) {
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


  if (mode === 0) {
    return image;
  }


  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

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


    if (mode === 1) {

      // grayscale

      pixels[i] =
        gray;

      pixels[i + 1] =
        gray;

      pixels[i + 2] =
        gray;

    }


    if (mode === 2) {

      // strong contrast

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

  }


  return image;
}



async function decode(
  image: ImageData
) {

  return await readBarcodesFromImageData(
    image,
    {
      tryHarder: true,
      maxSymbols: 5,
    }
  );

}



function App() {

  const [data,setData] =
    useState("");

  const [status,setStatus] =
    useState("");

  const [error,setError] =
    useState("");

  const [debug,setDebug] =
    useState("");



  async function scanImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    try {

      setStatus(
        "Loading image..."
      );

      setData("");
      setError("");
      setDebug("");



      const bitmap =
        await createImageBitmap(
          file
        );



      let results:any[] = [];

      const modes =
        [
          0, // original
          1, // grayscale
          2  // high contrast
        ];



      for (
        let i = 0;
        i < modes.length;
        i++
      ) {

        setStatus(
          `Scanning attempt ${i + 1}/${modes.length}`
        );


        const image =
          preprocessImage(
            bitmap,
            modes[i]
          );


        results =
          await decode(
            image
          );


        if (
          results.length > 0
        ) {
          break;
        }

      }



      if (
        results.length === 0
      ) {

        throw new Error(
          "No barcode detected after multiple attempts"
        );

      }



      const result =
        results[0];



      const bytes =
        result.bytes as
        Uint8Array | undefined;



      const hex =
        bytes
          ? Array.from(bytes)
              .slice(0,150)
              .map(
                (b:number) =>
                  b
                    .toString(16)
                    .padStart(2,"0")
              )
              .join(" ")
          : "NULL";



      setDebug(`

FORMAT:
${result.format}


BYTE LENGTH:
${bytes?.length ?? "NULL"}


HEX START:
${hex}


TEXT LENGTH:
${result.text?.length ?? 0}

`);



      setData(
        result.text
      );


      setStatus(
        "Barcode found!"
      );



    } catch(err) {


      const message =
        err instanceof Error
          ? err.message
          : "Unknown error";


      setError(
        message
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
        margin:"0 auto"
      }}
    >

      <h2>
        South African PDF417 Scanner
      </h2>


      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={scanImage}
      />


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
        Debug
      </h3>


      <pre
        style={{
          background:"#eee",
          padding:10,
          whiteSpace:"pre-wrap",
          fontSize:12
        }}
      >
        {debug}
      </pre>



      <h3>
        Text output
      </h3>


      <textarea
        value={data}
        readOnly
        style={{
          width:"100%",
          height:250,
          fontFamily:"monospace"
        }}
      />


    </div>

  );
}


export default App;