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



  const result:any = {


    vehicleLicenses:[

      {
        code:vehicleCode,

        restriction:
          fields[7] || ""

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
      fields[11] || ""

  };



  return removeEmptyFields(
    result
  );

}






function removeEmptyFields(
  obj:any
):any {


  if(Array.isArray(obj)) {


    return obj

      .map(
        item =>
          removeEmptyFields(item)
      )

      .filter(
        item =>
          item !== "" &&
          item !== null &&
          item !== undefined
      );


  }





  if(
    typeof obj === "object" &&
    obj !== null
  ) {


    const cleaned:any = {};



    Object.entries(obj)
      .forEach(
        ([key,value])=>{


          if(
            value === "" ||
            value === null ||
            value === undefined
          ){

            return;

          }



          cleaned[key] =
            removeEmptyFields(value);


        }
      );



    return cleaned;

  }





  return obj;

}