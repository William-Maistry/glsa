import { useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  DecodeHintType,
} from "@zxing/library";

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

    const imageUrl = URL.createObjectURL(file);

    try {
      setStatus("Reading barcode...");
      setData("");
      setError("");
      setDebug("");

      const hints = new Map();

      hints.set(
        DecodeHintType.TRY_HARDER,
        true
      );

      const reader =
        new BrowserMultiFormatReader(hints);


      const img = new Image();

      img.src = imageUrl;


      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });


      setDebug(
        `IMAGE:
${img.width} x ${img.height}

Trying all barcode formats...`
      );


      const result =
        await reader.decodeFromImageElement(img);


      const text =
        result.getText();


      const rawBytes =
        result.getRawBytes();


      const debugInfo = `
FORMAT:
${result.getBarcodeFormat()}

TEXT LENGTH:
${text.length}

TEXT:
${text}

RAW BYTES:
${
  rawBytes
    ? rawBytes.length + " bytes"
    : "NULL"
}
`;

      setDebug(debugInfo);

      setData(text);

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

    } finally {

      URL.revokeObjectURL(imageUrl);

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
        South African Barcode Scanner
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