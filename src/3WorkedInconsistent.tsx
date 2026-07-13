import { useState } from "react";
import {
  readBarcodesFromImageFile,
} from "@sec-ant/zxing-wasm/reader";

function App() {
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");

  async function scanImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setStatus("Scanning...");
      setData("");
      setError("");
      setDebug("");


      const results =
        await readBarcodesFromImageFile(
          file,
          {
            tryHarder: true,
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


      const debugInfo = `
FORMAT:
${result.format}

TEXT:
${result.text}

BYTES:
${
  result.bytes
    ? result.bytes.length + " bytes"
    : "NULL"
}

ERROR:
${result.error ?? "none"}
`;

      setDebug(debugInfo);

      setData(
        result.text
      );

      setStatus(
        "Barcode found!"
      );


    } catch (err) {

      const message =
        err instanceof Error
          ? err.message
          : "Unknown error";


      setError(message);

      setDebug(
        "ERROR:\n\n" + message
      );

      setStatus("");

    }
  }


  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >

      <h2>
        ZXing WASM PDF417 Scanner
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


      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}


      <h3>
        Debug
      </h3>


      <pre
        style={{
          background: "#eee",
          padding: 10,
          whiteSpace: "pre-wrap",
        }}
      >
        {debug}
      </pre>


      <h3>
        Decoded Data
      </h3>


      <textarea
        value={data}
        readOnly
        style={{
          width: "100%",
          height: 300,
          fontFamily: "monospace",
        }}
      />

    </div>
  );
}

export default App;