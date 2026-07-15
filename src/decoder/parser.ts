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





function decodeDate(
  value:string
):string {


  if(
    !value ||
    value.includes("a") ||
    value.length !== 8
  ){

    return "";

  }


  return (
    value.substring(0,4)
    + "-"
    +
    value.substring(4,6)
    + "-"
    +
    value.substring(6,8)
  );

}





function splitStrings(
  bytes:Uint8Array
):string[] {


  const text =
    bytesToString(bytes);



  const values:string[] = [];

  let current = "";



  for(
    let i=0;
    i<text.length;
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
    HEADER
  */

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
      (x,i)=>
        `${i} => ${x}`
    )
    .join("\n");







  /*
      STRING SECTION
  */



  const result:SALicenseData = {


    vehicleLicenses:
      [],


    idNumber:
      fields[14] ?? "",


    idNumberType:
      "",


    idCountryOfIssue:
      fields[7] ?? "",


    surname:
      fields[4] ?? "",


    initials:
      fields[5] ?? "",


    gender:
      "",


    birthDate:
      "",


    driverRestrictions:
      "",


    licenseCountryOfIssue:
      fields[8] ?? "",


    licenseIssueNumber:
      "",


    licenseNumber:
      fields[13] ?? "",


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
      VEHICLE DATA
  */


  const vehicleCodes =
    (fields[0] ?? "")
    .split(",");



  const vehicleRestrictions =
    (fields[9] ?? "")
    .split(",");





  for(
    let i=0;
    i<vehicleCodes.length;
    i++
  ){


    if(vehicleCodes[i]){


      const vehicle:VehicleLicense = {

        code:
          vehicleCodes[i],


        restriction:
          vehicleRestrictions[i] ?? "",


        firstIssueDate:
          ""

      };


      result.vehicleLicenses.push(
        vehicle
      );

    }

  }








  /*
      BINARY SECTION
  */



  const binaryStart =
    stringEnd;



  const binary =
    bytes.slice(
      binaryStart,
      binaryStart + binaryLength
    );



  const nibbles =
    bytesToNibbles(
      binary
    );



  let pos = 0;




  function read(
    length:number
  ){

    const value =
      nibbles.substring(
        pos,
        pos + length
      );


    pos += length;


    return value;

  }






  /*
      ID TYPE
  */


  result.idNumberType =
    read(2);







  /*
      4 licence issue dates
  */


  const issueDates:string[] = [];


  for(
    let i=0;
    i<4;
    i++
  ){


    const date =
      read(8);


    issueDates.push(
      decodeDate(date)
    );

  }





  /*
      Restrictions
  */


  result.driverRestrictions =
    read(2);







  /*
      PrDP expiry
  */


  const prdp =
    read(8);



  if(
    prdp &&
    !prdp.includes("a")
  ){

    result.professionalDrivingPermitExpiry =
      decodeDate(prdp);

  }







  /*
      Issue number
  */


  result.licenseIssueNumber =
    read(2);








  /*
      Birth date
  */


  result.birthDate =
    decodeDate(
      read(8)
    );








  /*
      Valid from
  */


  result.licenseValidityStart =
    decodeDate(
      read(8)
    );








  /*
      Valid to
  */


  result.licenseValidityExpiry =
    decodeDate(
      read(8)
    );







  /*
      Gender
  */


  result.gender =
    read(2);








  /*
      Add first issue date
      to vehicles
  */


  if(
    result.vehicleLicenses.length
  ){

    result.vehicleLicenses[0]
      .firstIssueDate =
      issueDates[0] ?? "";

  }







  /*
      Extra debug
  */


  (window as any).__licenseDebug +=
    "\n\nNIBBLES:\n" +
    nibbles +
    "\n\nPOSITION:\n" +
    pos;





  return result;

}