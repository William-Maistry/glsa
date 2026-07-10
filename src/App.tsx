import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType
} from "@zxing/library";

import users from "./data/users.json";


function App() {


  const [_userId, setUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);


  const [smartIdResult, setSmartIdResult] = useState("");
  const [idScannerActive, setIdScannerActive] = useState(false);
  const [idStatus, setIdStatus] = useState("");



  const qrScannerRef = useRef<any>(null);
  const idVideoRef = useRef<HTMLVideoElement | null>(null);





  // =================================
  // EMPLOYEE QR SCANNER
  // =================================

  useEffect(() => {


    const scanner =
      new Html5QrcodeScanner(
        "qr-reader",
        {
          fps:10,
          qrbox:250
        },
        false
      );


    qrScannerRef.current = scanner;



    scanner.render(

      (decodedText)=>{


        setUserId(decodedText);



        const user =
          users.find(
            person =>
              person.qrCode === decodedText
          );



        setSelectedUser(user);


      },


      ()=>{}

    );



    return ()=>{


      scanner.clear()
        .catch(()=>{});


    };


  }, []);







  // =================================
  // SMART ID BARCODE SCANNER
  // =================================

  const startSmartIdScanner = async()=>{


    setIdScannerActive(true);

    setIdStatus(
      "Starting Smart ID scanner..."
    );



    const hints = new Map();



    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      [
        BarcodeFormat.PDF_417,
        BarcodeFormat.CODE_39
      ]
    );


    hints.set(
      DecodeHintType.TRY_HARDER,
      true
    );



    const reader =
      new BrowserMultiFormatReader(
        hints
      );



    try {


      await reader.decodeFromVideoDevice(

        undefined,

        idVideoRef.current!,

        (result, _error)=>{


          if(result){


            const data =
              result.getText();



            setIdStatus(
              "Barcode detected"
            );


            setSmartIdResult(
              data
            );


          }


        }


      );


    }
    catch(error:any){


      setIdStatus(
        "Camera error: " +
        error.message
      );


    }


  };








  return (

    <div style={{
      padding:"30px"
    }}>


      <h1>
        Depot Access Scanner
      </h1>





      {/* =====================
          EMPLOYEE QR
      ====================== */}


      <h2>
        Employee QR Scanner
      </h2>


      <div id="qr-reader"></div>




      {
        selectedUser && (

          <div>


            <h3>
              Employee Found
            </h3>


            <p>
              Name:
              {" "}
              {selectedUser.firstName}
              {" "}
              {selectedUser.lastName}
            </p>


            <p>
              Company:
              {" "}
              {selectedUser.company}
            </p>


            <p>
              Vehicle:
              {" "}
              {selectedUser.vehicle || "None"}
            </p>


          </div>

        )
      }







      <hr />








      {/* =====================
          SMART ID
      ====================== */}



      <h2>
        South African Smart ID Barcode Scanner
      </h2>


      <p>
        Scan the large PDF417 barcode on the back of the Smart ID card.
      </p>



      {
        !idScannerActive && (

          <button

            onClick={startSmartIdScanner}

            style={{
              padding:"12px",
              fontSize:"18px"
            }}

          >

            Start Smart ID Scanner

          </button>

        )
      }





      <p>
        Status:
        {" "}
        {idStatus}
      </p>






      <video

        ref={idVideoRef}

        style={{

          width:"100%",
          maxWidth:"500px",
          height:"300px",
          objectFit:"cover"

        }}

      />






      {
        smartIdResult && (

          <div>


            <h3>
              Smart ID Barcode Result
            </h3>



            <textarea

              value={smartIdResult}

              readOnly

              style={{

                width:"100%",
                height:"200px"

              }}

            />


          </div>

        )
      }





    </div>

  );

}


export default App;