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




function cleanAscii(bytes:Uint8Array){

  return Array.from(bytes)
    .map(b=>{

      if(
        b>=32 &&
        b<=126
      ){
        return String.fromCharCode(b);
      }

      return "";

    })
    .join("");

}



function extractStrings(bytes:Uint8Array){

  const text =
    cleanAscii(bytes);


  const parts =
    text
    .split(/\s+/)
    .filter(Boolean);


  return parts;

}




function decodeBCDDate(
  bytes:number[]
){

  if(bytes.length < 4){
    return "";
  }


  const year =
    2000 + bytes[0];


  const month =
    String(bytes[1])
    .padStart(2,"0");


  const day =
    String(bytes[2])
    .padStart(2,"0");


  return (
    `${day}/${month}/${year}`
  );

}





function findDateBlocks(
 bytes:Uint8Array
){

 const dates:string[]=[];


 for(
   let i=0;
   i<bytes.length-3;
   i++
 ){

   const a=bytes[i];
   const b=bytes[i+1];
   const c=bytes[i+2];


   /*
    SA licence dates are stored:

    20 YY MM DD

   */

   if(
     a===0x20 &&
     b>=0x10 &&
     b<=0x30 &&
     c>=1 &&
     c<=12
   ){

     dates.push(
       decodeBCDDate([
         b,
         c,
         bytes[i+3]
       ])
     );

   }

 }


 return dates;

}





export function decodeSALicense(
 bytes:Uint8Array
):SALicense{


 const textParts =
   extractStrings(bytes);



 const surname =
   textParts.find(
     x=>
     /^[A-Z]+$/.test(x) &&
     x.length>2
   ) || "";



 const initials =
   textParts.find(
     x=>
     /^[A-Z]{2}$/.test(x)
   ) || "";



 const id =
   textParts.find(
     x=>
     /^\d{13}$/.test(x)
   ) || "";



 const licence =
   textParts.find(
     x=>
     /^[0-9]{8}[A-Z0-9]+$/.test(x)
   ) || "";



 const dates =
   findDateBlocks(bytes);



 (window as any).__licenseDebug =
 `
TEXT:

${textParts.join("\n")}


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


  idNumberType:
    "02",



  idCountryOfIssue:
    "ZA",



  surname,


  initials,



  gender:
    "Male",



  birthDate:
    id.length===13
    ?
    `${id.substring(4,6)}/${id.substring(2,4)}/19${id.substring(0,2)}`
    :
    "",



  driverRestrictions:
    "0",



  licenseCountryOfIssue:
    "ZA",



  licenseIssueNumber:
    "1",



  licenseNumber:
    licence,



  licenseValidityStart:
    dates[1] || "",



  licenseValidityExpiry:
    dates[2] || "",



  professionalDrivingPermitExpiry:
    null,



  professionalDrivingPermitCodes:[]
 };


}