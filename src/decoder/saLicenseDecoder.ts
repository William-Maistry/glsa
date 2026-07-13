import { rsaDecryptBlock } from "./rsa";
import type { SALicenseData } from "./types";


export function decodeSALicense(
  bytes: Uint8Array
): SALicenseData {

  if (bytes.length !== 720) {
    throw new Error(
      `Expected 720 bytes, received ${bytes.length}`
    );
  }


  // Remove barcode header
  // First 6 bytes:
  // 01 9b 09 45 00 00

  const encrypted =
    bytes.slice(6);



  const blocks: Uint8Array[] = [

    encrypted.slice(0, 128),

    encrypted.slice(128, 256),

    encrypted.slice(256, 384),

    encrypted.slice(384, 512),

    encrypted.slice(512, 640),

    encrypted.slice(640, 714)

  ];



  let decoded =
    new Uint8Array();



  for (const block of blocks) {

    const decrypted =
      rsaDecryptBlock(block);


    const combined =
      new Uint8Array(
        decoded.length +
        decrypted.length
      );


    combined.set(decoded);

    combined.set(
      decrypted,
      decoded.length
    );


    decoded =
      combined;

  }



  // Remove internal 10 byte header

  decoded =
    decoded.slice(10);



  return parseDecoded(decoded);

}




function parseDecoded(
  bytes: Uint8Array
): SALicenseData {


  /*
    Decrypted structure:

    Section 0:
    10 byte header

    Section 1:
    Strings

    Section 2:
    Binary data

    Section 3:
    Image data
  */


  const header = {

    stringLength:
      bytes[5],

    binaryLength:
      bytes[7]

  };



  const stringStart =
    10;



  const stringEnd =
    stringStart +
    header.stringLength;



  const stringBytes =
    bytes.slice(
      stringStart,
      stringEnd
    );



  const stringData =
    parseStrings(
      stringBytes
    );



  return {

    idNumber:
      stringData.idNumber,

    idNumberType:
      "",

    idCountryOfIssue:
      stringData.idCountryOfIssue,

    surname:
      stringData.surname,

    initials:
      stringData.initials,

    gender:
      "",

    birthDate:
      "",

    driverRestrictions:
      "",

    licenseCountryOfIssue:
      stringData.licenseCountryOfIssue,

    licenseIssueNumber:
      "",

    licenseNumber:
      stringData.licenseNumber,

    licenseValidityStart:
      "",

    licenseValidityExpiry:
      "",

    professionalDrivingPermitExpiry:
      null,

    professionalDrivingPermitCodes:
      [],

    vehicleLicenses:
      []

  };

}





function parseStrings(
  bytes: Uint8Array
) {


  const text =
    new TextDecoder(
      "ascii"
    ).decode(bytes);



  /*
    e0 = delimiter
    e1 = empty delimiter

    Convert both to separators
  */


  const values =
    text
      .replace(
        /\xE1/g,
        "\xE0"
      )
      .split(
        "\xE0"
      )
      .filter(
        v => v.length > 0
      );



  /*
    Expected order:

    0-3 Vehicle codes
    4   Surname
    5   Initials
    6   PrDP
    7   ID country
    8   Licence country
    9-12 Restrictions
    13  Licence number
    14  ID number

  */


  return {


    surname:
      values[1] ?? "",


    initials:
      values[2] ?? "",


    idCountryOfIssue:
      values[3] ?? "",


    licenseCountryOfIssue:
      values[4] ?? "",


    licenseNumber:
      values[6] ?? "",


    idNumber:
      values[7] ?? ""


  };

}