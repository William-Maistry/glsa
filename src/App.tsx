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
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  let controls: any;
  const reader = new BrowserPDF417Reader();

  async function startCamera() {
    try {
      setError("");

      controls = await reader.decodeFromConstraints(
        {
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
        videoRef.current!,
        (scanResult) => {
          if (scanResult) {
            console.log("Camera result:", scanResult.getText());
            setResult(scanResult.getText());
          }
        }
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  function stopCamera() {
    if (controls) {
      controls.stop();
    }
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
    setError("");

    try {
      const img = new Image();

      img.onload = async () => {
        try {
          const result = await reader.decodeFromImageElement(img);

          console.log("Image result:", result.getText());
          setResult(result.getText());
        } catch (err: any) {
          console.error(err);
          setError("No PDF417 barcode found in image");
        }
      };

      img.src = imageUrl;
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>PDF417 Scanner</h1>

      <h3>Camera Scanner</h3>

      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          width: "100%",
          maxWidth: 600,
          height: 400,
          objectFit: "cover",
          background: "black",
        }}
      />

      <hr />

      <h3>Scan From Image</h3>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {image && (
        <img
          ref={imageRef}
          src={image}
          alt="Uploaded"
          style={{
            width: "100%",
            maxWidth: 600,
            marginTop: 20,
          }}
        />
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <h3>Result</h3>

      <pre
        style={{
          background: "#eee",
          padding: 15,
          whiteSpace: "pre-wrap",
        }}
      >
        {result || "Waiting..."}
      </pre>
    </div>
  );
}