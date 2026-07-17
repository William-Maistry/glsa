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
    vehiclePart.match(/C\d+/)?.[0] || "";



  const result:SALicenseData = {


    vehicleLicenses:[

      {
        code:vehicleCode,

        restriction:
          fields[7] || "",

        firstIssueDate:""

      }

    ],



    surname:
      fields[3] || "",



    initials:
      fields[4] || "",



    idCountryOfIssue:
      fields[5] || "",



    licenseCountryOfIssue:
      fields[6] || "",



    licenseNumber:
      fields[10] || "",



    idNumber:
      fields[11] || "",



    idNumberType:"",



    gender:"",



    birthDate:"",



    driverRestrictions:
      fields[7] || "",



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