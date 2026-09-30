# Q-Ledger Consensus & Shared Ledger Simulator

A high-tech distributed blockchain application built for the **Final Year Blockchain Project**. This application models a complete peer-to-peer network featuring **1 User**, **6 Consensus Validators**, a synchronized **Shared Ledger**, and an instant-approval validation pipeline.

---

## 🌟 Key Features & Requirements Compliance

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **1 User Node** | Initiator account (`0x71A9c4E8...`) with starting balance (1000.00 QTC) and custom transfer form | **Completed** |
| **6 Validators** | 6 active nodes (`Validator-1 Alpha` to `Validator-6 Zeta`) forming a consensus mesh | **Completed** |
| **Tx SHA-256 Hashing** | Transaction is hashed BEFORE validation into **HEX**, **256-bit BINARY**, and **DECIMAL** (BigInt) | **Completed** |
| **Validation Part** | Function `validateTransaction(tx, transactionHash)` explicitly returns `{ status: "approved" }` with hash metadata | **Completed** |
| **Consensus & Blockchain Logic** | Normal blockchain flow: Genesis block, previous hash chaining (`prevHash`), SHA-256 block hashing (including tx hash), proposer selection, validator signatures, and user state updates | **Completed** |
| **Shared Ledger** | Distributed across all 6 validators. Each validator maintains an identical, synchronized local copy of the chain | **Completed** |
| **Interactive UI** | Real-time HTML5 Canvas topology visualizer, live consensus voting matrix, chained block explorer, and audit terminal | **Completed** |

---

## 🔬 Transaction Hashing & Validation Pipeline

As specified in the prompt:
1. **Deterministic Transaction Hashing**:
   Before a transaction is evaluated by the validators, `hashTransaction(transaction)` serializes `txId, sender, recipient, amount, fee, timestamp, metadata, signature, status` and computes a SHA-256 hash.
   - **HEX**: Standard 64-character hexadecimal string.
   - **BINARY**: Exactly **256 bits** (`hashArray.map(b => b.toString(2).padStart(8, '0')).join('')`), preserving all leading zeros.
   - **DECIMAL**: Converted using JavaScript **`BigInt('0b' + binary).toString()`** for exact numerical precision.

2. **Validator Consensus**:
   The exact same transaction hash is passed into all 6 validators:
   ```javascript
   const transactionHash = await hashTransaction(currentTx);
   for (let validator of network.validators) {
       validator.validateCandidateTransaction(currentTx, transactionHash);
   }
   ```
   Each validator records its vote as `"approved"` along with the full transaction hash representations.

3. **Block Assembly with Distinct Hashes**:
   - **Transaction Hash**: Generated before validation, represents the transaction itself.
   - **Block Hash**: Generated after consensus, incorporates `index + previousHash + timestamp + txString + transactionHash.hex + nonce + proposer` and calculates a distinct SHA-256 block hash.
   - The block is committed to the **Shared Ledger** across all 6 validator copies.

---

## 🚀 How to Run the Website

### Option 1: Using the built-in Node.js server (Already running on port 3000)
Open your browser and navigate to:
```
http://127.0.0.1:3000/
```

To start or restart the server manually:
```bash
node server.js
```

### Option 2: Direct Browser Execution
Because the website is built with pure Vanilla HTML, CSS, and modern JavaScript with native Web Crypto APIs, you can also directly open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).

---

## 📁 Project Architecture

- [index.html](file:///e:/Antigravity-projects/quantum_final_year_block_chain/index.html): Semantic layout, dashboard grid, modal inspectors, and typography.
- [styles.css](file:///e:/Antigravity-projects/quantum_final_year_block_chain/styles.css): Deep-space dark quantum cyber aesthetics, glassmorphism, responsive cards, and animations.
- [blockchain.js](file:///e:/Antigravity-projects/quantum_final_year_block_chain/blockchain.js): Core blockchain data structures (`Transaction`, `Block`, `ValidatorNode`, `SharedLedger`, `validateTransaction`).
- [network-visualizer.js](file:///e:/Antigravity-projects/quantum_final_year_block_chain/network-visualizer.js): High-DPI Canvas-based P2P topology showing packet routing between User and 6 Validators.
- [app.js](file:///e:/Antigravity-projects/quantum_final_year_block_chain/app.js): UI controller, step-by-step consensus pipeline animation, sound synthesizer, and event listeners.
- [server.js](file:///e:/Antigravity-projects/quantum_final_year_block_chain/server.js): Zero-dependency Node.js HTTP server.
- [test_blockchain_engine.js](file:///e:/Antigravity-projects/quantum_final_year_block_chain/test_blockchain_engine.js): Automated test suite verifying all requirements.
