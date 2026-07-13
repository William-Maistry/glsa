import { useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  BarcodeFormat,
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

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    try {
      setStatus("Reading barcode...");
      setData("");
      setError("");
      setDebug("");

      const hints = new Map();

      hints.set(
        DecodeHintType.POSSIBLE_FORMATS,
        [BarcodeFormat.PDF_417]
      );

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
        `IMAGE SIZE:
${img.width} x ${img.height}

FILE SIZE:
${Math.round(file.size / 1024)} KB

Trying PDF417 decode...`
      );


      const result =
        await reader.decodeFromImageElement(img);


      const raw =
        result.getRawBytes();


      setDebug(
        `FORMAT:
${result.getBarcodeFormat()}

TEXT:
${result.getText()}

RAW BYTES:
${raw ? raw.length : "NULL"}`
      );


      setData(result.getText());
      setStatus("Barcode found!");

    } catch (err) {

      const msg =
        err instanceof Error
          ? err.message
          : "Unknown error";

      setError(msg);

      setDebug(
        `FAILED:

${msg}`
      );

      setStatus("");

    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }


  return (
    <div style={{ padding: 20 }}>
      <h2>PDF417 Test</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={scanImage}
      />

      <p>{status}</p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <h3>Debug</h3>

      <pre>
        {debug}
      </pre>

      <h3>Data</h3>

      <textarea
        value={data}
        readOnly
        style={{
          width: "100%",
          height: 250
        }}
      />
    </div>
  );
}

export default App;