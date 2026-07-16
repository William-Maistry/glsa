import type {
  SALicenseData,
  VehicleLicense
} from "./types";







function bytesToNibbles(
  bytes: Uint8Array
): string {

  let result = "";

  for (const b of bytes) {

    result +=
      ((b >> 4) & 0xf)
        .toString(16);

    result +=
      (b & 0xf)
        .toString(16);

  }

  return result;

}




function decodeDate(
  value:string
):string {

  if(
    !value ||
    value.length !== 8
  ){
    return "";
  }


  if(value[0] !== "2"){
    return "";
  }


  return (
    value.substring(6,8)
    + "/"
    +
    value.substring(4,6)
    + "/"
    +
    value.substring(0,4)
  );

}





function splitStrings(
 bytes:Uint8Array
):string[] {


 const result:string[]=[];

 let current="";


 for(
  let i=0;
  i<bytes.length;
  i++
 ){

  const b =
    bytes[i];


  if(
    b===0xe0 ||
    b===0xe1
  ){

    if(current.length){
      result.push(current);
    }

    current="";

  }
  else if(
    b>=32 &&
    b<=126
  ){

    current +=
      String.fromCharCode(b);

  }

 }


 if(current.length){
  result.push(current);
 }


 return result;

}





function decodeVehicleCode(
 nibbles:string
):string {


 if(
  nibbles.includes("133")
 ){

  return "C1";

 }


 return "";

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
  stringStart + stringLength;



 const stringBytes =
  bytes.slice(
    stringStart,
    stringEnd
  );



 const fields =
  splitStrings(
    stringBytes
  );





 const result:SALicenseData = {


  vehicleLicenses:[],


  idNumber:
    fields.find(
      x=>/^\d{13}$/.test(x)
    ) || "",


  idNumberType:
    "",


  idCountryOfIssue:
    fields.find(
      x=>x==="ZA"
    ) || "",


  surname:
    fields.find(
      x=>/^[A-Z]{3,}$/.test(x)
    ) || "",


  initials:
    fields.find(
      x=>/^[A-Z]{2}$/.test(x)
    ) || "",



  gender:
    "",


  birthDate:
    "",


  driverRestrictions:
    "",


  licenseCountryOfIssue:
    fields.filter(
      x=>x==="ZA"
    )[1] || "ZA",


  licenseIssueNumber:
    "",


  licenseNumber:
    fields.find(
      x=>/^\d{8}[A-Z0-9]+$/.test(x)
    ) || "",


  licenseValidityStart:
    "",


  licenseValidityExpiry:
    "",


  professionalDrivingPermitExpiry:
    null,


  professionalDrivingPermitCodes:
    []

 };





/*
 BINARY SECTION
*/


const binary =
 bytes.slice(
  stringEnd,
  stringEnd + binaryLength
 );



const nibbles =
 bytesToNibbles(binary);



let pos=0;



function read(
 length:number
){

 const value =
  nibbles.substring(
    pos,
    pos + length
  );


 pos += length;


 return value;

}




/*
 FIRST ISSUE DATES
*/


const dates:string[]=[];


for(
 let i=0;
 i<4;
 i++
){

 const raw =
  read(8);


 dates.push(
  decodeDate(raw)
 );

}




/*
 DRIVER RESTRICTION
*/


result.driverRestrictions =
 read(2);





/*
 PRDP
*/


const prdp =
 read(8);


if(prdp){

 result.professionalDrivingPermitExpiry =
  decodeDate(prdp);

}




/*
 LICENCE ISSUE NUMBER
*/


result.licenseIssueNumber =
 read(2);





/*
 BIRTH DATE
*/


result.birthDate =
 decodeDate(
  read(8)
 );





/*
 VALID DATES
*/


result.licenseValidityStart =
 decodeDate(
  read(8)
 );


result.licenseValidityExpiry =
 decodeDate(
  read(8)
 );





/*
 GENDER
*/


const genderCode =
 read(2);


if(genderCode==="36"){
 result.gender="Male";
}
else if(genderCode==="35"){
 result.gender="Female";
}





/*
 VEHICLE
*/


const vehicleCode =
 decodeVehicleCode(
  nibbles
 );


if(vehicleCode){

 const vehicle:VehicleLicense = {

  code:
   vehicleCode,

  restriction:
   result.driverRestrictions,

  firstIssueDate:
   dates[0] || ""

 };


 result.vehicleLicenses.push(
  vehicle
 );

}





(window as any).__licenseDebug = {


FIELDS: fields,


NIBBLES:nibbles,


POSITION:pos,


DATES:dates,


RESULT:result

};





return result;

}
