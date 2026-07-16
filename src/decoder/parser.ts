import type {
  SALicenseData,
} from "./types";



function bytesToText(
  bytes: Uint8Array
): string {

  let result = "";

  for (const b of bytes) {

    if (
      b >= 32 &&
      b <= 126
    ) {
      result += String.fromCharCode(b);
    }
    else {

      result += " ";

    }

  }

  return result;

}





function splitFields(
  bytes: Uint8Array
): string[] {


  const fields:string[] = [];

  let current = "";


  for(const b of bytes){


    if(
      b === 0xe0 ||
      b === 0xe1
    ){

      fields.push(current);
      current = "";

    }
    else {

      if(
        b >= 32 &&
        b <=126
      ){

        current +=
          String.fromCharCode(b);

      }

    }


  }


  if(current.length){
    fields.push(current);
  }


  return fields;

}







function formatDate(
 year:number,
 month:number,
 day:number
):string {


  if(
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ){

    return "";

  }


  return (

    day
      .toString()
      .padStart(2,"0")

    +

    "/"

    +

    month
      .toString()
      .padStart(2,"0")

    +

    "/"

    +

    year
      .toString()

  );

}







function findDates(
 bytes:Uint8Array
):string[]{


 const dates:string[]=[];



 for(
  let i=0;
  i<bytes.length-3;
  i++
 ){


   /*
      20 YY MM DD
   */


   if(
    bytes[i] === 0x20
   ){

     const year =
       2000 + bytes[i+1];


     const month =
       bytes[i+2];


     const day =
       bytes[i+3];


     const date =
       formatDate(
        year,
        month,
        day
       );


     if(date){
       dates.push(date);
     }


   }


 }



 return dates;

}









function decodeGender(
 value:number
):string {


 switch(value){

  case 0x36:
    return "Male";


  case 0x35:
    return "Female";


  default:
    return "";

 }

}









function findVehicleCode(
 bytes:Uint8Array
):string {


 /*
   Vehicle codes are stored
   as ASCII in the binary.
 */


 const text =
   bytesToText(bytes);



 const match =
   text.match(
     /\b[A-Z][0-9]\b/
   );


 return match?.[0] ?? "";

}









export function parseLicenseData(
 bytes:Uint8Array
):SALicenseData {



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
   splitFields(
    stringBytes
   );




 const binary =
   bytes.slice(
    stringEnd,
    stringEnd + binaryLength
   );



 const dates =
   findDates(
    binary
   );





 /*
    Debug
 */


 let binaryDebug = "";

 for(let i=0;i<binary.length;i++){

   if(i%16===0){

    binaryDebug +=
      "\n"+
      i.toString(16)
      .padStart(4,"0")
      +
      ": ";

   }


   binaryDebug +=
    binary[i]
    .toString(16)
    .padStart(2,"0")
    +" ";

 }



 (window as any).__licenseDebug = {

   fields,

   dates,

   binaryDebug

 };









 const vehicleCode =
   findVehicleCode(
     binary
   );



 const gender =
   decodeGender(
    binary[binary.length-2]
   );





 const result:SALicenseData = {



 idNumber:
   fields.find(
    x=>/^\d{13}$/.test(x)
   ) || "",



 idNumberType:
   binary[0]?.toString(16)
   .padStart(2,"0")
   || "",




 idCountryOfIssue:
   fields.find(
    x=>x==="ZA"
   )
   || "",




 surname:
   fields.find(
    x=>
     /^[A-Z]{3,}$/.test(x)
   )
   || "",




 initials:
   fields.find(
    x=>
     /^[A-Z]{2}$/.test(x)
   )
   || "",




 gender,




 birthDate:
   "",





 driverRestrictions:
   "",




 licenseCountryOfIssue:
   fields.find(
    x=>x==="ZA"
   )
   || "",




 licenseIssueNumber:
   binary[72]
   ?.toString(16)
   || "",





 licenseNumber:
   fields.find(
    x=>
     /^[0-9]{8}[A-Z0-9]+$/.test(x)
   )
   || "",




 licenseValidityStart:
   dates[1] || "",




 licenseValidityExpiry:
   dates[2] || "",





 professionalDrivingPermitExpiry:
   null,




 professionalDrivingPermitCodes:
   [],




 vehicleLicenses:

   vehicleCode

   ?

   [

    {

     code:
       vehicleCode,

     restriction:
       binary[71]
       ?.toString(16)
       || "",

     firstIssueDate:
       dates[0] || ""

    }

   ]

   :

   []

 };


 return result;


}