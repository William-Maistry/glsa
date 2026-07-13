import forge from "node-forge";


const VERSION2_KEY_128 = `
MIGWAoGBAMqfGO9sPz+kxaRh/qVKsZQGul7NdG1gonSS3KPXTjtcHTFfexA4MkGA
mwKeu9XeTRFgMMxX99WmyaFvNzuxSlCFI/foCkx0TZCFZjpKFHLXryxWrkG1Bl9+
+gKTvTJ4rWk1RvnxYhm3n/Rxo2NoJM/822Oo7YBZ5rmk8NuJU4HLAhAYcJLaZFTO
sYU+aRX4RmoF
`;


const VERSION2_KEY_74 = `
MF8CSwC0BKDfEdHKz/GhoEjU1XP5U6YsWD10klknVhpteh4rFAQlJq9wtVBUc5Dq
bsdI0w/bga20kODDahmGtASy9fae9dobZj5ZUJEw5wIQMJz+2XGf4qXiDJu0R2U4
Kw==
`;



function loadKey(
  key:string
){

  return forge.pki.publicKeyFromPem(
    "-----BEGIN RSA PUBLIC KEY-----\n" +
    key.trim() +
    "\n-----END RSA PUBLIC KEY-----"
  );

}



const key128 =
loadKey(VERSION2_KEY_128);


const key74 =
loadKey(VERSION2_KEY_74);



export function rsaDecryptBlock(
  block:Uint8Array
){

  const key =
    block.length === 128
      ? key128
      : key74;


  const encrypted =
    forge.util.binary.raw.encode(
      block
    );


  const decrypted =
    key.encrypt(
      encrypted
    );


  return new Uint8Array(
    forge.util.createBuffer(
      decrypted,
      "raw"
    ).getBytes()
    .split("")
    .map(
      c=>c.charCodeAt(0)
    )
  );

}