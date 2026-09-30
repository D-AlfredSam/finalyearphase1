# Q-Ledger Consensus & Shared Ledger Simulator

A high-tech distributed blockchain application built for the **Final Year Blockchain Project**. The application models a peer-to-peer blockchain network featuring **1 User Node**, **6 Consensus Validators**, a synchronized **Shared Ledger**, and a **quantum entanglement-based validation protocol** using a shared 6-qubit GHZ state.

The transaction lifecycle combines conventional blockchain mechanisms such as SHA-256 hashing, block chaining, proposer selection, and replicated ledgers with a quantum validation protocol based on the **Quantum Blockchain Using Entanglement in Time** approach.

---

## 🌟 Key Features & Requirements Compliance

| Requirement                     | Implementation Detail                                                                                                              | Status        |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **1 User Node**                 | Initiator account (`0x71A9c4E8...`) with starting balance of 1000.00 QTC and a custom transfer form                                | **Completed** |
| **6 Validators**                | 6 active validator nodes (`Validator-1 Alpha` to `Validator-6 Zeta`) forming the consensus network                                 | **Completed** |
| **Transaction SHA-256 Hashing** | Transaction is deterministically hashed before quantum validation into HEX, 256-bit BINARY, and DECIMAL (`BigInt`) representations | **Completed** |
| **Transaction Angle**           | SHA-256 decimal value is deterministically mapped to a high-precision angle in the `[0, π/4]` range                                | **Completed** |
| **Quantum Verifier Selection**  | One of the 6 validators is randomly selected as the verifier for each transaction                                                  | **Completed** |
| **Shared GHZ State**            | A single 6-qubit GHZ state is prepared, with one qubit corresponding to each validator                                             | **Completed** |
| **Theta Protocol**              | Six independently generated measurement angles satisfy `θ₁ + θ₂ + ... + θ₆ = π`                                                    | **Completed** |
| **Quantum Measurements**        | Each validator obtains a binary measurement result `Yᵢ ∈ {0,1}` from its assigned qubit                                            | **Completed** |
| **Quantum Consensus**           | Consensus is determined from the XOR parity of the six measurement results                                                         | **Completed** |
| **Block Creation**              | A block is created only after successful quantum consensus and linked using the previous block hash                                | **Completed** |
| **Block SHA-256 Hashing**       | Block hash incorporates block metadata, previous hash, transactions, transaction hash, nonce, and proposer                         | **Completed** |
| **Shared Ledger**               | Every validator maintains an identical local copy of the committed blockchain                                                      | **Completed** |
| **Interactive UI**              | Real-time validator matrix, P2P topology, consensus pipeline, ledger explorer, and audit console                                   | **Completed** |
| **Qiskit Backend**              | Browser communicates with a local Python/Qiskit backend for quantum circuit execution                                              | **Completed** |

---

# 🔬 Transaction Hashing & Quantum Validation Pipeline

Each transaction passes through the following stages.

```text
User Transaction
       │
       ▼
Transaction SHA-256
       │
       ├── HEX
       ├── 256-bit Binary
       ├── Decimal BigInt
       └── Transaction Angle
       │
       ▼
Random Verifier Selection
       │
       ▼
Generate θ₁ ... θ₆
Σθᵢ = π
       │
       ▼
ONE Shared 6-Qubit GHZ State
       │
       ├── Qubit 0 → Validator 1
       ├── Qubit 1 → Validator 2
       ├── Qubit 2 → Validator 3
       ├── Qubit 3 → Validator 4
       ├── Qubit 4 → Validator 5
       └── Qubit 5 → Validator 6
       │
       ▼
Local θ Measurements
       │
       ▼
Y₁ Y₂ Y₃ Y₄ Y₅ Y₆
       │
       ▼
XOR Parity Check
       │
       ▼
Quantum Consensus
       │
       ▼
Block Creation
       │
       ▼
Shared Ledger
```

---

## 1. Deterministic Transaction Hashing

Before the transaction enters the quantum validation stage, `hashTransaction(transaction)` creates a deterministic SHA-256 hash.

