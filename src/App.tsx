// import { useState, useEffect, useRef } from "react";
// import {
//   Html5Qrcode,
//   Html5QrcodeScanner
// } from "html5-qrcode";

// import users from "./data/users.json";


// function App() {


//   const [_userId, setUserId] = useState("");
//   const [selectedUser, setSelectedUser] = useState<any>(null);


//   const [idScanResult, setIdScanResult] = useState("");
//   const [idScannerActive, setIdScannerActive] = useState(false);
//   const [idStatus, setIdStatus] = useState("");



//   const qrScannerRef =
//     useRef<any>(null);


//   const idScannerRef =
//     useRef<Html5Qrcode | null>(null);





//   // =================================
//   // EMPLOYEE QR SCANNER
//   // =================================

//   useEffect(() => {


//     const scanner =
//       new Html5QrcodeScanner(

//         "qr-reader",

//         {
//           fps:10,
//           qrbox:250
//         },

//         false

//       );


//     qrScannerRef.current =
//       scanner;



//     scanner.render(

//       (decodedText)=>{


//         setUserId(decodedText);


//         const user =
//           users.find(
//             person =>
//               person.qrCode === decodedText
//           );


//         setSelectedUser(user);


//       },


//       ()=>{}

//     );



//     return ()=>{


//       scanner.clear()
//         .catch(()=>{});


//     };


//   }, []);








//   // =================================
//   // SMART ID SCANNER
//   // =================================

//   const startIdScanner = async()=>{


//     setIdScannerActive(true);


//     setIdStatus(
//       "Starting Smart ID scanner..."
//     );



//     const scanner =
//       new Html5Qrcode(
//         "id-reader"
//       );


//     idScannerRef.current =
//       scanner;



//     try {


//       await scanner.start(

//         {
//           facingMode:
//             "environment"
//         },


//         {


//           fps:25,


//           qrbox:{

//             width:500,

//             height:200

//           }

//         },


//         (decodedText)=>{


//           setIdStatus(
//             "Smart ID barcode detected"
//           );


//           setIdScanResult(
//             decodedText
//           );



//           scanner.stop()
//             .catch(()=>{});


//         },


//         ()=>{

//           setIdStatus(
//             "Searching for barcode..."
//           );

//         }


//       );


//     }
//     catch(error:any){


//       setIdStatus(
//         "Camera error: " +
//         error.message
//       );


//     }


//   };






//   return (

//     <div style={{
//       padding:"30px"
//     }}>


//       <h1>
//         Depot Access Scanner
//       </h1>





//       <h2>
//         Employee QR Scanner
//       </h2>



//       <div id="qr-reader"></div>






//       {
//         selectedUser && (

//           <div>

//             <h3>
//               Employee Found
//             </h3>


//             <p>
//               Name:
//               {" "}
//               {selectedUser.firstName}
//               {" "}
//               {selectedUser.lastName}
//             </p>


//             <p>
//               Company:
//               {" "}
//               {selectedUser.company}
//             </p>


//             <p>
//               Vehicle:
//               {" "}
//               {selectedUser.vehicle || "None"}
//             </p>


//           </div>

//         )
//       }







//       <hr />






//       <h2>
//         South African Smart ID Scanner
//       </h2>


//       <p>
//         Scan the large PDF417 barcode on the back of the ID card.
//       </p>





//       {
//         !idScannerActive && (

//           <button

//             onClick={startIdScanner}

//             style={{

//               padding:"12px",
//               fontSize:"18px"

//             }}

//           >

//             Start ID Scanner

//           </button>

//         )
//       }






//       <p>
//         Status:
//         {" "}
//         {idStatus}
//       </p>





//       <div id="id-reader"></div>







//       {
//         idScanResult && (

//           <div>


//             <h3>
//               Raw Smart ID Result
//             </h3>


//             <textarea

//               value={idScanResult}

//               readOnly

//               style={{

//                 width:"100%",
//                 height:"200px"

//               }}

//             />


//           </div>

//         )
//       }




//     </div>

//   );

// }


// export default App;








import { useEffect, useRef, useState } from "react";
import { BrowserPDF417Reader } from "@zxing/browser";

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  const reader = new BrowserPDF417Reader();

  let stream: MediaStream | null = null;

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    try {
      setError("");

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
          width: {
            ideal: 1920,
          },
          height: {
            ideal: 1080,
          },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        setCameraReady(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Camera failed");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  async function captureAndScan() {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    setError("");
    setResult("");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Use the actual camera resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    // Capture current frame
    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    try {
      const scanResult = await reader.decodeFromCanvas(canvas);

      console.log("PDF417:", scanResult.getText());

      setResult(scanResult.getText());

    } catch (err) {
      console.error(err);
      setError(
        "No PDF417 found. Move closer, improve lighting, and try again."
      );
    }
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      <h1>PDF417 Camera Scanner</h1>

      <div
        style={{
          position: "relative",
          maxWidth: 600,
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            width: "100%",
            height: 450,
            objectFit: "cover",
            background: "black",
            borderRadius: 12,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "10%",
            width: "80%",
            height: 100,
            border: "3px solid red",
            pointerEvents: "none",
          }}
        />
      </div>


      <button
        onClick={captureAndScan}
        disabled={!cameraReady}
        style={{
          marginTop: 20,
          padding: "15px 30px",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        Scan PDF417
      </button>


      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />


      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}


      <h3>Result:</h3>

      <pre
        style={{
          background: "#eee",
          padding: 15,
          whiteSpace: "pre-wrap",
          borderRadius: 8,
        }}
      >
        {result || "Waiting for scan..."}
      </pre>
    </div>
  );
}