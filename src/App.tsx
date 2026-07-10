import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import users from "./data/users.json";

function App() {
  const [_userId, setUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [idScanResult, setIdScanResult] = useState("");
  const [idScannerActive, setIdScannerActive] = useState(false);


  // ==========================
  // EXISTING QR EMPLOYEE SCANNER
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


        scanner.clear();

      },

      (_error) => {
        // ignore errors
      }

    );


    return () => {
      scanner.clear().catch(() => {});
    };


  }, []);



  // ==========================
  // SMART ID CARD SCANNER
  // ==========================

  const startIdScanner = () => {

    setIdScannerActive(true);


    const idScanner = new Html5QrcodeScanner(
      "id-reader",
      {
        fps: 10,
        qrbox: {
          width: 300,
          height: 150
        }
      },
      false
    );


    idScanner.render(

      (decodedText) => {


        setIdScanResult(decodedText);


        idScanner.clear()
          .catch(() => {});


      },


      (_error) => {

        // ignore scanning errors

      }

    );

  };



  return (

    <div style={{padding:"30px"}}>


      <h1>
        Depot Access Scanner
      </h1>



      <h2>
        Employee QR Scanner
      </h2>


      <div id="reader"></div>




      {selectedUser && (

        <div>

          <h2>
            User Found
          </h2>


          <p>
            Name:
            <strong>
              {selectedUser.firstName} {selectedUser.lastName}
            </strong>
          </p>


          <p>
            Company:
            <strong>
              {selectedUser.company}
            </strong>
          </p>


          <p>
            Vehicle:
            <strong>
              {selectedUser.vehicle || "None"}
            </strong>
          </p>


        </div>

      )}





      <hr />



      <h2>
        South African ID Smart Card Test Scanner
      </h2>


      <p>
        Scan the barcode on the back of the Smart ID Card.
      </p>



      {!idScannerActive && (

        <button
          onClick={startIdScanner}
          style={{
            padding:"12px",
            fontSize:"18px"
          }}
        >
          Start ID Card Scanner
        </button>

      )}



      <div id="id-reader"></div>



      {
        idScanResult && (

          <div>

            <h3>
              ID Scan Result
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