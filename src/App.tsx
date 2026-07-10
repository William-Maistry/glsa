import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import {
  BrowserPDF417Reader,
} from "@zxing/browser";
import { decodePdf417Raw } from "./Pdf417RawReader";

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



  // ===============================
  // QR LIVE CAMERA
  // ===============================

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




  // ===============================
  // QR IMAGE
  // ===============================

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
        "QR not found"
      );

    }

  }





  // ===============================
  // SMART ID PDF417
  // ===============================

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
            "Smart ID failed"
          );

        }


      };


    img.src =
      URL.createObjectURL(file);

  }






  // ===============================
  // GENERIC PDF417 DEBUG SCANNER
  // ===============================


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
          await decodePdf417Raw(img);



        const rawBytes =
          result.rawBytes;



        setDebugResult(
          JSON.stringify(
            {
              text:
                result.text,

              format:
                result.format,

              rawBytes:
                rawBytes
                ?
                Array.from(rawBytes)
                :
                null,

              byteLength:
                rawBytes
                ?
                rawBytes.length
                :
                0
            },
            null,
            2
          )
        );


        setGenericPdfResult(
          result.text
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


<input
type="file"
accept="image/*"
capture="environment"
onChange={scanQrImage}
/>



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

</div>

}




<hr/>




<h2>
Smart ID Scanner
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
<p>ID: {idData.idNumber}</p>
<p>DOB: {idData.dateOfBirth}</p>
<p>Country: {idData.countryOfBirth}</p>
<p>Issue: {idData.dateOfIssue}</p>
<p>Control: {idData.controlNumber}</p>
<p>Barcode Ref: {idData.barcodeReference}</p>

</div>

}




<hr/>




<h2>
Generic PDF417 Debug Scanner
</h2>


<input
type="file"
accept="image/*"
capture="environment"
onChange={scanGenericPdf417}
/>



<h3>
Decoded Text
</h3>


<textarea

value={genericPdfResult}

readOnly

style={{
width:"100%",
height:"150px"
}}

/>



<h3>
ZXing Debug
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

);


}


export default App;