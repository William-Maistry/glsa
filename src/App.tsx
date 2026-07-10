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
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls: any;

    const startScanner = async () => {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      const backCamera =
        devices.find((device) =>
          device.label.toLowerCase().includes("back")
        ) ?? devices[0];

      controls = await codeReader.decodeFromVideoDevice(
        backCamera?.deviceId,
        videoRef.current!,
        (result, _error) => {
          if (result) {
            setResult(result.getText());
          }
        }
      );
    };

    startScanner();

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: "100%" }}
        muted
        playsInline
      />

      <p>Scanned:</p>
      <pre>{result}</pre>
    </div>
  );
}