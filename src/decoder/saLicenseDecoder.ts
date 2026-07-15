import { rsaDecryptBlock } from "./rsa";
import { parseLicenseData } from "./parser";
import type { SALicenseData } from "./types";

export function decodeSALicense(
  bytes: Uint8Array
): SALicenseData {

  if (bytes.length !== 720) {
    throw new Error(
      `Invalid barcode length. Expected 720 bytes, got ${bytes.length}`
    );
  }

  const versionBytes =
    bytes.slice(0, 4);

  let version = 2;

  if (versionBytes[1] === 0xe1) {
    version = 1;
  }

  const encrypted =
    bytes.slice(6);

  const blocks = [

    encrypted.slice(0, 128),

    encrypted.slice(128, 256),

    encrypted.slice(256, 384),

    encrypted.slice(384, 512),

    encrypted.slice(512, 640),

    encrypted.slice(640, 714)

  ];

  let decrypted =
    new Uint8Array();

  let debug = "";

  blocks.forEach((block, index) => {

    const result =
      rsaDecryptBlock(
        block,
        version
      );

    debug +=
      `\n========== BLOCK ${index} ==========\n`;

    debug +=
      `Length: ${result.length}\n\n`;

    for (
      let i = 0;
      i < result.length;
      i++
    ) {

      if (i % 16 === 0) {

        debug +=
          i
            .toString(16)
            .padStart(4, "0") +
          ": ";

      }

      debug +=
        result[i]
          .toString(16)
          .padStart(2, "0") +
        " ";

      if (i % 16 === 15) {
        debug += "\n";
      }

    }

    debug += "\n\n";

    const combined =
      new Uint8Array(
        decrypted.length +
        result.length
      );

    combined.set(
      decrypted,
      0
    );

    combined.set(
      result,
      decrypted.length
    );

    decrypted =
      combined;

  });

  (window as any).__blockDebug =
    debug;

  let hex = "";

  for (
    let i = 0;
    i < decrypted.length;
    i++
  ) {

    if (i % 16 === 0) {

      hex +=
        "\n" +
        i
          .toString(16)
          .padStart(4, "0") +
        ": ";

    }

    hex +=
      decrypted[i]
        .toString(16)
        .padStart(2, "0") +
      " ";

  }

  (window as any).__payloadHex =
    hex;

  return parseLicenseData(
    decrypted
  );

}