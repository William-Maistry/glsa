import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BrowserMultiFormatReader } from "@zxing/browser";
import users from "./data/users.json";


function App() {

  const [_userId, setUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [idScanResult, setIdScanResult] = useState("");
  const [idDetails, setIdDetails] = useState<any>(null);

  const [idScannerActive, setIdScannerActive] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);



  // ==========================
  // EMPLOYEE QR SCANNER
  // ==========================

  useEffect(() => {

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250
      },
      false
    );


    scanner.render(

      (decodedText) => {

        setUserId(decodedText);


        const user = users.find(
          (person) => person.qrCode === decodedText
        );


        setSelectedUser(user);


        scanner.clear()
          .catch(() => {});

      },


      () => {}

    );


    return () => {

      scanner.clear()
        .catch(() => {});

    };


  }, []);






  // ==========================
  // SMART ID CARD SCANNER
  // ==========================

  const startIdScanner = async () => {


    setIdScannerActive(true);
    setScanStatus("Opening camera...");


    const reader = new BrowserMultiFormatReader();



    try {


      const controls =
        await reader.decodeFromConstraints(


          {
            video: {

              facingMode: "environment",

              width: {
                ideal: 1920
              },

              height: {
                ideal: 1080
              }

            }
          },


          videoRef.current!,


          (result) => {


            if (result) {


              const rawData =
                result.getText();



              setScanStatus(
                "Barcode detected!"
              );



              setIdScanResult(rawData);



              setIdDetails(
                parseSouthAfricanId(rawData)
              );



              controls.stop();


            } else {


              setScanStatus(
                "Searching for barcode..."
              );


            }


          }


        );


    } catch(error) {


      setScanStatus(
        "Camera error: " + error
      );


    }


  };







  // ==========================
  // ID BARCODE PARSER
  // ==========================

  const parseSouthAfricanId = (data:string) => {


    const extract = (key:string) => {


      const regex =
        new RegExp(
          `${key}([^\\n\\r]+)`
        );


      const match =
        data.match(regex);



      return match
        ? match[1].trim()
        : "";

    };



    return {

      surname:
        extract("DCS"),

      firstNames:
        extract("DAC"),

      dateOfBirth:
        extract("DBB"),

      gender:
        extract("DBC"),

      nationality:
        extract("DCT")

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

            <h2>
              User Found
            </h2>


            <p>
              Name:
              {" "}
              <strong>
                {selectedUser.firstName}
                {" "}
                {selectedUser.lastName}
              </strong>
            </p>


            <p>
              Company:
              {" "}
              <strong>
                {selectedUser.company}
              </strong>
            </p>


            <p>
              Vehicle:
              {" "}
              <strong>
                {selectedUser.vehicle || "None"}
              </strong>
            </p>


          </div>

        )
      }






      <hr />





      <h2>
        South African Smart ID Card Scanner
      </h2>



      <p>
        Scan the barcode on the back of the Smart ID Card.
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
          marginTop:"20px"

        }}

      />







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
                height:"150px"

              }}

            />


          </div>

        )
      }








      {
        idDetails && (

          <div>


            <h3>
              Extracted Details
            </h3>



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



    </div>

  );

}


export default App;