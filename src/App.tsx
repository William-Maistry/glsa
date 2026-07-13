import { useState } from "react";
import {
  readBarcodesFromImageData,
} from "@sec-ant/zxing-wasm/reader";


function App() {
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");


  async function scanImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (!file) return;


    try {

      setStatus("Loading image...");
      setData("");
      setError("");
      setDebug("");


      const bitmap =
        await createImageBitmap(file);


      /*
        Resize large phone images.
        Samsung cameras can produce
        4000px+ images which are unnecessary
        for barcode decoding.
      */

      const maxSize = 1800;

      let width =
        bitmap.width;

      let height =
        bitmap.height;


      if (width > maxSize || height > maxSize) {

        const scale =
          Math.min(
            maxSize / width,
            maxSize / height
          );

        width =
          Math.floor(width * scale);

        height =
          Math.floor(height * scale);
      }


      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = width;
      canvas.height = height;


      const ctx =
        canvas.getContext(
          "2d"
        );


      if (!ctx) {
        throw new Error(
          "Canvas failed"
        );
      }


      ctx.drawImage(
        bitmap,
        0,
        0,
        width,
        height
      );


      const imageData =
        ctx.getImageData(
          0,
          0,
          width,
          height
        );


      setStatus(
        "Scanning barcode..."
      );


      const results =
        await readBarcodesFromImageData(
          imageData,
          {
            tryHarder: true,
            maxSymbols: 5,
          }
        );


      if (
        results.length === 0
      ) {
        throw new Error(
          "No barcode detected"
        );
      }


      const result =
        results[0];


      const bytes =
        result.bytes;


      let hex = "";

      if (bytes) {

        hex =
          Array.from(bytes)
            .map(
              b =>
                b
                  .toString(16)
                  .padStart(2, "0")
            )
            .join(" ");
      }


      const debugOutput = `

FORMAT:
${result.format}


TEXT LENGTH:
${result.text.length}


TEXT:
${result.text}


BYTE LENGTH:
${
  bytes
    ? bytes.length
    : "NULL"
}


FIRST 200 HEX BYTES:
${hex.substring(0, 600)}

`;

      setDebug(
        debugOutput
      );


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


      setDebug(
        "ERROR:\n\n" +
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
        margin:"auto"
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
        Text Output
      </h3>


      <textarea
        value={data}
        readOnly
        style={{
          width:"100%",
          height:200,
          fontFamily:"monospace"
        }}
      />

    </div>

  );
}


export default App;
