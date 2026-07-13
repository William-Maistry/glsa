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

      const hints = new Map();

      hints.set(
        DecodeHintType.POSSIBLE_FORMATS,
        [BarcodeFormat.PDF_417]
      );

      // Spend more time looking for difficult PDF417 barcodes
      hints.set(
        DecodeHintType.TRY_HARDER,
        true
      );

      const reader =
        new BrowserMultiFormatReader(hints);

      const result =
        await reader.decodeFromImageUrl(imageUrl);

      console.log("========== RESULT ==========");
      console.dir(result);

      console.log("TEXT:");
      console.log(result.getText());

      console.log("RAW BYTES:");
      console.log(result.getRawBytes());

      console.log("FORMAT:");
      console.log(result.getBarcodeFormat());

      const rawBytes = result.getRawBytes();

      if (rawBytes) {
        console.log(
          "RAW BYTE ARRAY:",
          Array.from(rawBytes)
        );
      } else {
        console.log(
          "No raw bytes returned."
        );
      }

      setData(result.getText());
      setStatus("Barcode found!");

    } catch (err) {
      console.error("ZXing Error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not decode PDF417 barcode."
        );
      }

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
      <h2>PDF417 Image Scanner</h2>

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

      <h3>Decoded Data</h3>

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