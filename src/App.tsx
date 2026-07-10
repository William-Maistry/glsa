import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

interface DriverLicence {
  raw: string;
  idNumber?: string;
  surname?: string;
  names?: string;
  dateOfBirth?: string;
  expiryDate?: string;
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);

  const [scanning, setScanning] = useState(true);
  const [licence, setLicence] = useState<DriverLicence | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const hints = new Map();

    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      [BarcodeFormat.PDF_417]
    );

    const reader = new BrowserMultiFormatReader(hints);

    async function startScanner() {
      try {
        const devices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!devices.length) {
          setError("No camera found");
          return;
        }

        const camera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) ?? devices[0];


        const controls =
          await reader.decodeFromVideoDevice(
            camera.deviceId,
            videoRef.current!,
            (result, _error) => {

              if (result) {
                const rawData = result.getText();

                console.log(
                  "PDF417 RAW DATA:",
                  rawData
                );


                setLicence(
                  parseLicence(rawData)
                );


                setScanning(false);


                controls.stop();
              }
            }
          );


        controlsRef.current = controls;


      } catch (err) {
        console.error(err);

        setError(
          "Camera permission denied or camera unavailable"
        );
      }
    }


    startScanner();


    return () => {
      controlsRef.current?.stop();
    };

  }, []);


  function parseLicence(
    data: string
  ): DriverLicence {

    return {
      raw: data,

      idNumber:
        extractField(data, "DAQ"),

      surname:
        extractField(data, "DCS"),

      names:
        extractField(data, "DAC"),

      dateOfBirth:
        extractField(data, "DBB"),

      expiryDate:
        extractField(data, "DBA"),
    };
  }


  function extractField(
    data: string,
    key: string
  ): string | undefined {

    const position =
      data.indexOf(key);


    if (position === -1) {
      return undefined;
    }


    return data
      .substring(position + key.length)
      .split(/[\r\n]/)[0]
      .trim();
  }


  function restartScanner() {
    window.location.reload();
  }


  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >

      <h1>
        South African Licence Scanner
      </h1>


      {scanning && (
        <>
          <p>
            Point the camera at the PDF417 barcode
          </p>


          <div
            style={{
              maxWidth: 500,
              margin: "auto",
              border: "3px solid green",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >

            <video
              ref={videoRef}
              style={{
                width: "100%",
              }}
            />

          </div>
        </>
      )}



      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}



      {licence && (
        <div
          style={{
            maxWidth: 500,
            margin: "20px auto",
            textAlign: "left",
          }}
        >

          <h2>
            Licence Data
          </h2>


          <p>
            <strong>ID Number:</strong>{" "}
            {licence.idNumber || "Not found"}
          </p>


          <p>
            <strong>Surname:</strong>{" "}
            {licence.surname || "Not found"}
          </p>


          <p>
            <strong>Names:</strong>{" "}
            {licence.names || "Not found"}
          </p>


          <p>
            <strong>Date of Birth:</strong>{" "}
            {licence.dateOfBirth || "Not found"}
          </p>


          <p>
            <strong>Expiry Date:</strong>{" "}
            {licence.expiryDate || "Not found"}
          </p>


          <details>
            <summary>
              Raw PDF417 Data
            </summary>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {licence.raw}
            </pre>

          </details>


          <button
            onClick={restartScanner}
          >
            Scan Another
          </button>

        </div>
      )}

    </div>
  );
}

export default App;