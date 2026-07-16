import type {
  SALicenseData,
  VehicleLicense
} from "./types";



function splitFields(
  bytes: Uint8Array
): string[] {

  const fields:string[] = [];

  let current = "";


  for (const b of bytes) {


    if (
      b === 0xe0 ||
      b === 0xe1
    ) {

      if(current.length){
        fields.push(current);
      }

      current = "";

    }
    else if(
      b >= 32 &&
      b <= 126
    ){

      current +=
        String.fromCharCode(b);

    }

  }


  if(current.length){
    fields.push(current);
  }


  return fields;

}





function findVehicleCode(
  bytes:Uint8Array
):string {


  for(
    let i=0;
    i < bytes.length-1;
    i++
  ){

    if(
      bytes[i] === 0x43 &&
      bytes[i+1] === 0x31
    ){

      return "C1";

    }

  }


  return "";

}







export function parseLicenseData(
 bytes:Uint8Array
):SALicenseData {


  const stringLength =
    bytes[5];


  const stringStart =
    10;


  const stringBytes =
    bytes.slice(
      stringStart,
      stringStart + stringLength
    );



  const fields =
    splitFields(
      stringBytes
    );



  const surname =
    fields.find(
      x =>
        /^[A-Z]{3,}$/.test(x)
    )
    || "";



  const initials =
    fields.find(
      x =>
        /^[A-Z]{2}$/.test(x)
    )
    || "";



  const countries =
    fields.filter(
      x =>
        x === "ZA"
    );



  const idNumber =
    fields.find(
      x =>
        /^\d{13}$/.test(x)
    )
    || "";



  const licence =
    fields.find(
      x =>
        /^\d{8}[A-Z0-9]*$/.test(x)
    )
    || "";



  const vehicleCode =
    findVehicleCode(
      bytes
    );



  (window as any).__licenseDebug = {

    fields,

    surname,

    initials,

    countries,

    licence,

    idNumber,

    vehicleCode

  };





  const vehicleLicenses:VehicleLicense[] = [];



  if(vehicleCode){

    vehicleLicenses.push({

      code:vehicleCode,

      restriction:"",

      firstIssueDate:""

    });

  }





  return {


    surname,


    initials,


    idNumber,


    idNumberType:"",


    idCountryOfIssue:
      countries[0] || "",


    licenseCountryOfIssue:
      countries[1] || "",



    licenseNumber:
      licence,



    vehicleLicenses,



    gender:"",


    birthDate:"",


    driverRestrictions:"",


    licenseIssueNumber:"",


    licenseValidityStart:"",


    licenseValidityExpiry:"",


    professionalDrivingPermitExpiry:
      null,


    professionalDrivingPermitCodes:[]

  };

}