The transaction data includes:

```text
txId
sender
recipient
amount
fee
timestamp
metadata
signature
status
```

The resulting SHA-256 digest is represented in three forms.

### HEX

A standard 64-character hexadecimal SHA-256 representation:

```text
64 hexadecimal characters
```

### BINARY

The hash is converted into exactly 256 bits:

```javascript
hashArray
    .map(byte =>
        byte.toString(2).padStart(8, '0')
    )
    .join('');
```

Leading zeros are preserved.

### DECIMAL

The complete 256-bit binary value is converted to an exact JavaScript `BigInt`:

```javascript
BigInt(
    '0b' + binary
).toString();
```

This avoids the precision limitations of JavaScript's ordinary `Number` type.

---

# 📐 2. Transaction Hash Angle

The decimal representation of the SHA-256 transaction hash is mapped to a high-precision angle.

The current implementation maps the value into:

```text
[0, π/4]
```

using the existing high-precision constants in `blockchain.js`.

This angle is stored as:

```javascript
transactionHash.angle
```

### Important distinction

The transaction hash angle is **not** one of the quantum consensus angles.

The quantum protocol independently generates:

```text
θ₁, θ₂, θ₃, θ₄, θ₅, θ₆
```

for the six validators.

Therefore:

```text
Transaction hash angle
        ≠
Quantum θ measurement angles
```

---

# 🧑‍⚖️ 3. Quantum Verifier Selection

For each transaction, one validator is randomly selected as the verifier.

Conceptually:

```javascript
const verifierIndex =
    Math.floor(
        Math.random() *
        network.validators.length
    );
```

The selected validator coordinates the quantum validation process.

The other validators still participate in the quantum measurement.

Therefore, the verifier is **not the only validator performing validation**.

---

# 🔗 4. Shared 6-Qubit GHZ State

The quantum protocol uses **one shared six-qubit GHZ state**.

The circuit preparation is:

```text
H(q0)
CX(q0,q1)
CX(q1,q2)
CX(q2,q3)
CX(q3,q4)
CX(q4,q5)
```

Conceptually:

```text
|000000⟩
    │
    ▼
(|000000⟩ + |111111⟩) / √2
```

Each validator is associated with one qubit:

| Validator   | Qubit |
| :---------- | :---: |
| Validator 1 |   q₀  |
| Validator 2 |   q₁  |
| Validator 3 |   q₂  |
| Validator 4 |   q₃  |
| Validator 5 |   q₄  |
| Validator 6 |   q₅  |

There are **not six independent GHZ circuits**.

There is one shared 6-qubit entangled state.

---

# 📐 5. Generation of θ₁ ... θ₆

The verifier generates six random measurement angles:

```text
θ₁
θ₂
θ₃
θ₄
θ₅
θ₆
```

The implementation normalizes the randomly generated values so that:

```text
θ₁ + θ₂ + θ₃ + θ₄ + θ₅ + θ₆ = π
```

and each angle lies within the required range.

The final angle is adjusted using:

```javascript
thetaAngles[5] =
    Math.PI - partialSum;
```

so that the total is π within JavaScript floating-point representation.

---

# 🧪 6. Local Quantum Measurements

Each validator receives a corresponding qubit and performs its local measurement using its assigned angle.

The circuit representation is:

```python
for i, theta in enumerate(theta_angles):

    qc.rz(-theta, i)

    qc.h(i)

    qc.measure(i, i)
```

The quantum backend returns six binary results:

```text
Y₁, Y₂, Y₃, Y₄, Y₅, Y₆
```

where:

```text
Yᵢ ∈ {0,1}
```

These values are recorded for the corresponding validators.

---

# 🧮 7. Quantum Consensus Condition

The six measurement results are combined using XOR:

```text
Y₁ ⊕ Y₂ ⊕ Y₃ ⊕ Y₄ ⊕ Y₅ ⊕ Y₆
```

The protocol checks this against:

