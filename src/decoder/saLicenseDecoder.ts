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





function decodeHeader(
  bytes:Uint8Array
){

  /*
    SA licence text block is the first 50 bytes only
  */

  const header =
    bytes.slice(0,50);


  let text = "";


  for(const b of header){


    if(
      b >= 32 &&
      b <= 126
    ){

      text +=
        String.fromCharCode(b);

    }


    else if(b === 0xe0){

      text += "|";

    }


    else if(b === 0xe1){

      text += "~";

    }

  }



  const fields =
    text
    .split(/[|~]+/)
    .filter(Boolean);



  return fields;

}





function decodeDate(
  year:number,
  month:number,
  day:number
){

  return (

    String(day)
    .padStart(2,"0")
    +
    "/" +
    String(month)
    .padStart(2,"0")
    +
    "/" +
    String(2000 + year)

  );

}




function extractDates(
 bytes:Uint8Array
){

  const dates:string[]=[];


  for(
    let i=50;
    i<bytes.length-3;
    i++
  ){

    /*
       Dates appear as:

       20 YY MM DD

       Example:

       20 19 10 15
    */


    if(
      bytes[i] === 0x20 &&
      bytes[i+1] <= 30 &&
      bytes[i+2] <= 12 &&
      bytes[i+3] <= 31
    ){

      dates.push(

        decodeDate(
          bytes[i+1],
          bytes[i+2],
          bytes[i+3]
        )

      );

    }

  }


  return dates;

}







export function decodeSALicense(
 bytes:Uint8Array
):SALicense{


 const fields =
   decodeHeader(bytes);



 /*
 Expected:

 0 = 1
 1 = NAIDOO
 2 = CC
 3 = ZA
 4 = ZA
 5 = 0
 6 = 20550003P82D
 7 = 9905045090082

 */


 const surname =
   fields[1] || "";


 const initials =
   fields[2] || "";


 const licence =
   fields[6] || "";


 const id =
   fields[7] || "";



 const dates =
   extractDates(bytes);



 (window as any).__licenseDebug =
 `
FIELDS:

${fields.map(
 (x,i)=>
 `${i} => ${x}`
).join("\n")}


DATES:

${dates.join("\n")}

`;





 return {


  vehicleLicenses:[

    {
      code:"C1",

      issueDate:
        dates[0] || "",

      expiryDate:
        dates[2] || "",

      restriction:"0"

    }

  ],



  idNumber:id,


  idNumberType:"02",


  idCountryOfIssue:"ZA",



  surname,


  initials,



  gender:"Male",



  birthDate:

    id.length===13

    ?

    `${id.substring(4,6)}/${id.substring(2,4)}/19${id.substring(0,2)}`

    :

    "",



  driverRestrictions:"0",



  licenseCountryOfIssue:"ZA",



  licenseIssueNumber:"1",



  licenseNumber:licence,



  licenseValidityStart:
    dates[1] || "",



  licenseValidityExpiry:
    dates[2] || "",



  professionalDrivingPermitExpiry:null,



  professionalDrivingPermitCodes:[]

 };


}