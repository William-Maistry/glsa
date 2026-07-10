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
  const [idDetails, setIdDetails] = useState<any>(null);

  const [_idScannerActive, setIdScannerActive] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const qrScannerRef = useRef<any>(null);



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






  // ==========================
  // SMART ID SCANNER
  // ==========================

  const startIdScanner = async()=>{


    setIdScannerActive(true);

    setScanStatus(
      "Starting Smart ID scanner..."
    );



    if(qrScannerRef.current){

      try {

        await qrScannerRef.current.clear();

      }
      catch {}

    }



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


      await reader.decodeFromConstraints(

        {
          video:{
            facingMode:"environment",
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


          if(result){


            const raw =
              result.getText();



            setScanStatus(
              "Smart ID scanned"
            );


            setIdScanResult(
              raw
            );



            setIdDetails(
              extractSmartIdDetails(raw)
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







  // ==========================
  // SMART ID DATA EXTRACTION
  // ==========================

  const extractSmartIdDetails =
    (data:string)=>{


      const findValue =
        (patterns:string[])=>{


          for(const pattern of patterns){


            const match =
              data.match(
                new RegExp(
                  pattern,
                  "i"
                )
              );


            if(match){

              return match[1].trim();

            }

          }


          return "";

        };



      return {


        idNumber:
          findValue([
            "ID(?:NUMBER)?[:| ]+([0-9]{13})",
            "([0-9]{13})"
          ]),



        surname:
          findValue([
            "SURNAME[:| ]+(.+)",
            "LASTNAME[:| ]+(.+)"
          ]),



        firstNames:
          findValue([
            "FIRST(?:NAMES|NAME)[:| ]+(.+)",
            "NAMES[:| ]+(.+)"
          ]),



        dateOfBirth:
          findValue([
            "DATE.?OF.?BIRTH[:| ]+(.+)",
            "DOB[:| ]+(.+)"
          ]),



        gender:
          findValue([
            "SEX[:| ]+(.+)",
            "GENDER[:| ]+(.+)"
          ]),



        nationality:
          findValue([
            "NATIONALITY[:| ]+(.+)",
            "CITIZENSHIP[:| ]+(.+)"
          ])


      };


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


          </div>

        )
      }







      <hr />





      <h2>
        South African Smart ID Scanner
      </h2>


      <button

        onClick={startIdScanner}

        style={{
          padding:"12px",
          fontSize:"18px"
        }}

      >
        Start ID Scanner
      </button>





      <p>
        Status: {scanStatus}
      </p>





      <video

        ref={videoRef}

        style={{

          width:"100%",
          maxWidth:"500px"

        }}

      />







      {
        idDetails && (

          <div>

            <h3>
              ID Details
            </h3>


            <p>
              ID Number:
              {" "}
              {idDetails.idNumber}
            </p>


            <p>
              First Names:
              {" "}
              {idDetails.firstNames}
            </p>


            <p>
              Surname:
              {" "}
              {idDetails.surname}
            </p>


            <p>
              Date Of Birth:
              {" "}
              {idDetails.dateOfBirth}
            </p>


            <p>
              Gender:
              {" "}
              {idDetails.gender}
            </p>


            <p>
              Nationality:
              {" "}
              {idDetails.nationality}
            </p>


          </div>

        )
      }






      {
        idScanResult && (

          <div>

            <h3>
              Raw Barcode Data
            </h3>


            <textarea

              value={idScanResult}

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