```text
(θ₁ + θ₂ + θ₃ + θ₄ + θ₅ + θ₆) / π mod 2
```

Since the current implementation generates:

```text
Σθᵢ = π
```

the expected parity is:

```text
π / π mod 2 = 1
```

Therefore, the implementation checks:

```javascript
const measuredParity =
    measurementResults.reduce(
        (result, bit) =>
            result ^ bit,
        0
    );

const expectedParity = 1;

const consensusReached =
    measuredParity === expectedParity;
```

A block proceeds to the blockchain assembly stage only when the quantum consensus condition is satisfied.

---

# ✅ 8. Transaction Validation Function

The existing:

```javascript
validateTransaction(
    transaction,
    transactionHash
)
```

function is retained as the transaction-validation metadata layer.

It returns information such as:

```javascript
{
    status: "approved",
    isValid: true,
    validatorVote: "approved",
    transactionHash: "...",
    transactionHashBinary: "...",
    transactionHashDecimal: "...",
    transactionHashAngle: "..."
}
```

### Important distinction

`validateTransaction()` is **not the quantum consensus mechanism**.

The actual consensus decision is made by the quantum measurement parity:

```text
Y₁ XOR Y₂ XOR ... XOR Y₆
```

The transaction validation result is recorded after successful quantum consensus.

---

# ⛓️ 9. Block Assembly

After quantum consensus succeeds, the transaction is committed into a new block.

The block contains:

```text
Block Index
Timestamp
Transactions
Previous Hash
Transaction Hash
Nonce
Proposer
Validator Signatures / Measurements
```

The transaction hash and block hash are distinct.

### Transaction Hash

Represents the transaction itself:

```text
SHA-256(transaction data)
```

### Block Hash

Represents the block:

```text
SHA-256(
    index +
    previousHash +
    timestamp +
    transactions +
    transactionHash +
    nonce +
    proposer
)
```

Therefore:

```text
Transaction Hash ≠ Block Hash
```

The block's `previousHash` points to the hash of the preceding block.

---

# 👤 10. Block Proposer

After quantum consensus, a proposer is selected from the validator set.

The current implementation uses the block index to select the proposer:

```javascript
const proposer =
    this.validators[
        newBlockIndex %
        this.validators.length
    ];
```

The proposer is responsible for assembling the block after the consensus stage.

The proposer and quantum verifier are therefore separate concepts:

```text
Verifier
    → coordinates the quantum validation protocol

Proposer
    → assembles the blockchain block
```

---

# 🌐 11. Shared Ledger

After block creation, the block is added to:

```javascript
this.sharedLedger
```

and copied into every validator's local ledger:

```javascript
for (let v of this.validators) {

    v.commitBlock(
        newBlock
    );
}
```

The intended state is:

```text
                    ┌── Validator 1 Ledger
                    │
                    ├── Validator 2 Ledger
                    │
Shared Ledger ───────┼── Validator 3 Ledger
                    │
                    ├── Validator 4 Ledger
                    │
                    ├── Validator 5 Ledger
                    │
                    └── Validator 6 Ledger
```

Each validator therefore maintains a synchronized copy of the blockchain.

---

# 🔐 12. Ledger Integrity Verification

The audit functionality verifies:

### Previous Hash

Each block must reference the hash of the previous block:

```javascript
currentBlock.previousHash ===
    previousBlock.hash
```

### Block Hash

The stored block hash is recalculated and compared with the stored value.

### Transaction Hash

The transaction hash is recalculated and compared against the hash stored inside the block.

This provides three levels of integrity checking:

```text
Previous Block Link
        +
Block Hash
        +
Transaction Hash
```

---

# 🖥️ Project Architecture

The application is divided into frontend, blockchain, visualization, and quantum-backend components.

