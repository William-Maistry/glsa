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


  const [idScanResult, setIdScanResult] = useState("");
  const [idScannerActive, setIdScannerActive] = useState(false);
  const [scanStatus, setScanStatus] = useState("");


  const videoRef =
    useRef<HTMLVideoElement | null>(null);


  const qrScannerRef =
    useRef<any>(null);






  // ==========================
  // EMPLOYEE QR SCANNER
  // ==========================

  useEffect(() => {


    const scanner =
      new Html5QrcodeScanner(
        "reader",
        {
          fps:10,
          qrbox:250
        },
        false
      );



    qrScannerRef.current =
      scanner;



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









  // ==========================
  // SMART ID BARCODE SCANNER
  // ==========================

  const startIdScanner = async()=>{


    setIdScannerActive(true);


    setScanStatus(
      "Starting Smart ID scanner..."
    );




    // stop employee QR scanner

    if(qrScannerRef.current){


      try{

        await qrScannerRef.current.clear();

      }
      catch{}

    }






    const hints =
      new Map();



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






    try{


      await reader.decodeFromConstraints(

        {


          video:{


            facingMode:
              "environment",


            width:{
              ideal:1920
            },


            height:{
              ideal:1080
            }


          }


        },


        videoRef.current!,



        (result)=>{


          setScanStatus(
            "Searching for Smart ID barcode..."
          );



          if(result){


            const data =
              result.getText();



            setScanStatus(
              "Smart ID barcode detected!"
            );



            setIdScanResult(
              data
            );


          }


        }


      );


    }
    catch(error:any){


      setScanStatus(
        "Scanner error: " +
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





      <h2>
        Employee QR Scanner
      </h2>



      <div id="reader"></div>






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






      <h2>
        South African Smart ID Scanner
      </h2>



      <p>
        Scan only the PDF417 barcode on the back of the Smart ID card.
      </p>





      {
        !idScannerActive && (


          <button

            onClick={startIdScanner}

            style={{
              padding:"12px",
              fontSize:"18px"
            }}

          >

            Start ID Scanner

          </button>


        )
      }






      <p>
        Status: {scanStatus}
      </p>






      <video

        ref={videoRef}

        style={{

          width:"100%",
          maxWidth:"500px",
          height:"300px",
          objectFit:"cover"

        }}

      />







      {
        idScanResult && (


          <div>


            <h3>
              Smart ID Raw Data
            </h3>


            <textarea

              value={idScanResult}

              readOnly

              style={{

                width:"100%",
                height:"250px"

              }}

            />



          </div>


        )
      }





    </div>

  );

}


export default App;