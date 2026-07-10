import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { BrowserPDF417Reader } from "@zxing/browser";

import users from "./data/users.json";


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


function App() {

  const [selectedUser, setSelectedUser] =
    useState<any>(null);

  const [_qrResult, setQrResult] =
    useState("");

  const qrScannerRef =
    useRef<any>(null);


  const pdfReader =
    new BrowserPDF417Reader();


  const [idData, setIdData] =
    useState<IDData | null>(null);


  const [genericPdfResult, setGenericPdfResult] =
    useState("");


  const [debugResult, setDebugResult] =
    useState("");



  // ================================
  // QR LIVE CAMERA
  // ================================

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

        setQrResult(decodedText);


        const user =
          users.find(
            person =>
              person.qrCode === decodedText
          );


        setSelectedUser(user || null);

      },

      ()=>{}

    );


    return ()=>{

      scanner.clear()
      .catch(()=>{});

    };


  }, []);




  // ================================
  // QR IMAGE UPLOAD
  // ================================

  async function scanQrImage(
    e:React.ChangeEvent<HTMLInputElement>
  ){

    const file =
      e.target.files?.[0];


    if(!file)
      return;


    const scanner =
      new Html5Qrcode(
        "qr-image-reader"
      );


    try{

      const result =
        await scanner.scanFile(
          file,
          true
        );


      setQrResult(result);


      const user =
        users.find(
          person =>
            person.qrCode === result
        );


      setSelectedUser(user || null);


    }
    catch{

      alert(
        "QR code not found"
      );

    }

  }




  // ================================
  // SMART ID PDF417
  // ================================

  async function scanSmartId(
    e:React.ChangeEvent<HTMLInputElement>
  ){

    const file =
      e.target.files?.[0];


    if(!file)
      return;



    const img =
      new Image();


    img.onload =
      async()=>{


        try{

          const result =
            await pdfReader
            .decodeFromImageElement(img);



          const fields =
            result.getText()
            .split("|");



          setIdData({

            surname: fields[0] || "",

            names: fields[1] || "",

            sex: fields[2] || "",

            nationality: fields[3] || "",

            idNumber: fields[4] || "",

            dateOfBirth: fields[5] || "",

            countryOfBirth: fields[6] || "",

            dateOfIssue: fields[7] || "",

            controlNumber: fields[8] || "",

            barcodeReference: fields[9] || ""

          });


        }
        catch{

          alert(
            "Could not read Smart ID"
          );

        }


      };


    img.src =
      URL.createObjectURL(file);

  }





  // ================================
  // GENERIC PDF417 + DEBUG
  // ================================


  async function scanGenericPdf417(
    e:React.ChangeEvent<HTMLInputElement>
  ){

    const file =
      e.target.files?.[0];


    if(!file)
      return;



    const img =
      new Image();


    img.onload =
      async()=>{


        try{

          const result =
            await pdfReader
            .decodeFromImageElement(img);



          const debug =
            JSON.stringify(
              result,
              (_key,value)=>{

                if(value instanceof Uint8Array){

                  return Array.from(value);

                }

                return value;

              },
              2
            );


          setDebugResult(debug);



          setGenericPdfResult(
            result.getText()
          );


        }
        catch(err:any){

          setDebugResult(
            "ERROR:\n" +
            err.message
          );


          alert(
            "No PDF417 barcode found"
          );

        }


      };


    img.src =
      URL.createObjectURL(file);

  }





return (

<div
style={{
padding:"30px",
fontFamily:"Arial"
}}
>


<h1>
Depot Access Scanner
</h1>



<hr/>


<h2>
Employee QR Scanner
</h2>


<div id="qr-reader"></div>


<br/>


<label>
Upload QR Image:

<input
type="file"
accept="image/*"
capture="environment"
onChange={scanQrImage}
/>

</label>


<div id="qr-image-reader"></div>




{
selectedUser &&

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

}



<hr/>


<h2>
South African Smart ID Scanner
</h2>


<input
type="file"
accept="image/*"
capture="environment"
onChange={scanSmartId}
/>



{
idData &&

<div>

<h3>
Smart ID Information
</h3>

<p>Surname: {idData.surname}</p>
<p>Names: {idData.names}</p>
<p>Sex: {idData.sex}</p>
<p>Nationality: {idData.nationality}</p>
<p>ID Number: {idData.idNumber}</p>
<p>Date of Birth: {idData.dateOfBirth}</p>
<p>Country of Birth: {idData.countryOfBirth}</p>
<p>Date of Issue: {idData.dateOfIssue}</p>
<p>Control Number: {idData.controlNumber}</p>
<p>Barcode Reference: {idData.barcodeReference}</p>

</div>

}



<hr/>


<h2>
Generic PDF417 Scanner
</h2>


<input
type="file"
accept="image/*"
capture="environment"
onChange={scanGenericPdf417}
/>



{
genericPdfResult &&

<div>

<h3>
PDF417 Raw Result
</h3>


<textarea
value={genericPdfResult}
readOnly
style={{
width:"100%",
height:"200px"
}}
/>


</div>

}




{
debugResult &&

<div>

<h3>
ZXing Debug Output
</h3>


<textarea
value={debugResult}
readOnly
style={{
width:"100%",
height:"300px"
}}
/>


</div>

}




</div>

);


}


export default App;