```text
┌──────────────────────────────────────────────┐
│                  index.html                  │
│             Application Interface            │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┴─────────────┐
          │                          │
          ▼                          ▼
     ┌───────────┐             ┌──────────────┐
     │  app.js   │             │ styles.css   │
     │ UI Logic  │             │ UI Styling   │
     └─────┬─────┘             └──────────────┘
           │
           ▼
     ┌──────────────────┐
     │  blockchain.js   │
     │                  │
     │ Transaction      │
     │ Block            │
     │ Validators       │
     │ SHA-256          │
     │ GHZ protocol     │
     │ θ generation     │
     │ XOR consensus    │
     │ Shared Ledger    │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────────┐
     │ quantum-backend.js   │
     │ Browser ↔ Python     │
     │ HTTP Bridge           │
     └──────────┬───────────┘
                │
                │ HTTP POST
                ▼
     ┌──────────────────────┐
     │ quantum_backend.py   │
     │                      │
     │ Qiskit               │
     │ Qiskit Aer           │
     │ 6-Qubit GHZ Circuit  │
     │ Quantum Measurement  │
     └──────────────────────┘

     ┌──────────────────────────┐
     │ network-visualizer.js    │
     │ HTML5 Canvas P2P Network │
     └──────────────────────────┘
```

---

# 📁 Project Files

| File                        | Purpose                                                                                                                                     |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html`                | Main application interface, dashboard, modals, ledger explorer, and pipeline                                                                |
| `styles.css`                | Dark quantum/cyber UI, glassmorphism panels, cards, animations, and responsive layout                                                       |
| `blockchain.js`             | Core blockchain engine, transactions, blocks, validators, SHA-256 hashing, GHZ protocol, θ generation, quantum consensus, and shared ledger |
| `network-visualizer.js`     | HTML5 Canvas-based P2P topology showing the user node and 6 validators                                                                      |
| `app.js`                    | Frontend controller, consensus pipeline animation, UI state management, sound effects, forms, ledger rendering, and event listeners         |
| `quantum-backend.js`        | Browser-to-Python bridge that sends θ angles to the local quantum backend and receives measurement results                                  |
| `quantum_backend.py`        | Local Qiskit/Aer backend that constructs and executes the 6-qubit GHZ θ-measurement circuit                                                 |
| `server.js`                 | Zero-dependency Node.js HTTP server for serving the web application                                                                         |
| `test_blockchain_engine.js` | Automated tests for the blockchain engine and application requirements                                                                      |

---

# 🚀 How to Run the Application

Because the application now uses a Python/Qiskit backend, the web application and quantum backend must both be running.

## 1. Start the Qiskit Backend

Make sure Qiskit and Qiskit Aer are installed.

Then run:

```bash
python quantum_backend.py
```

The backend should display:

```text
============================================================
Q-Ledger Quantum Backend
============================================================
Listening on http://127.0.0.1:5000
Endpoint: POST /theta-protocol
============================================================
```

Keep this terminal running.

---

## 2. Start the Web Application

The project includes a Node.js server:

```bash
node server.js
```

The application can then be accessed at:

```text
http://127.0.0.1:3000/
```

The browser communicates with the Qiskit backend through:

```text
http://127.0.0.1:5000/theta-protocol
```

---

## 3. Submit a Transaction

From the Q-Ledger interface:

1. Select a recipient.
2. Enter the transfer amount.
3. Enter an optional transaction memo.
4. Click **Submit & Validate Transaction**.

The application then performs:

```text
Create Transaction
        ↓
Add to Mempool
        ↓
SHA-256 Transaction Hash
        ↓
Generate Transaction Metadata
        ↓
Select Quantum Verifier
        ↓
Generate θ₁ ... θ₆
        ↓
Prepare Shared GHZ Circuit
        ↓
Send Circuit Parameters to Qiskit Backend
        ↓
Receive Y₁ ... Y₆
        ↓
Calculate XOR Parity
        ↓
Quantum Consensus
        ↓
Create Block
        ↓
Calculate Block Hash
        ↓
Commit to Shared Ledger
        ↓
Synchronize 6 Validator Ledgers
```

---

# ⚛️ Quantum Backend Architecture

The browser does not directly execute Python or Qiskit.

Instead:

```text
Browser
   │
   │ HTTP POST
   ▼
