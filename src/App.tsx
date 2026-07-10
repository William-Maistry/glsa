import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import users from "./data/users.json";


function App() {


  const [_userId, setUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);


  const [idScanResult, setIdScanResult] = useState("");
  const [idScannerActive, setIdScannerActive] = useState(false);
  const [idStatus, setIdStatus] = useState("");




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
  // SMART ID SCANNER
  // =================================

  const startIdScanner = ()=>{


    setIdScannerActive(true);


    setIdStatus(
      "Starting Smart ID scanner..."
    );



    const scanner =
      new Html5QrcodeScanner(

        "id-reader",

        {

          fps:10,

          qrbox:{

            width:400,
            height:250

          }

        },

        false

      );





    scanner.render(


      (decodedText)=>{


        setIdStatus(
          "Barcode detected"
        );


        setIdScanResult(
          decodedText
        );



        scanner.clear()
          .catch(()=>{});


      },


      ()=>{


        setIdStatus(
          "Searching..."
        );


      }


    );


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






      <h2>
        South African Smart ID Scanner
      </h2>



      <p>
        Point only at the large PDF417 barcode on the back of the ID.
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
        Status:
        {" "}
        {idStatus}
      </p>





      <div id="id-reader"></div>






      {
        idScanResult && (

          <div>


            <h3>
              Raw ID Barcode Data
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