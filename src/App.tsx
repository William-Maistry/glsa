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







import { useState } from "react";
import { BrowserPDF417Reader } from "@zxing/browser";

interface IDData {
  surname: string;
  names: string;
  sex: string;
  nationality: string;
  idNumber: string;
  dateOfBirth: string;
  countryOfBirth: string;
  dateOfIssue: string;
  controlNumber: string;
  barcodeReference: string;
}

export default function App() {
  const [data, setData] = useState<IDData | null>(null);
  const [error, setError] = useState("");

  const reader = new BrowserPDF417Reader();

  async function handlePhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const img = new Image();

    img.onload = async () => {
      try {
        const result =
          await reader.decodeFromImageElement(img);

        const raw = result.getText();

        console.log("RAW PDF417:");
        console.log(raw);

        const fields = raw.split("|");

        const id: IDData = {
          surname: fields[0] ?? "",
          names: fields[1] ?? "",
          sex: fields[2] ?? "",
          nationality: fields[3] ?? "",
          idNumber: fields[4] ?? "",
          dateOfBirth: fields[5] ?? "",
          countryOfBirth: fields[6] ?? "",
          dateOfIssue: fields[7] ?? "",
          controlNumber: fields[8] ?? "",
          barcodeReference: fields[9] ?? "",
        };

        setData(id);

      } catch (err) {
        console.error(err);
        setError("Could not read PDF417 barcode");
      }
    };

    img.src = URL.createObjectURL(file);
  }


  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <h1>
        ID Scanner
      </h1>


      <label
        style={{
          display: "block",
          padding: 15,
          background: "#2563eb",
          color: "white",
          textAlign: "center",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Scan ID Card

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          style={{
            display: "none",
          }}
        />
      </label>


      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}


      {data && (
        <div
          style={{
            marginTop: 25,
            padding: 20,
            borderRadius: 12,
            background: "#f4f4f4",
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
          }}
        >

          <h2>
            Personal Information
          </h2>

          <Info
            label="Surname"
            value={data.surname}
          />

          <Info
            label="Names"
            value={data.names}
          />

          <Info
            label="Sex"
            value={data.sex}
          />

          <Info
            label="Nationality"
            value={data.nationality}
          />


          <h2>
            Identity Details
          </h2>

          <Info
            label="ID Number"
            value={data.idNumber}
          />

          <Info
            label="Date of Birth"
            value={data.dateOfBirth}
          />

          <Info
            label="Country of Birth"
            value={data.countryOfBirth}
          />


          <h2>
            Document Details
          </h2>

          <Info
            label="Date of Issue"
            value={data.dateOfIssue}
          />

          <Info
            label="Control Number"
            value={data.controlNumber}
          />

          <Info
            label="Barcode Reference"
            value={data.barcodeReference}
          />

        </div>
      )}
    </div>
  );
}


function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #ddd",
      }}
    >
      <strong>
        {label}
      </strong>

      <span>
        {value}
      </span>
    </div>
  );
}