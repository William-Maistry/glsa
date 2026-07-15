import type {
  SALicenseData,
  VehicleLicense
} from "./types";



function bytesToString(
  bytes: Uint8Array
): string {

  return String.fromCharCode(
    ...bytes
  );

}



function decodeDate(
  nibbles: string
): string {

  if (
    !nibbles ||
    nibbles.includes("a")
  ) {
    return "";
  }


  if (nibbles.length !== 8) {
    return "";
  }


  return (
    nibbles.substring(0,4)
    + "-"
    +
    nibbles.substring(4,6)
    + "-"
    +
    nibbles.substring(6,8)
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
  bytes: Uint8Array
): string[] {


  const text =
    bytesToString(bytes);



  const values:string[] = [];

  let current = "";



  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const code =
      text.charCodeAt(i);



    if (
      code === 224 ||
      code === 225
    ) {

      values.push(current);

      current = "";

    }
    else {

      current += text[i];

    }

  }



  if(current.length){

    values.push(current);

  }



  return values;

}








export function parseLicenseData(
  bytes: Uint8Array
): SALicenseData {



  const stringLength =
    bytes[5];


  const binaryLength =
    bytes[7];



  const stringStart =
    10;



  const stringEnd =
    stringStart +
    stringLength;




  const stringBytes =
    bytes.slice(
      stringStart,
      stringEnd
    );




  const fields =
    splitStrings(
      stringBytes
    );





  (window as any).__licenseDebug =
    fields
    .map(
      (field,index)=>
        `${index} => ${field}`
    )
    .join("\n");







  const result:SALicenseData = {


    /*
      Confirmed mappings
    */

    idNumber:
      (fields[8] ?? "").substring(0,13),


    idNumberType:
      "",


    idCountryOfIssue:
      fields[2] ?? "",


    surname:
      fields[0] ?? "",


    initials:
      fields[1] ?? "",


    gender:
      "",


    birthDate:
      "",


    driverRestrictions:
      "",


    licenseCountryOfIssue:
      fields[3] ?? "",


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
      [],


    vehicleLicenses:
      []

  };







  const binaryStart =
    stringEnd;



  const binaryEnd =
    binaryStart +
    binaryLength;



  const binary =
    bytes.slice(
      binaryStart,
      binaryEnd
    );




  const nibbles =
    bytesToNibbles(
      binary
    );



  /*
    Debug binary layout
  */

  (window as any).__licenseDebug +=
    "\n\nNIBBLES:\n" +
    nibbles;





  /*
    Existing binary parsing kept temporarily.
    We will correct offsets after
    confirming real card values.
  */


  let pos = 0;




  result.idNumberType =
    nibbles.substring(
      pos,
      pos + 2
    );


  pos += 2;







  const issueDates:string[] = [];



  for(
    let i = 0;
    i < 4;
    i++
  ){

    const part =
      nibbles.substring(
        pos,
        pos + 8
      );


    if(part.length === 8){

      issueDates.push(
        decodeDate(part)
      );

    }


    pos += 8;

  }







  result.driverRestrictions =
    nibbles.substring(
      pos,
      pos + 2
    );


  pos += 2;







  const prdp =
    nibbles.substring(
      pos,
      pos + 8
    );



  if(
    prdp.length === 8 &&
    !prdp.includes("a")
  ){

    result.professionalDrivingPermitExpiry =
      decodeDate(prdp);

  }



  pos += 8;







  result.licenseIssueNumber =
    nibbles.substring(
      pos,
      pos + 2
    );


  pos += 2;








  result.birthDate =
    decodeDate(
      nibbles.substring(
        pos,
        pos + 8
      )
    );


  pos += 8;







  result.licenseValidityStart =
    decodeDate(
      nibbles.substring(
        pos,
        pos + 8
      )
    );


  pos += 8;







  result.licenseValidityExpiry =
    decodeDate(
      nibbles.substring(
        pos,
        pos + 8
      )
    );


  pos += 8;







  result.gender =
    nibbles.substring(
      pos,
      pos + 2
    );







  /*
    Vehicle decoding disabled until
    binary layout is confirmed.
  */


  const vehicle:VehicleLicense = {

    code:
      "",


    restriction:
      "",


    firstIssueDate:
      ""

  };



  if(vehicle.code){

    result.vehicleLicenses.push(
      vehicle
    );

  }




  return result;

}