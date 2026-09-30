import json
from http.server import BaseHTTPRequestHandler, HTTPServer

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


HOST = "127.0.0.1"
PORT = 5000


def run_theta_protocol(theta_angles):

    if not isinstance(theta_angles, list):
        raise ValueError("thetaAngles must be a list.")

    if len(theta_angles) != 6:
        raise ValueError("Exactly 6 theta angles are required.")

    # ONE shared 6-qubit GHZ state
    qc = QuantumCircuit(6, 6)

    qc.h(0)

    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.cx(2, 3)
    qc.cx(3, 4)
    qc.cx(4, 5)

    # Local theta measurements
    for i, theta in enumerate(theta_angles):

        qc.rz(-float(theta), i)
        qc.h(i)
        qc.measure(i, i)

    # Execute with Qiskit Aer
    simulator = AerSimulator()

    result = simulator.run(
        qc,
        shots=1
    ).result()

    counts = result.get_counts()

    bitstring = max(
        counts,
        key=counts.get
    )

    # Convert Qiskit's c5...c0 ordering
    # into q0...q5 ordering.
    measurements = [
        int(bit)
        for bit in bitstring[::-1]
    ]

    return measurements


class QuantumBackendHandler(BaseHTTPRequestHandler):

    def send_json(self, status_code, payload):

        response = json.dumps(
            payload
        ).encode("utf-8")

        self.send_response(status_code)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.send_header(
            "Content-Type",
            "application/json"
        )

        self.send_header(
            "Content-Length",
            str(len(response))
        )

        self.end_headers()

        self.wfile.write(response)


    def do_OPTIONS(self):

        self.send_response(204)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()


    def do_POST(self):

        if self.path != "/theta-protocol":

            self.send_json(
                404,
                {
                    "success": False,
                    "error": "Endpoint not found."
                }
            )

            return

        try:

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )

            raw_body = self.rfile.read(
                content_length
            )

            request_data = json.loads(
                raw_body.decode("utf-8")
            )

            theta_angles = request_data.get(
                "thetaAngles"
            )

            measurements = run_theta_protocol(
                theta_angles
            )

            self.send_json(
                200,
                {
                    "success": True,
                    "measurements": measurements
                }
            )

        except Exception as exc:

            self.send_json(
                400,
                {
                    "success": False,
                    "error": str(exc)
                }
            )


if __name__ == "__main__":

    print("=" * 60)
    print("Q-Ledger Quantum Backend")
    print("=" * 60)
    print(
        f"Listening on http://{HOST}:{PORT}"
    )
    print(
        "Endpoint: POST /theta-protocol"
    )
    print("=" * 60)

    server = HTTPServer(
        (HOST, PORT),
        QuantumBackendHandler
    )

    server.serve_forever()