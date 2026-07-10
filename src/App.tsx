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

    if (!file) {
      return;
    }

    try {
      setStatus("Reading barcode...");
      setData("");
      setError("");

      const hints = new Map();

      hints.set(
        DecodeHintType.POSSIBLE_FORMATS,
        [BarcodeFormat.PDF_417]
      );


      const reader =
        new BrowserMultiFormatReader(hints);


      const imageUrl =
        URL.createObjectURL(file);


      const result =
        await reader.decodeFromImageUrl(
          imageUrl
        );


      const text =
        result.getText();


      console.log(
        "PDF417 DATA:",
        text
      );


      setData(text);
      setStatus("Barcode found");


      URL.revokeObjectURL(imageUrl);


    } catch (err) {
      console.error(err);

      setError(
        "Could not read PDF417 barcode from image"
      );

      setStatus("");

    }
  }


  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
      }}
    >

      <h2>
        PDF417 Image Scanner
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
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}


      <h3>
        Decoded Data
      </h3>


      <textarea
        value={data}
        readOnly
        style={{
          width: "100%",
          height: 300,
        }}
      />

    </div>
  );
}

export default App;