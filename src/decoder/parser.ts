import type {
  SALicenseData
} from "./types";


export function parseLicenseData(
  raw:string
):SALicenseData {


  const fields =
    raw
      .replace(/^\./,"")
      .split("|");



  const vehiclePart =
    fields[0] || "";



  const vehicleCode =
    vehiclePart.match(
      /C\d/
    )?.[0] || "";



  const result:SALicenseData = {


    vehicleLicenses:[
      {
        code:vehicleCode,
        restriction:fields[8] || "",
        firstIssueDate:""
      }
    ],



    surname:
      fields[4] || "",



    initials:
      fields[5] || "",



    idCountryOfIssue:
      fields[6] || "",



    licenseCountryOfIssue:
      fields[7] || "",



    licenseNumber:
      fields[11] || "",



    idNumber:
      fields[12] || "",



    idNumberType:"",



    gender:"",


    birthDate:"",


    driverRestrictions:
      fields[8] || "",


    licenseIssueNumber:"",


    licenseValidityStart:"",


    licenseValidityExpiry:"",


    professionalDrivingPermitExpiry:
      null,


    professionalDrivingPermitCodes:[]

  };



  (window as any).__licenseDebug =
    {
      fields,
      result
    };



  return result;

}