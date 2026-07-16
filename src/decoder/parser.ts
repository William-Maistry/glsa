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
    STRING SECTION
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

"FIELDS\n\n"

+

fields
.map(
  (x,i)=>
  `${i} => ${x}`
)
.join("\n");






  const result:SALicenseData = {


    vehicleLicenses:
      [],


    idNumber:
      fields[11] ?? "",


    idNumberType:
      "",


    idCountryOfIssue:
      fields[5] ?? "",


    surname:
      fields[3] ?? "",


    initials:
      fields[4] ?? "",


    gender:
      "",


    birthDate:
      "",


    driverRestrictions:
      "",


    licenseCountryOfIssue:
      fields[5] ?? "",


    licenseIssueNumber:
      "",


    licenseNumber:
      fields[10] ?? "",


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
    (fields[7] ?? "")
    .split(",");





  for(
    let i = 0;
    i < vehicleCodes.length;
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
      FIRST ISSUE DATES
  */


  const issueDates:string[] = [];



  for(
    let i = 0;
    i < 4;
    i++
  ){

    issueDates.push(
      decodeDate(
        read(8)
      )
    );

  }








  /*
      RESTRICTIONS
  */


  result.driverRestrictions =
    read(2);








  /*
      PRDP
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
      LICENCE ISSUE NUMBER
  */


  result.licenseIssueNumber =
    read(2);









  /*
      BIRTH DATE
  */


  result.birthDate =
    decodeDate(
      read(8)
    );









  /*
      VALID FROM
  */


  result.licenseValidityStart =
    decodeDate(
      read(8)
    );









  /*
      VALID TO
  */


  result.licenseValidityExpiry =
    decodeDate(
      read(8)
    );









  /*
      GENDER
  */


  result.gender =
    read(2);









  /*
      FIRST VEHICLE ISSUE DATE
  */


  if(
    result.vehicleLicenses.length
  ){

    result.vehicleLicenses[0]
      .firstIssueDate =
      issueDates[0] ?? "";

  }








  (window as any).__licenseDebug +=

"\n\nNIBBLES\n\n"

+

nibbles

+

"\n\nPOSITION\n"

+

pos;






  return result;

}