import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);

  const [data, setData] = useState<string>("");
  const [status, setStatus] = useState<string>("Starting camera...");
  const [error, setError] = useState<string>("");


  useEffect(() => {
    const startScanner = async () => {
      try {
        const hints = new Map();

        hints.set(
          DecodeHintType.POSSIBLE_FORMATS,
          [BarcodeFormat.PDF_417]
        );

        const reader = new BrowserMultiFormatReader(hints);

        const devices =
          await BrowserMultiFormatReader.listVideoInputDevices();


        if (devices.length === 0) {
          setError("No camera found");
          return;
        }


        const camera =
          devices.find((d) =>
            d.label.toLowerCase().includes("back")
          ) || devices[0];


        setStatus("Scanning...");


        const controls =
          await reader.decodeFromVideoDevice(
            camera.deviceId,
            videoRef.current!,
            (result, _err) => {

              if (result) {
                const text = result.getText();

                console.log("BARCODE DATA:", text);

                setData(text);
                setStatus("Barcode found");

                controls.stop();
              }

            }
          );


        controlsRef.current = controls;


      } catch (e) {
        console.error(e);
        setError(
          "Camera error: " + String(e)
        );
      }
    };


    startScanner();


    return () => {
      controlsRef.current?.stop();
    };

  }, []);



  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
      }}
    >

      <h2>PDF417 Scanner Test</h2>

      <p>{status}</p>


      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}


      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxWidth: 500,
          border: "2px solid black",
        }}
      />


      <h3>Decoded Data:</h3>

      <textarea
        value={data}
        readOnly
        style={{
          width: "100%",
          height: 300,
          fontSize: 14,
        }}
      />


    </div>
  );
}

export default App;