import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import users from "./data/users.json";

function App() {
  const [userId, setUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

        const user = users.find(
          (person) => person.qrCode === decodedText
        );

        setSelectedUser(user);

        scanner.clear();
      },
      (_error) => {
        // Ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };

  }, []);

  return (
    <div style={{ padding: "30px" }}>

      <h1>
        Depot Access Scanner
      </h1>

      <div id="reader"></div>


      {userId && !selectedUser && (
        <div>
          <h2>
            QR Detected
          </h2>

          <p>
            QR Code:
            <strong> {userId}</strong>
          </p>

          <p>
            User not found.
          </p>
        </div>
      )}


      {selectedUser && (
        <div>

          <h2>
            User Found
          </h2>


          <p>
            Name:
            <strong>
              {selectedUser.firstName} {selectedUser.lastName}
            </strong>
          </p>


          <p>
            Type:
            <strong>
              {" "}{selectedUser.type}
            </strong>
          </p>


          <p>
            Company:
            <strong>
              {" "}{selectedUser.company}
            </strong>
          </p>


          <p>
            Employee Number:
            <strong>
              {" "}{selectedUser.employeeNumber}
            </strong>
          </p>


          <p>
            Vehicle:
            <strong>
              {" "}
              {selectedUser.vehicle || "No vehicle assigned"}
            </strong>
          </p>


          <p>
            Status:
            <strong>
              {" "}{selectedUser.status}
            </strong>
          </p>


          <h3>
            Breath Test
          </h3>


          <p>
            Required:
            <strong>
              {" "}
              {selectedUser.breathTest.required ? "Yes" : "No"}
            </strong>
          </p>


          <p>
            Last Result:
            <strong>
              {" "}
              {selectedUser.breathTest.lastResult || "N/A"}
            </strong>
          </p>


          <p>
            BAC:
            <strong>
              {" "}
              {selectedUser.breathTest.bac || "N/A"}
            </strong>
          </p>

        </div>
      )}

    </div>
  );
}

export default App;

