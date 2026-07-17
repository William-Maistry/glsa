import type {
  DecodedResult
} from "../../scanner/types";




export function decodeQR(
  text:string
):DecodedResult {



  let data:any =
    text;



  try{


    data =
      JSON.parse(
        text
      );


  }
  catch{

    // Not JSON
    // keep as string

  }




  return {

    type:"qr",

    data

  };


}