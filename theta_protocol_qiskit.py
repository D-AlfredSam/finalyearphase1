"""
Qiskit backend for the quantum blockchain theta-protocol.

Input:
    JSON list of 6 theta angles on stdin.

Output:
    JSON list [Y1, Y2, Y3, Y4, Y5, Y6].

Example:
    echo '[0.1,0.2,0.3,0.4,0.5,1.741592653589793]' | python theta_protocol_qiskit.py
"""

import json
import sys

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


def run_theta_protocol(theta_angles):
    if len(theta_angles) != 6:
        raise ValueError("Expected exactly 6 theta angles")

    if any(theta < 0 or theta >= 3.141592653589793 for theta in theta_angles):
        raise ValueError("Every theta angle must satisfy 0 <= theta < pi")

    qc = QuantumCircuit(6, 6)

    # 6-qubit GHZ state
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.cx(2, 3)
    qc.cx(3, 4)
    qc.cx(4, 5)

    # Local theta-basis measurements
    for i, theta in enumerate(theta_angles):
        qc.rz(-theta, i)
        qc.h(i)
        qc.measure(i, i)

    simulator = AerSimulator()
    result = simulator.run(qc, shots=1).result()
    counts = result.get_counts()

    bitstring = max(counts, key=counts.get)

    # Qiskit displays classical bits in reverse order.
    # Reverse so index 0 corresponds to validator 1 / Y1.
    measurements = [int(bit) for bit in bitstring[::-1]]

    if len(measurements) != 6:
        raise RuntimeError("Qiskit did not return 6 measurement bits")

    return measurements


def main():
    theta_angles = json.loads(sys.stdin.read())
    measurements = run_theta_protocol(theta_angles)
    print(json.dumps(measurements))


if __name__ == "__main__":
    main()
