import type {
  SALicenseData
} from "./types";



function bytesToString(
  bytes: Uint8Array
): string {

  return String.fromCharCode(
    ...bytes
  );

}



function bytesToNibbles(
  bytes: Uint8Array
): string {

  let result = "";

  for (const b of bytes) {

    result +=
      ((b >> 4) & 0xf)
      .toString(16);

    result +=
      (b & 0xf)
      .toString(16);

  }

  return result;

}





function splitStrings(
  bytes:Uint8Array
):string[] {


  const text =
    bytesToString(bytes);



  const values:string[] = [];

  let current = "";



  for(
    let i = 0;
    i < text.length;
    i++
  ){

    const code =
      text.charCodeAt(i);



    if(
      code === 224 ||
      code === 225
    ){

      values.push(current);

      current = "";

    }
    else{

      current += text[i];

    }

  }



  if(current.length){

    values.push(current);

  }


  return values;

}








export function parseLicenseData(
  bytes:Uint8Array
):SALicenseData {



  /*
    Find start of binary data.
    The ASCII section ends before
    the first binary marker.
  */


  const binaryStart =
    bytes.indexOf(0x02);




  const stringBytes =
    bytes.slice(
      0,
      binaryStart
    );




  const fields =
    splitStrings(
      stringBytes
    );





  let stringHex = "";



  for(
    const b of stringBytes
  ){

    stringHex +=
      b.toString(16)
      .padStart(2,"0")
      + " ";

  }






  (window as any).__licenseDebug =

"STRING LENGTH: " +
stringBytes.length +

"\n\nBINARY START: " +
binaryStart +

"\n\nSTRING HEX:\n" +

stringHex +

"\n\nFIELDS:\n\n" +

fields
.map(
  (x,i)=>
  `${i} => ${x}`
)
.join("\n");






  /*
      Temporary mapping.
      We will correct indexes
      after seeing the fields.
  */


  const result:SALicenseData = {


    vehicleLicenses:
      [],


    idNumber:
      fields[8] ?? "",


    idNumberType:
      "",


    idCountryOfIssue:
      fields[2] ?? "",


    surname:
      fields[4] ?? "",


    initials:
      fields[1] ?? "",


    gender:
      "",


    birthDate:
      "",


    driverRestrictions:
      "",


    licenseCountryOfIssue:
      fields[2] ?? "",


    licenseIssueNumber:
      "",


    licenseNumber:
      fields[7] ?? "",


    licenseValidityStart:
      "",


    licenseValidityExpiry:
      "",


    professionalDrivingPermitExpiry:
      null,


    professionalDrivingPermitCodes:
      []

  };





  /*
      Binary debug only
  */


  const binary =
    bytes.slice(
      binaryStart
    );



  const nibbles =
    bytesToNibbles(
      binary
    );



  (window as any).__licenseDebug +=

"\n\nNIBBLES:\n\n" +

nibbles;





  return result;

}