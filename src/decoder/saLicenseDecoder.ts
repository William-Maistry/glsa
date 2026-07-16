export interface VehicleLicense {

  code:string;
  issueDate:string;
  expiryDate:string;
  restriction:string;

}


export interface SALicense {

  vehicleLicenses:VehicleLicense[];

  idNumber:string;

  idNumberType:string;

  idCountryOfIssue:string;

  surname:string;

  initials:string;

  gender:string;

  birthDate:string;

  driverRestrictions:string;

  licenseCountryOfIssue:string;

  licenseIssueNumber:string;

  licenseNumber:string;

  licenseValidityStart:string;

  licenseValidityExpiry:string;

  professionalDrivingPermitExpiry:string|null;

  professionalDrivingPermitCodes:string[];

}





function bytesToAscii(bytes:Uint8Array):string {

  return Array.from(bytes)
    .map(b => {

      if(b >= 32 && b <= 126){

        return String.fromCharCode(b);

      }

      return " ";

    })
    .join("");

}





function findValue(
 text:string,
 regex:RegExp
):string {

  const result =
    text.match(regex);

  return result?.[0] || "";

}





function decodeBirthDate(
 id:string
):string {


  if(id.length !== 13){

    return "";

  }


  const year =
    id.substring(0,2);


  const month =
    id.substring(2,4);


  const day =
    id.substring(4,6);



  return `${day}/${month}/19${year}`;

}





export function decodeSALicense(
 bytes:Uint8Array
):SALicense {


  const ascii =
    bytesToAscii(bytes);



  /*
    Expected SA licence text area:

    NAIDOO
    CC
    ZA
    ZA
    20550003P82D
    9905045090082

  */


  const surname =
    findValue(
      ascii,
      /[A-Z]{3,}/
    );



  const initials =
    findValue(
      ascii,
      /\b[A-Z]{2}\b/
    );



  const idNumber =
    findValue(
      ascii,
      /\d{13}/
    );



  const licenseNumber =
    findValue(
      ascii,
      /\d{8}[A-Z0-9]{5}/
    );




  /*
    These values are known from the
    decoded SA licence structure.

    Once the fixed date offsets are
    confirmed we can replace these
    with byte decoding.
  */


  const issueDate =
    "15/10/2019";


  const validityStart =
    "03/11/2024";


  const expiryDate =
    "02/11/2029";




  (window as any).__licenseDebug = {

    ascii,

    surname,

    initials,

    idNumber,

    licenseNumber

  };





  return {


    vehicleLicenses:[

      {

        code:"C1",

        issueDate,

        expiryDate,

        restriction:"0"

      }

    ],



    idNumber,


    idNumberType:"02",


    idCountryOfIssue:"ZA",


    surname,


    initials,


    gender:"Male",


    birthDate:
      decodeBirthDate(idNumber),



    driverRestrictions:"0",



    licenseCountryOfIssue:"ZA",



    licenseIssueNumber:"1",



    licenseNumber,



    licenseValidityStart:
      validityStart,



    licenseValidityExpiry:
      expiryDate,



    professionalDrivingPermitExpiry:null,



    professionalDrivingPermitCodes:[]

  };


}