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





function bytesToAscii(bytes:Uint8Array):string
{

  return Array.from(bytes)
    .map(b=>{

      if(
        b>=32 &&
        b<=126
      )
      {
        return String.fromCharCode(b);
      }

      return " ";

    })
    .join("");

}





function decodeBirthDate(id:string):string
{

  if(id.length!==13)
    return "";


  const yy=id.substring(0,2);
  const mm=id.substring(2,4);
  const dd=id.substring(4,6);


  return `${dd}/${mm}/19${yy}`;

}





function decodeDate(
 y:number,
 m:number,
 d:number
):string
{

  if(
    y>99 ||
    m<1 ||
    m>12 ||
    d<1 ||
    d>31
  )
  {
    return "";
  }


  return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${2000+y}`;

}





function findDates(
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


   /*
     SA licence binary dates:

     YY MM DD

     Examples:
     19 10 15
     24 11 03
     29 11 02

   */


   if(
     y>=15 &&
     y<=40 &&
     m>=1 &&
     m<=12 &&
     d>=1 &&
     d<=31
   )
   {

     const date =
       decodeDate(
         y,
         m,
         d
       );


     if(
       date &&
       !dates.includes(date)
     )
     {
       dates.push(date);
     }

   }

 }


 return dates;

}





function extractTextFields(
 text:string
)
{

 const fields =
   text
   .split(/\s+/)
   .filter(Boolean);



 return {


 surname:
   fields.find(
     x=>/^[A-Z]{3,}$/.test(x)
   ) || "",



 initials:
   fields.find(
     x=>/^[A-Z]{2}$/.test(x)
   ) || "",



 idNumber:
   fields.find(
     x=>/^\d{13}$/.test(x)
   ) || "",



 licenseNumber:
   fields.find(
     x=>/^\d{8}[A-Z0-9]+$/.test(x)
   ) || ""

 };

}





export function decodeSALicense(
 bytes:Uint8Array
):SALicense
{


 /*
   The SA licence QR has a text section
   followed by binary data.

   From your dump the text starts
   around byte 16 and ends around
   byte 63.
 */


 const textBytes =
   bytes.slice(16,63);



 const ascii =
   bytesToAscii(textBytes);




 const fields =
   extractTextFields(ascii);





 const binary =
   bytes.slice(63);




 const dates =
   findDates(binary);





 (window as any).__licenseDebug =
 {

   ascii,

   fields,

   binaryStart:63,

   binary:Array.from(binary),

   dates

 };





 return {


 vehicleLicenses:[

 {

   /*
     Still empty intentionally.
     We need the category byte map.
   */

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



 idNumberType:
   "",



 idCountryOfIssue:
   "",



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