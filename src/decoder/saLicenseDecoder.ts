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





function cleanAscii(bytes:Uint8Array):string
{

  return Array.from(bytes)
    .map(b =>
      b >= 32 && b <= 126
      ? String.fromCharCode(b)
      : " "
    )
    .join("");

}





function decodeBirthDate(
 id:string
):string
{

  if(id.length!==13)
    return "";


  const yy =
    id.substring(0,2);

  const mm =
    id.substring(2,4);

  const dd =
    id.substring(4,6);


  return `${dd}/${mm}/19${yy}`;

}





function decodeDate(
 y:number,
 m:number,
 d:number
):string
{

  if(
    y < 0 ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31
  )
  {
    return "";
  }


  return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${2000+y}`;

}





function findBinaryDates(
 bytes:Uint8Array
):string[]
{

 const dates:string[]=[];


 for(
  let i=0;
  i<bytes.length-2;
  i++
 )
 {

   const y=bytes[i];
   const m=bytes[i+1];
   const d=bytes[i+2];


   if(
     y>=15 &&
     y<=35 &&
     m>=1 &&
     m<=12 &&
     d>=1 &&
     d<=31
   )
   {

     const date =
       decodeDate(y,m,d);


     if(date && !dates.includes(date))
     {
       dates.push(date);
     }

   }

 }


 return dates;

}





function extractFields(
 ascii:string
)
{

 const parts =
   ascii
   .split(/\s+/)
   .filter(Boolean);



 return {


 surname:
   parts.find(
    x=>/^[A-Z]{3,}$/.test(x)
   ) || "",



 initials:
   parts.find(
    x=>/^[A-Z]{2}$/.test(x)
   ) || "",



 idNumber:
   parts.find(
    x=>/^\d{13}$/.test(x)
   ) || "",



 licenseNumber:
   parts.find(
    x=>/^\d{8}[A-Z0-9]+$/.test(x)
   ) || ""

 };

}





export function decodeSALicense(
 bytes:Uint8Array
):SALicense
{


 const ascii =
   cleanAscii(bytes);



 const fields =
   extractFields(ascii);



 const dates =
   findBinaryDates(bytes);





 /*
   IMPORTANT:

   We deliberately do not guess:
   - gender
   - category
   - restrictions

   until the binary structure is confirmed.
 */


 (window as any).__licenseDebug =
 {

   ascii,

   fields,

   dates,

   rawBytes:
     Array.from(bytes)

 };





 return {


 vehicleLicenses:[

  {

   code:"",

   issueDate:
     dates[0] || "",

   expiryDate:
     dates[2] || "",

   restriction:""

  }

 ],



 idNumber:
   fields.idNumber,



 idNumberType:"",



 idCountryOfIssue:"",



 surname:
   fields.surname,



 initials:
   fields.initials,



 gender:"",



 birthDate:
   decodeBirthDate(
     fields.idNumber
   ),



 driverRestrictions:"",



 licenseCountryOfIssue:"",



 licenseIssueNumber:"",



 licenseNumber:
   fields.licenseNumber,



 licenseValidityStart:
   dates[1] || "",



 licenseValidityExpiry:
   dates[2] || "",



 professionalDrivingPermitExpiry:null,



 professionalDrivingPermitCodes:[]

 };


}