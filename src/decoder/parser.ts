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


  const result:SALicenseData = {

    vehicleLicenses:[
      {
        code:"C1",
        restriction:"",
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
      fields[11]?.replace(/\.$/,"") || "",


    idNumberType:"",

    gender:"",

    birthDate:"",


    driverRestrictions:
      fields[7] || "",


    licenseIssueNumber:"",

    licenseValidityStart:"",

    licenseValidityExpiry:"",

    professionalDrivingPermitExpiry:null,

    professionalDrivingPermitCodes:[]

  };


  (window as any).__licenseDebug =
  {
    fields,
    result
  };


  return result;

}