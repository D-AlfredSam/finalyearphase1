"""
quantum_ghz_verifier.py
-----------------------
Real Qiskit implementation of the 6-qubit GHZ theta-protocol verifier.

Called by the Node.js backend via:
    python quantum_ghz_verifier.py <theta1> <theta2> <theta3> <theta4> <theta5> <theta6>

Returns a single JSON object to stdout:
{
  "thetas": [t1, t2, t3, t4, t5, t6],
  "measurements": [Y1, Y2, Y3, Y4, Y5, Y6],   Y_j in {0,1}
  "measuredParity": 0 or 1,                     Y1 XOR ... XOR Y6
  "expectedParity": 1,                          floor(sum/pi) mod 2, always 1
  "consensusReached": true/false,               measuredParity === expectedParity
  "thetaSum": <float>,                          must be approx pi
  "backend": "AerSimulator" or "BasicSimulator"
}

theta-protocol (from the paper):
  GHZ state: (|000000> + |111111>) / sqrt(2)
  Each qubit j is measured in basis |+-theta_j>:
        RZ(-theta_j) . H . measure
  Parity check: XOR(Y_j)  ==  floor(sum(theta_j) / pi) mod 2
  Because the caller guarantees sum(theta_j) = pi -> expectedParity = 1
"""

import sys
import json
import math


def run_ghz_verification(thetas):
    from qiskit import QuantumCircuit
    try:
        from qiskit_aer import AerSimulator
        backend = AerSimulator()
        backend_name = "AerSimulator"
    except ImportError:
        from qiskit.providers.basic_provider import BasicSimulator
        backend = BasicSimulator()
        backend_name = "BasicSimulator"

    # 1. Build the 6-qubit GHZ circuit
    qc = QuantumCircuit(6, 6)

    # GHZ preparation: (|000000> + |111111>) / sqrt(2)
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.cx(2, 3)
    qc.cx(3, 4)
    qc.cx(4, 5)

    # 2. Apply theta-basis measurement to each qubit j
    # Measurement in basis |+-theta_j> = RZ(-theta_j) . H . measure
    for j in range(6):
        qc.rz(-thetas[j], j)
        qc.h(j)
        qc.measure(j, j)   # qubit j -> classical bit j

    # 3. Execute on AerSimulator (shots=1: one quantum event per block)
    from qiskit import transpile
    compiled = transpile(qc, backend)
    job = backend.run(compiled, shots=1)
    result = job.result()
    counts = result.get_counts()

    # 4. Extract the single bitstring and correct for Qiskit's bit-order
    # Qiskit returns classical register as MSB-first string:
    #   bitstring[0] = c5,  bitstring[5] = c0
    # We need Y_j = value of classical bit j = bitstring[5 - j]
    bitstring = list(counts.keys())[0].replace(' ', '').zfill(6)
    Y = [int(bitstring[5 - j]) for j in range(6)]
    # Y[0]=Y1 (validator 1, qubit 0) ... Y[5]=Y6 (validator 6, qubit 5)

    # 5. theta-protocol parity check
    theta_sum = sum(thetas)
    expected_parity = int(math.floor(theta_sum / math.pi)) % 2  # = 1

    measured_parity = 0
    for y in Y:
        measured_parity ^= y

    consensus_reached = (measured_parity == expected_parity)

    return {
        "thetas": thetas,
        "measurements": Y,
        "measuredParity": measured_parity,
        "expectedParity": expected_parity,
        "consensusReached": consensus_reached,
        "thetaSum": theta_sum,
        "backend": backend_name
    }


if __name__ == '__main__':
    if len(sys.argv) != 7:
        print(json.dumps({"error": "Usage: python quantum_ghz_verifier.py t1 t2 t3 t4 t5 t6"}))
        sys.exit(1)

    try:
        thetas = [float(sys.argv[i]) for i in range(1, 7)]
    except ValueError as e:
        print(json.dumps({"error": "Invalid theta value: " + str(e)}))
        sys.exit(1)

    try:
        result = run_ghz_verification(thetas)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
