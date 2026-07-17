import type {
  DecodedResult
} from "../../scanner/types";



export function decodePDF417(
  text:string
):DecodedResult {


  return {

    type:"pdf417",

    data:text

  };

}