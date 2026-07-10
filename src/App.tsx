import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
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
  const controlsRef = useRef<IScannerControls | null>(null);

  const [scanning, setScanning] = useState(true);
  const [licence, setLicence] = useState<DriverLicence | null>(null);
  const [error, setError] = useState("");

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

        if (devices.length === 0) {
          setError("No camera detected");
          return;
        }

        const backCamera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) ?? devices[0];


        const controls =
          await reader.decodeFromVideoDevice(
            backCamera.deviceId,
            videoRef.current!,
            (result, _error) => {

              if (result) {
                const data = result.getText();

                console.log(
                  "PDF417 DATA:",
                  data
                );

                setLicence(
                  parseLicence(data)
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
          "Unable to access camera"
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

    const index =
      data.indexOf(key);

    if (index === -1) {
      return undefined;
    }


    return data
      .substring(index + key.length)
      .split(/[\n\r]/)[0]
      .trim();
  }


  function scanAgain() {
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
        SA Driver Licence PDF417 Scanner
      </h1>


      {scanning && (
        <>
          <p>
            Align the PDF417 barcode with the camera
          </p>


          <div
            style={{
              width: "100%",
              maxWidth: 500,
              margin: "auto",
              border: "3px solid green",
              borderRadius: 12,
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
            Licence Details
          </h2>


          <p>
            <b>ID Number:</b>{" "}
            {licence.idNumber ?? "Not found"}
          </p>


          <p>
            <b>Surname:</b>{" "}
            {licence.surname ?? "Not found"}
          </p>


          <p>
            <b>Names:</b>{" "}
            {licence.names ?? "Not found"}
          </p>


          <p>
            <b>Date of Birth:</b>{" "}
            {licence.dateOfBirth ?? "Not found"}
          </p>


          <p>
            <b>Expiry Date:</b>{" "}
            {licence.expiryDate ?? "Not found"}
          </p>


          <details>
            <summary>
              Raw Barcode Data
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
            onClick={scanAgain}
          >
            Scan Another Licence
          </button>

        </div>
      )}

    </div>
  );
}

export default App;