quantum-backend.js
   │
   ▼
Python HTTP Server
   │
   ▼
Qiskit
   │
   ▼
Qiskit Aer Simulator
   │
   ▼
Measurement Results
   │
   ▼
Browser
```

The browser sends:

```json
{
    "thetaAngles": [
        "θ1",
        "θ2",
        "θ3",
        "θ4",
        "θ5",
        "θ6"
    ]
}
```

The backend returns:

```json
{
    "success": true,
    "measurements": [
        0,
        1,
        1,
        0,
        1,
        0
    ]
}
```

The blockchain engine then calculates the XOR parity from these six measurement results.

---

# 🧪 Quantum Execution Environment

The current implementation uses:

```text
Qiskit
Qiskit Aer
```

Therefore, the quantum circuit is executed using a **local quantum simulator**, not on a physical quantum processor.

The browser/backend architecture has intentionally been separated so that the execution layer can later be replaced with another quantum backend without changing the blockchain UI or core consensus structure.

---

# 🔄 Complete Transaction Lifecycle

For one transaction, the complete process is:

### Phase 1 — Transaction

```text
Alice
  ↓
Transaction Creation
  ↓
Mempool
```

### Phase 2 — Cryptographic Preparation

```text
Transaction
  ↓
SHA-256
  ↓
HEX + Binary + Decimal
  ↓
Transaction Angle
```

### Phase 3 — Quantum Validation

```text
Random Verifier
      ↓
θ₁ ... θ₆
      ↓
Shared 6-Qubit GHZ State
      ↓
Local Measurements
      ↓
Y₁ ... Y₆
      ↓
XOR Parity
```

### Phase 4 — Consensus

```text
Measured Parity
      │
      ▼
Expected Parity
      │
      ▼
Quantum Consensus
```

### Phase 5 — Block

```text
Consensus Passed
      ↓
Block Assembly
      ↓
Block SHA-256
      ↓
Previous Hash Link
```

### Phase 6 — Shared Ledger

```text
Shared Ledger
      ↓
Validator 1
Validator 2
Validator 3
Validator 4
Validator 5
Validator 6
```

---

# ⚠️ Important Implementation Distinctions

### Transaction hash vs. block hash

These are two different SHA-256 values:

```text
Transaction Hash
    → represents transaction data

Block Hash
    → represents the complete block and its chain relationship
```

### Transaction angle vs. θ angles

These are also different:

```text
transactionHash.angle
    → deterministic value derived from transaction hash

θ₁...θ₆
    → independently generated quantum measurement angles
```

### Verifier vs. proposer

```text
Verifier
    → coordinates the quantum validation protocol

Proposer
    → assembles the block after consensus
```

### Quantum measurement vs. validator approval

The six validators do not independently decide:

```text
"approved"
```

through six ordinary votes.

Instead, they contribute the six quantum measurement results:

```text
Y₁ ... Y₆
```

and the consensus condition is evaluated from their combined parity.

---

# 📌 Current Technology Stack

```text
Frontend
├── HTML5
├── CSS3
└── Vanilla JavaScript

Blockchain Layer
├── SHA-256
├── JavaScript BigInt
├── Transaction model
├── Block model
├── Validator nodes
└── Shared replicated ledger

Quantum Layer
├── Qiskit
├── Qiskit Aer
├── 6-qubit GHZ state
├── θ-basis measurements
└── XOR parity consensus

Backend Bridge
├── Python
├── HTTPServer
└── Browser ↔ Qiskit communication


# Project Objective

Q-Ledger demonstrates how a conventional blockchain transaction lifecycle can be combined with a quantum validation layer.

The project separates the two components:

```text
Classical Blockchain
        +
Quantum Consensus Protocol
        =
Quantum-Enhanced Blockchain Demonstration
```

The classical layer handles transaction management, SHA-256 hashing, block construction, hash chaining, proposer selection, ledger replication, and integrity auditing.

The quantum layer handles the shared GHZ state, verifier-selected measurement angles, local measurements, and the XOR-based consensus condition.
