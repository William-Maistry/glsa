import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

function App() {
  const [userId, setUserId] = useState("");

  useEffect(() => {

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setUserId(decodedText);

        scanner.clear();
      },
      (error) => {
        // Ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };

  }, []);


  return (
    <div style={{padding:"30px"}}>

      <h1>
        Depot Access Scanner
      </h1>

      <div id="reader"></div>


      {userId && (
        <div>

          <h2>
            QR Detected
          </h2>

          <p>
            User ID:
            <strong> {userId}</strong>
          </p>

        </div>
      )}

    </div>
  );
}

export default App;