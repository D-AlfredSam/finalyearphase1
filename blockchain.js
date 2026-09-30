// /**
//  * Quantum-Grade Shared Ledger & Validator Consensus Engine
//  * 
//  * Requirements implemented:
//  * 1. 1 User Node (initiates transactions)
//  * 2. 6 Validator Nodes (participate in consensus)
//  * 3. Validation function: Returns "approved" without needing complex blockchain logic.
//  * 4. Post-validation: Processes like a normal blockchain (block headers, SHA-256 hashing,
//  *    merkle/tx packing, previous hash chaining, block height, validator signatures).
//  * 5. Shared Ledger: Maintained and synchronized synchronously across all 6 validators.
//  */

// // Helper for SHA-256 hashing using Web Crypto API
// async function sha256(message) {
//     if (window.crypto && window.crypto.subtle) {
//         const msgBuffer = new TextEncoder().encode(message);
//         const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
//         const hashArray = Array.from(new Uint8Array(hashBuffer));
//         return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//     }
//     // Fallback simple hash for older environments if needed
//     let hash = 0;
//     for (let i = 0; i < message.length; i++) {
//         const char = message.charCodeAt(i);
//         hash = ((hash << 5) - hash) + char;
//         hash |= 0;
//     }
//     return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
// }

// /**
//  * Arbitrary-precision constant for π/4 scaled by 10^100 (100 decimal digits).
//  * Derived from Machin's formula: π/4 = 4*arctan(1/5) - arctan(1/239)
//  */
// const PI_OVER_4_SCALE_100 = 7853981633974483096156608458198757210492923498437764552437361480769541015715522496570087063355292670n;
// const MAX_256_BIT_DECIMAL = (1n << 256n) - 1n;

// /**
//  * Converts a 256-bit BigInt decimal value into a unique angle in [0, π/4]
//  * using arbitrary-precision arithmetic without floating-point conversion of the 256-bit integer.
//  * Bijective mapping: angle = (decimal / (2^256 - 1)) * (π / 4)
//  * - decimal = 0 -> angle = '0'
//  * - decimal = 2^256 - 1 -> angle = π/4 (0.7853981633974483096156608458198757210492923498437764552437361480769541015715522496570087063355292670)
//  */
// function calculateTransactionAngle(decimal) {
//     const d = BigInt(decimal);
//     if (d === 0n) return '0';
//     const angleScaled = (d * PI_OVER_4_SCALE_100) / MAX_256_BIT_DECIMAL;
//     const frac = angleScaled.toString().padStart(100, '0');
//     return '0.' + frac;
// }

// /**
//  * 1. TRANSACTION HASHING FUNCTION
//  * Deterministically hashes the transaction data using SHA-256 and produces:
//  * - HEX (64 chars)
//  * - BINARY (exactly 256 bits, preserving leading zeros)
//  * - DECIMAL (BigInt representation)
//  * - ANGLE (unique angle in [0, π/4] from BigInt decimal)
//  */
// async function hashTransaction(transaction) {
//     // 2. Hash only the transaction data deterministically
//     const txData = {
//         txId: transaction.txId,
//         sender: transaction.sender,
//         recipient: transaction.recipient,
//         amount: transaction.amount,
//         fee: transaction.fee,
//         timestamp: transaction.timestamp,
//         metadata: transaction.metadata || {},
//         signature: transaction.signature,
//         status: transaction.initialStatus || 'PENDING'
//     };

//     // Deterministic serialization with sorted keys
//     const serialized = JSON.stringify(txData, Object.keys(txData).sort());

//     let hashArray;
//     if (window.crypto && window.crypto.subtle) {
//         const msgBuffer = new TextEncoder().encode(serialized);
//         const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
//         hashArray = Array.from(new Uint8Array(hashBuffer));
//     } else {
//         // Fallback for non-subtle crypto test environments
//         const crypto = typeof require !== 'undefined' ? require('crypto') : null;
//         if (crypto) {
//             const hash = crypto.createHash('sha256').update(serialized).digest();
//             hashArray = Array.from(hash);
//         } else {
//             let hash = 0;
//             for (let i = 0; i < serialized.length; i++) {
//                 hash = ((hash << 5) - hash) + serialized.charCodeAt(i);
//                 hash |= 0;
//             }
//             const hexStr = Math.abs(hash).toString(16).padStart(64, '0');
//             hashArray = [];
//             for (let i = 0; i < 64; i += 2) {
//                 hashArray.push(parseInt(hexStr.substr(i, 2), 16));
//             }
//         }
//     }

//     // Hexadecimal string representation
//     const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

//     // Binary representation: exactly 256 bits (32 bytes * 8 bits, with leading zeros preserved)
//     const binary = hashArray
//         .map(byte => byte.toString(2).padStart(8, '0'))
//         .join('');

//     // Decimal representation generated using BigInt (NOT Number)
//     const decimal = BigInt('0b' + binary).toString();

//     // Unique angle in [0, π/4] calculated directly from 256-bit decimal BigInt
//     // angle = (decimal / (2^256 - 1)) * (π / 4)
//     const angle = calculateTransactionAngle(decimal);

//     return {
//         hex,
//         binary,
//         decimal,
//         angle
//     };
// }

// // ============================================================
// // QUANTUM THETA-PROTOCOL ANGLES
// // ============================================================

// // Generate 6 random theta angles such that:
// //   0 <= theta_j < pi
// //   theta_1 + ... + theta_6 = pi
// //
// // These angles are separate from transactionHash.angle.
// function generateThetaAngles(count = 6) {
//     if (count !== 6) {
//         throw new Error("This implementation requires exactly 6 validators.");
//     }

//     const weights = [];

//     for (let i = 0; i < count; i++) {
//         weights.push(Math.random());
//     }

//     const weightSum = weights.reduce((sum, w) => sum + w, 0);

//     return weights.map(w => (Math.PI * w) / weightSum);
// }


// /**
//  * CORE REQUIREMENT:
//  * "in the block chain validation part just have it as validated in return no need any block chain logic.
//  * just a function that returns approved."
//  * 
//  * Updated to accept transactionHash and include hash representations in the result.
//  */
// function validateTransaction(transaction, transactionHash = null) {
//     // Explicitly requested: Returns 'approved' without requiring complex blockchain logic,
//     // while exposing the transaction hash information.
//     return {
//         status: "approved",
//         isValid: true,
//         validatorVote: "approved",
//         transactionHash: transactionHash ? transactionHash.hex : null,
//         transactionHashBinary: transactionHash ? transactionHash.binary : null,
//         transactionHashDecimal: transactionHash ? transactionHash.decimal : null,
//         transactionHashAngle: transactionHash ? transactionHash.angle : null,
//         approvedAt: Date.now(),
//         message: "Validation successful: transaction approved by consensus."
//     };
// }

// /**
//  * Transaction Model
//  */
// class Transaction {
//     constructor(sender, recipient, amount, fee = 1, metadata = {}) {
//         this.txId = 'tx_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
//         this.sender = sender;
//         this.recipient = recipient;
//         this.amount = parseFloat(amount);
//         this.fee = parseFloat(fee);
//         this.timestamp = Date.now();
//         this.metadata = metadata;
//         this.signature = 'SIG_Q_' + Math.random().toString(36).substr(2, 16).toUpperCase();
//         this.status = 'PENDING'; // PENDING -> VALIDATED -> COMMITTED
//         this.initialStatus = 'PENDING';
//         this.validationDetails = null;
//     }

//     /**
//      * Executes the requested validation function
//      */
//     validate(transactionHash = null) {
//         const result = validateTransaction(this, transactionHash);
//         this.validationDetails = result;
//         if (result.status === 'approved') {
//             this.status = 'VALIDATED';
//         }
//         return result;
//     }

//     getSummary() {
//         return `${this.sender.slice(0, 8)}... sent ${this.amount} QTC to ${this.recipient.slice(0, 8)}...`;
//     }
// }

// /**
//  * Block Model
//  * Contains block index, timestamp, transactions list, previous hash, current block hash,
//  * transaction hash (HEX, BINARY, DECIMAL), and validator signatures demonstrating distributed agreement.
//  */
// class Block {
//     constructor(index, timestamp, transactions, previousHash = '', transactionHash = null) {
//         this.index = index;
//         this.timestamp = timestamp;
//         this.transactions = transactions;
//         this.transactionHash = transactionHash; // Holds { hex, binary, decimal, angle }
//         this.previousHash = previousHash;
//         this.nonce = Math.floor(Math.random() * 90000) + 10000;
//         this.hash = '';
//         this.validatorSignatures = []; // Signatures of the 6 validators approving this block
//         this.proposer = '';
//     }

//     async calculateHash() {
//         const txString = JSON.stringify(this.transactions.map(t => ({
//             txId: t.txId,
//             sender: t.sender,
//             recipient: t.recipient,
//             amount: t.amount,
//             status: t.status
//         })));
//         const txHashStr = this.transactionHash ? (typeof this.transactionHash === 'object' ? this.transactionHash.hex : this.transactionHash) : '';
//         const dataToHash = `${this.index}${this.previousHash}${this.timestamp}${txString}${txHashStr}${this.nonce}${this.proposer}`;
//         return await sha256(dataToHash);
//     }
// }

// /**
//  * Validator Node Model
//  * Represents one of the 6 distributed validator nodes.
//  * Maintains its own local instance of the Shared Ledger.
//  */
// class ValidatorNode {
//     constructor(id, name, address, stake = 100000) {
//         this.id = id;
//         this.name = name;
//         this.address = address;
//         this.stake = stake;
//         this.status = 'ONLINE'; // ONLINE, VALIDATING, CONSENSUS_REACHED, SYNCED
//         this.blocksValidated = 0;
//         this.lastVote = null;
//         this.lastVoteTimestamp = null;
//         // Each validator possesses its own synced copy of the Shared Ledger
//         this.localLedger = [];
//     }

//     /**
//      * Consensus validation step performed by this validator
//      * Uses validateTransaction(tx, transactionHash) which returns 'approved' with hash representations
//      */
//     validateCandidateTransaction(
//     tx,
//     transactionHash = null,
//     qubitIndex = null,
//     theta = null,
//     measurementResult = null,
//     verifier = false
// ) {
//     this.status = 'VALIDATING';

//     this.lastVoteTimestamp = Date.now();

//     return {
//         validatorId: this.id,
//         validatorName: this.name,
//         address: this.address,

//         qubitIndex,
//         theta,

//         // Actual quantum measurement result Y_j
//         measurementResult,

//         // This is no longer an individual "approval".
//         // The final decision is made by the verifier.
//         vote: measurementResult === null ? 'pending' : 'measured',

//         verifier,

//         transactionHash: transactionHash
//             ? transactionHash.hex
//             : null,

//         transactionHashBinary: transactionHash
//             ? transactionHash.binary
//             : null,

//         transactionHashDecimal: transactionHash
//             ? transactionHash.decimal
//             : null,

//         // Keep your existing transaction-derived angle
//         transactionHashAngle: transactionHash
//             ? transactionHash.angle
//             : null,

//         signature:
//             `V_SIG_${this.id}_` +
//             Math.random()
//                 .toString(36)
//                 .substr(2, 8)
//                 .toUpperCase(),

//         timestamp: this.lastVoteTimestamp
//     };
// }

//     /**
//      * Syncs a newly confirmed block to this validator's local copy of the shared ledger
//      */
//     commitBlock(block) {
//         // Clone block to avoid reference pollution in distributed ledger representation
//         const blockCopy = JSON.parse(JSON.stringify(block));
//         this.localLedger.push(blockCopy);
//         this.blocksValidated++;
//         this.status = 'SYNCED';
//     }

//     getLedgerHeight() {
//         return this.localLedger.length;
//     }

//     getLatestBlockHash() {
//         if (this.localLedger.length === 0) return '0x0000000000000000';
//         return this.localLedger[this.localLedger.length - 1].hash;
//     }
// }

// /**
//  * Blockchain Network Manager
//  * Coordinates:
//  * - 1 User
//  * - 6 Validators
//  * - Shared Ledger
//  * - Mempool
//  * - Transaction Lifecycle
//  */
// class BlockchainNetwork {
//     constructor() {
//         // 1 Primary User
//         this.user = {
//             id: 'user_primary',
//             name: 'Alice (Quantum Client)',
//             address: '0x71A9c4E8B03Fa41d6D2802Ce89531De07b22F9c1',
//             balance: 1000.00,
//             quantumKeyId: 'QK-KYBER-9021'
//         };

//         // Other network participants for user transactions
//         this.contacts = [
//             { name: 'Bob (Research Node)', address: '0x3D89bC4E51F417937A4c91B875eA022b7931fA3b' },
//             { name: 'Charlie (Quantum Vault)', address: '0x9924Fa83C90bAe31E3e41F8c2794Dd5C129033eA' },
//             { name: 'Diana (Smart Contract)', address: '0x15F1B94A643B9c025d57F6d802Ce786a34Bf4410' },
//             { name: 'Validator Pool Rewards', address: '0x55609BcA4D8b82F865e903B4628a8dCe7C4a2290' }
//         ];

//         // Exactly 6 Validators as requested
//         this.validators = [
//             new ValidatorNode('VAL_1', 'Validator-1 (Alpha)', '0xV1A4901C46E025Fa981CeD928bA95C170289a01', 250000),
//             new ValidatorNode('VAL_2', 'Validator-2 (Beta)', '0xV2B7390F16C921Db982CeD928bA95C170289b02', 200000),
//             new ValidatorNode('VAL_3', 'Validator-3 (Gamma)', '0xV3C5190D26E032Fc983CeD928bA95C170289c03', 180000),
//             new ValidatorNode('VAL_4', 'Validator-4 (Delta)', '0xV4D8290E36F143Fd984CeD928bA95C170289d04', 195000),
//             new ValidatorNode('VAL_5', 'Validator-5 (Epsilon)', '0xV5E1390A46A254Fe985CeD928bA95C170289e05', 210000),
//             new ValidatorNode('VAL_6', 'Validator-6 (Zeta)', '0xV6F9490B56B365Ff986CeD928bA95C170289f06', 225000)
//         ];

//         // Shared Ledger (authoritative network chain view)
//         this.sharedLedger = [];

//         // Mempool for incoming unconfirmed transactions
//         this.mempool = [];

//         // Network Activity Logs
//         this.logs = [];

//         // Callbacks for UI updates
//         this.onLog = null;
//         this.onStateChange = null;

//         this.isProcessing = false;
//     }

//     /**
//      * Initializes the Genesis Block and synchronizes across all 6 validators
//      */
//     async initializeGenesis() {
//         this.log('SYSTEM', 'Initializing Quantum Shared Ledger network with 6 validators...');

//         const genesisTx = new Transaction(
//             '0x0000000000000000000000000000000000000000',
//             this.user.address,
//             1000.00,
//             0,
//             { note: 'Genesis allocation to primary user node' }
//         );
//         const genesisTxHash = await hashTransaction(genesisTx);
//         genesisTx.status = 'COMMITTED';
//         genesisTx.validationDetails = { 
//             status: 'approved', 
//             validatorVote: 'approved',
//             transactionHash: genesisTxHash.hex,
//             transactionHashBinary: genesisTxHash.binary,
//             transactionHashDecimal: genesisTxHash.decimal,
//             transactionHashAngle: genesisTxHash.angle
//         };

//         const genesisBlock = new Block(0, Date.now(), [genesisTx], '0x0000000000000000000000000000000000000000000000000000000000000000', genesisTxHash);
//         genesisBlock.proposer = this.validators[0].name;
//         genesisBlock.validatorSignatures = this.validators.map(v => ({
//             validatorId: v.id,
//             validatorName: v.name,
//             address: v.address,
//             vote: 'approved',
//             transactionHash: genesisTxHash.hex,
//             transactionHashBinary: genesisTxHash.binary,
//             transactionHashDecimal: genesisTxHash.decimal,
//             transactionHashAngle: genesisTxHash.angle,
//             signature: `GENESIS_SIG_${v.id}`,
//             timestamp: Date.now()
//         }));
//         genesisBlock.hash = await genesisBlock.calculateHash();

//         // Commit to global shared ledger
//         this.sharedLedger.push(genesisBlock);

//         // Commit to every validator's local copy of the shared ledger
//         this.validators.forEach(v => {
//             v.commitBlock(genesisBlock);
//         });

//         this.log('LEDGER', `Genesis Block #0 committed! Hash: ${genesisBlock.hash.slice(0, 16)}... Synced to all 6 validators.`);
//         this.notifyState();
//     }

//     log(type, message, details = null) {
//         const entry = {
//             id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
//             timestamp: new Date().toLocaleTimeString(),
//             type, // USER, MEMPOOL, VALIDATOR, CONSENSUS, LEDGER, SYSTEM
//             message,
//             details
//         };
//         this.logs.unshift(entry);
//         if (this.logs.length > 100) this.logs.pop();
//         if (this.onLog) this.onLog(entry);
//     }

//     notifyState() {
//         if (this.onStateChange) this.onStateChange(this);
//     }

//     /**
//      * Step 1: User initiates transaction and pushes to Mempool
//      */
//     async createTransaction(recipient, amount, fee = 1, memo = '') {
//         amount = parseFloat(amount);
//         fee = parseFloat(fee);

//         if (isNaN(amount) || amount <= 0) {
//             throw new Error('Transaction amount must be a positive number.');
//         }

//         if (this.user.balance < (amount + fee)) {
//             throw new Error(`Insufficient balance! Available: ${this.user.balance} QTC, Required: ${amount + fee} QTC.`);
//         }

//         const tx = new Transaction(
//             this.user.address,
//             recipient,
//             amount,
//             fee,
//             { memo: memo || 'Standard Quantum Transfer', clientKeyId: this.user.quantumKeyId }
//         );

//         this.mempool.push(tx);
//         this.log('USER', `User initiated transaction: ${amount} QTC to ${recipient.slice(0, 10)}... (Fee: ${fee} QTC)`);
//         this.log('MEMPOOL', `Tx ${tx.txId} entered pending mempool queue.`);

//         this.notifyState();
//         return tx;
//     }

//     /**
//      * Step 2 & 3: Run Blockchain Validation & Process Consensus Block
//      * Processes transaction:
//      * - Generates SHA-256 transaction hash (HEX, 256-bit BINARY, DECIMAL) ONCE before validation
//      * - Sends the SAME hash to all 6 validators
//      * - In the validation part, each validator invokes validateCandidateTransaction returning 'approved' with hash details
//      * - Collects votes from all 6 validators
//      * - When approved, packages block with previous hash and transaction hash, hashes block with SHA-256,
//      *   mints block, commits to the Shared Ledger across all 6 validators,
//      *   and updates user balance.
//      */
//     async processMempoolPipeline(stepCallback = null) {
//         if (this.isProcessing || this.mempool.length === 0) return null;
//         this.isProcessing = true;

//         try {
//             const currentTx = this.mempool[0];

//             // 1. Calculate transaction hash ONCE before validator validation
//             const transactionHash = await hashTransaction(currentTx);

//             // Phase 1: Notify start of validation
//             if (stepCallback) await stepCallback({ phase: 'VALIDATION_START', tx: currentTx, transactionHash });
//             this.log('CONSENSUS', `Broadcasting Tx ${currentTx.txId} to 6 validators for verification...`);
//             this.log('CONSENSUS', `Transaction SHA-256 Hash:\nHEX: ${transactionHash.hex}\nBinary: ${transactionHash.binary.slice(0, 32)}...${transactionHash.binary.slice(-32)} (256 bits)\nDecimal: ${transactionHash.decimal.slice(0, 24)}... (BigInt)\nAngle: ${transactionHash.angle.length > 24 ? transactionHash.angle.slice(0, 24) + '...' : transactionHash.angle} rad [0, π/4]`);

//             // Phase 2: Each of the 6 Validators receives the EXACT SAME transaction hash
//             const validatorVotes = [];
//             for (let i = 0; i < this.validators.length; i++) {
//                 const validator = this.validators[i];
//                 this.log('VALIDATOR', `${validator.name} received transaction hash 0x${transactionHash.hex.slice(0, 16)}...`);

//                 // Validator runs validation function which returns 'approved' with transaction hash info
//                 const voteResult = validator.validateCandidateTransaction(currentTx, transactionHash);
//                 validatorVotes.push(voteResult);

//                 this.log('VALIDATOR', `${validator.name} evaluated Tx -> Result: "${voteResult.vote.toUpperCase()}" [Signature: ${voteResult.signature.slice(0, 14)}...]`);

//                 if (stepCallback) {
//                     await stepCallback({
//                         phase: 'VALIDATOR_VOTE',
//                         validatorIndex: i,
//                         validator,
//                         voteResult,
//                         tx: currentTx,
//                         transactionHash,
//                         progress: `${i + 1}/6`
//                     });
//                 }
//                 // Short simulation delay for visual feedback
//                 await new Promise(r => setTimeout(r, 260));
//             }

//             // Phase 3: Consensus Check
//             // Every validator returned 'approved'
//             const approvedVotes = validatorVotes.filter(v => v.vote === 'approved');
//             const consensusReached = approvedVotes.length === this.validators.length;

//             if (!consensusReached) {
//                 throw new Error("Consensus failed: Not all validators approved transaction.");
//             }

//             // Mark transaction validated
//             currentTx.validate(transactionHash); // sets status to 'VALIDATED'
//             this.log('CONSENSUS', `Consensus Achieved: 6/6 Validators APPROVED transaction! Proceeding to block assembly.`);

//             if (stepCallback) await stepCallback({ phase: 'CONSENSUS_REACHED', approvedCount: approvedVotes.length, transactionHash });
//             await new Promise(r => setTimeout(r, 300));

//             // Phase 4: Propose and Mine Block (Normal Blockchain processing)
//             const previousBlock = this.sharedLedger[this.sharedLedger.length - 1];
//             const newBlockIndex = this.sharedLedger.length;
//             const blockTimestamp = Date.now();

//             // Randomly select one of the 6 validators as proposer for this round
//             const proposer = this.validators[newBlockIndex % this.validators.length];

//             // Mark tx as COMMITTED
//             currentTx.status = 'COMMITTED';

//             const newBlock = new Block(
//                 newBlockIndex,
//                 blockTimestamp,
//                 [currentTx],
//                 previousBlock.hash,
//                 transactionHash // Store transaction hash inside block
//             );
//             newBlock.proposer = proposer.name;
//             newBlock.validatorSignatures = validatorVotes;

//             // Calculate cryptographic SHA-256 hash linking to previous block and transaction hash
//             newBlock.hash = await newBlock.calculateHash();

//             this.log('BLOCK', `Block #${newBlock.index} successfully created by proposer ${proposer.name}. Hash: ${newBlock.hash.slice(0, 18)}... (PrevHash: ${newBlock.previousHash.slice(0, 18)}...)`);

//             if (stepCallback) await stepCallback({ phase: 'BLOCK_MINTED', block: newBlock, transactionHash });
//             await new Promise(r => setTimeout(r, 350));

//             // Phase 5: Propagate and Commit to Shared Ledger across all 6 validators
//             this.sharedLedger.push(newBlock);
//             for (let v of this.validators) {
//                 v.commitBlock(newBlock);
//             }

//             // Phase 6: State Settlement (Update User Balance)
//             this.user.balance -= (currentTx.amount + currentTx.fee);
//             // Remove from mempool
//             this.mempool.shift();

//             this.log('LEDGER', `Shared Ledger updated! Height: ${this.sharedLedger.length}. All 6 validators synchronized.`);
//             this.log('USER', `User balance updated: ${this.user.balance.toFixed(2)} QTC (-${currentTx.amount + currentTx.fee} QTC).`);

//             if (stepCallback) await stepCallback({ phase: 'LEDGER_COMMITTED', block: newBlock, tx: currentTx, transactionHash });

//             this.notifyState();
//             return { block: newBlock, tx: currentTx, transactionHash };
//         } finally {
//             this.isProcessing = false;
//         }
//     }

//     /**
//      * Validates integrity of the entire shared ledger across all blocks
//      */
//     async verifyLedgerIntegrity() {
//         for (let i = 1; i < this.sharedLedger.length; i++) {
//             const currentBlock = this.sharedLedger[i];
//             const prevBlock = this.sharedLedger[i - 1];

//             if (currentBlock.previousHash !== prevBlock.hash) {
//                 return { valid: false, brokenAtIndex: i, reason: "Previous hash mismatch" };
//             }

//             const calculatedHash = await currentBlock.calculateHash();
//             if (currentBlock.hash !== calculatedHash) {
//                 return { valid: false, brokenAtIndex: i, reason: "Block hash tampering detected" };
//             }

//             // Verify stored transaction hash corresponds to the transaction in the block
//             if (currentBlock.transactions && currentBlock.transactions.length > 0 && currentBlock.transactionHash) {
//                 const primaryTx = currentBlock.transactions[0];
//                 const recomputedTxHash = await hashTransaction(primaryTx);
//                 const currentHex = typeof currentBlock.transactionHash === 'object' ? currentBlock.transactionHash.hex : currentBlock.transactionHash;
//                 if (recomputedTxHash.hex !== currentHex) {
//                     return { valid: false, brokenAtIndex: i, reason: "Transaction hash integrity mismatch" };
//                 }
//             }
//         }
//         return { valid: true, blockCount: this.sharedLedger.length };
//     }
// }

// // Export instance
// window.QChain = {
//     hashTransaction,
//     validateTransaction,
//     calculateTransactionAngle,
//     BlockchainNetwork,
//     Transaction,
//     Block,
//     ValidatorNode
// };


/**
 * Quantum-Grade Shared Ledger & Validator Consensus Engine
 *
 * Requirements implemented:
 * 1. 1 User Node
 * 2. 6 Validator Nodes
 * 3. Quantum theta-protocol validation using a 6-qubit GHZ state.
 * 4. Normal blockchain processing after quantum validation.
 * 5. Shared Ledger synchronized across all 6 validators.
 */

// ============================================================
// SHA-256 HELPER
// ============================================================

async function sha256(message) {
    if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer =
            await window.crypto.subtle.digest('SHA-256', msgBuffer);

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    let hash = 0;

    for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}


// ============================================================
// EXISTING HIGH-PRECISION CONSTANTS
// ============================================================

const PI_OVER_4_SCALE_100 =
    7853981633974483096156608458198757210492923498437764552437361480769541015715522496570087063355292670n;

const MAX_256_BIT_DECIMAL =
    (1n << 256n) - 1n;


// ============================================================
// EXISTING TRANSACTION ANGLE
// DO NOT CHANGE
// ============================================================

function calculateTransactionAngle(decimal) {

    const d = BigInt(decimal);

    if (d === 0n) {
        return '0';
    }

    const angleScaled =
        (d * PI_OVER_4_SCALE_100) /
        MAX_256_BIT_DECIMAL;

    const frac =
        angleScaled.toString().padStart(100, '0');

    return '0.' + frac;
}


// ============================================================
// EXISTING TRANSACTION HASHING
// DO NOT CHANGE
// ============================================================

async function hashTransaction(transaction) {

    const txData = {
        txId: transaction.txId,
        sender: transaction.sender,
        recipient: transaction.recipient,
        amount: transaction.amount,
        fee: transaction.fee,
        timestamp: transaction.timestamp,
        metadata: transaction.metadata || {},
        signature: transaction.signature,
        status: transaction.initialStatus || 'PENDING'
    };

    const serialized =
        JSON.stringify(
            txData,
            Object.keys(txData).sort()
        );

    let hashArray;

    if (window.crypto && window.crypto.subtle) {

        const msgBuffer =
            new TextEncoder().encode(serialized);

        const hashBuffer =
            await window.crypto.subtle.digest(
                'SHA-256',
                msgBuffer
            );

        hashArray =
            Array.from(new Uint8Array(hashBuffer));

    } else {

        const crypto =
            typeof require !== 'undefined'
                ? require('crypto')
                : null;

        if (crypto) {

            const hash =
                crypto
                    .createHash('sha256')
                    .update(serialized)
                    .digest();

            hashArray =
                Array.from(hash);

        } else {

            let hash = 0;

            for (let i = 0; i < serialized.length; i++) {
                hash =
                    ((hash << 5) - hash) +
                    serialized.charCodeAt(i);

                hash |= 0;
            }

            const hexStr =
                Math.abs(hash)
                    .toString(16)
                    .padStart(64, '0');

            hashArray = [];

            for (let i = 0; i < 64; i += 2) {
                hashArray.push(
                    parseInt(
                        hexStr.substr(i, 2),
                        16
                    )
                );
            }
        }
    }

    const hex =
        hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

    const binary =
        hashArray
            .map(byte =>
                byte.toString(2).padStart(8, '0')
            )
            .join('');

    const decimal =
        BigInt('0b' + binary).toString();

    const angle =
        calculateTransactionAngle(decimal);

    return {
        hex,
        binary,
        decimal,
        angle
    };
}


// ============================================================
// QUANTUM THETA-PROTOCOL
// ============================================================
//
// IMPORTANT:
//
// transactionHash.angle is NOT used as theta_j.
//
// The paper's verifier independently generates:
//
// theta_1 ... theta_6
//
// satisfying:
//
// theta_1 + ... + theta_6 = pi
//
// These are used only for quantum verification.
// ============================================================

function generateThetaAngles(count = 6) {

    if (count !== 6) {
        throw new Error(
            'Theta protocol requires exactly 6 validators.'
        );
    }

    /*
     * Generate six positive random weights.
     *
     * They are normalized so that:
     *
     * theta_1 + ... + theta_6 = pi
     *
     * and every theta_j is in [0, pi).
     */

    const weights = [];

    for (let i = 0; i < 6; i++) {
        weights.push(Math.random());
    }

    const weightSum =
        weights.reduce(
            (sum, value) => sum + value,
            0
        );

    const thetaAngles =
        weights.map(
            value =>
                (Math.PI * value) /
                weightSum
        );

    /*
     * Correct the final angle so the sum is exactly
     * pi within JavaScript floating-point representation.
     */

    let partialSum = 0;

    for (let i = 0; i < 5; i++) {
        partialSum += thetaAngles[i];
    }

    thetaAngles[5] =
        Math.PI - partialSum;

    return thetaAngles;
}


// ============================================================
// BUILD ONE SHARED 6-QUBIT GHZ CIRCUIT
// ============================================================
//
// This is ONE circuit.
//
// It is NOT six independent GHZ circuits.
//
// q0 -> Validator 1
// q1 -> Validator 2
// q2 -> Validator 3
// q3 -> Validator 4
// q4 -> Validator 5
// q5 -> Validator 6
// ============================================================

function buildThetaProtocolCircuit(thetaAngles) {

    if (
        !Array.isArray(thetaAngles) ||
        thetaAngles.length !== 6
    ) {
        throw new Error(
            'Expected exactly 6 theta angles.'
        );
    }

    const gates = [

        // GHZ preparation
        {
            name: 'H',
            qubit: 0
        },

        {
            name: 'CX',
            control: 0,
            target: 1
        },

        {
            name: 'CX',
            control: 1,
            target: 2
        },

        {
            name: 'CX',
            control: 2,
            target: 3
        },

        {
            name: 'CX',
            control: 3,
            target: 4
        },

        {
            name: 'CX',
            control: 4,
            target: 5
        }
    ];

    const measurements = [];

    // Local theta measurements
    for (let i = 0; i < 6; i++) {

        gates.push({
            name: 'RZ',
            qubit: i,
            angle: -thetaAngles[i]
        });

        gates.push({
            name: 'H',
            qubit: i
        });

        measurements.push({
            qubit: i,
            classicalBit: i,
            validatorIndex: i
        });
    }

    /*
     * Qiskit source representation.
     *
     * The actual execution is performed by the quantum
     * backend bridge.
     */

    const qiskitCode = `
from qiskit import QuantumCircuit

qc = QuantumCircuit(6, 6)

# ============================================================
# 6-QUBIT GHZ STATE
# ============================================================

qc.h(0)

qc.cx(0, 1)
qc.cx(1, 2)
qc.cx(2, 3)
qc.cx(3, 4)
qc.cx(4, 5)

# ============================================================
# THETA MEASUREMENTS
# ============================================================

theta_angles = ${JSON.stringify(thetaAngles)}

for i, theta in enumerate(theta_angles):

    qc.rz(-theta, i)

    qc.h(i)

    qc.measure(i, i)
`;

    return {

        numQubits: 6,

        numClassicalBits: 6,

        thetaAngles,

        gates,

        measurements,

        qiskitCode
    };
}


// ============================================================
// EXECUTE QUANTUM THETA PROTOCOL
// ============================================================
//
// This function does NOT fake quantum results.
//
// The actual Qiskit/Aer execution must be connected through:
//
// window.QChainQuantumBackend.runThetaProtocol()
//
// It must return:
//
// [Y1, Y2, Y3, Y4, Y5, Y6]
// ============================================================

async function runQuantumThetaProtocol(thetaAngles) {

    const circuit =
        buildThetaProtocolCircuit(
            thetaAngles
        );

    if (
        !window.QChainQuantumBackend ||
        typeof window.QChainQuantumBackend.runThetaProtocol !==
        'function'
    ) {

        throw new Error(
            'Quantum backend not connected. ' +
            'Provide window.QChainQuantumBackend.runThetaProtocol() ' +
            'for actual Qiskit execution.'
        );
    }

    const measurementResults =
        await window.QChainQuantumBackend.runThetaProtocol({

            thetaAngles,

            circuit
        });

    if (
        !Array.isArray(measurementResults) ||
        measurementResults.length !== 6 ||
        measurementResults.some(
            bit =>
                Number(bit) !== 0 &&
                Number(bit) !== 1
        )
    ) {

        throw new Error(
            'Quantum backend must return exactly 6 binary measurement results.'
        );
    }

    return measurementResults.map(
        bit => Number(bit)
    );
}


// ============================================================
// EXISTING SIMPLE TRANSACTION VALIDATION
// ============================================================
//
// Kept unchanged in purpose.
// Quantum consensus is handled separately.
// ============================================================

function validateTransaction(
    transaction,
    transactionHash = null
) {

    return {

        status: "approved",

        isValid: true,

        validatorVote: "approved",

        transactionHash:
            transactionHash
                ? transactionHash.hex
                : null,

        transactionHashBinary:
            transactionHash
                ? transactionHash.binary
                : null,

        transactionHashDecimal:
            transactionHash
                ? transactionHash.decimal
                : null,

        transactionHashAngle:
            transactionHash
                ? transactionHash.angle
                : null,

        approvedAt: Date.now(),

        message:
            "Validation successful: transaction approved by consensus."
    };
}


// ============================================================
// TRANSACTION MODEL
// ============================================================

class Transaction {

    constructor(
        sender,
        recipient,
        amount,
        fee = 0,
        metadata = {}
    ) {

        this.txId =
            'TX_' +
            Date.now() +
            '_' +
            Math.random()
                .toString(36)
                .substr(2, 8)
                .toUpperCase();

        this.sender = sender;

        this.recipient = recipient;

        this.amount = amount;

        this.fee = fee;

        this.timestamp = Date.now();

        this.metadata = metadata;

        this.signature =
            'SIG_' +
            Math.random()
                .toString(36)
                .substr(2, 16)
                .toUpperCase();

        this.initialStatus = 'PENDING';

        this.status = 'PENDING';

        this.validationDetails = null;
    }

    validate(transactionHash = null) {

        this.status = 'VALIDATED';

        this.validationDetails =
            validateTransaction(
                this,
                transactionHash
            );
    }
}


// ============================================================
// BLOCK MODEL
// ============================================================

class Block {

    constructor(
        index,
        timestamp,
        transactions,
        previousHash = '',
        transactionHash = null,
        nonce = 0
    ) {

        this.index = index;

        this.timestamp = timestamp;

        this.transactions = transactions;

        this.previousHash = previousHash;

        this.transactionHash =
            transactionHash;

        this.nonce = nonce;

        this.hash = '';

        this.validatorSignatures = [];

        this.proposer = null;
    }

    async calculateHash() {

        const txString =
            JSON.stringify(
                this.transactions.map(
                    t => ({
                        txId: t.txId,
                        sender: t.sender,
                        recipient: t.recipient,
                        amount: t.amount,
                        fee: t.fee,
                        timestamp: t.timestamp,
                        metadata: t.metadata,
                        signature: t.signature,
                        status: t.status
                    })
                )
            );

        const txHashStr =
            this.transactionHash
                ? (
                    typeof this.transactionHash === 'object'
                        ? this.transactionHash.hex
                        : this.transactionHash
                )
                : '';

        const dataToHash =
            `${this.index}` +
            `${this.previousHash}` +
            `${this.timestamp}` +
            `${txString}` +
            `${txHashStr}` +
            `${this.nonce}` +
            `${this.proposer}`;

        return await sha256(dataToHash);
    }
}


// ============================================================
// VALIDATOR NODE
// ============================================================

class ValidatorNode {

    constructor(
        id,
        name,
        address,
        stake = 100000
    ) {

        this.id = id;

        this.name = name;

        this.address = address;

        this.stake = stake;

        this.status = 'ONLINE';

        this.blocksValidated = 0;

        this.lastVote = null;

        this.lastVoteTimestamp = null;

        this.localLedger = [];
    }


    // ========================================================
    // QUANTUM VALIDATION
    // ========================================================
    //
    // This validator does NOT independently approve the block.
    //
    // It represents one qubit and one measurement Y_j.
    // The final decision belongs to the verifier.
    // ========================================================

    validateCandidateTransaction(

        tx,

        transactionHash = null,

        qubitIndex = null,

        theta = null,

        measurementResult = null,

        verifier = false

    ) {

        this.status = 'VALIDATING';

        this.lastVoteTimestamp =
            Date.now();

        return {

            validatorId: this.id,

            validatorName: this.name,

            address: this.address,

            qubitIndex,

            theta,

            measurementResult,

            vote:
                measurementResult === null
                    ? 'pending'
                    : 'measured',

            verifier,

            transactionHash:
                transactionHash
                    ? transactionHash.hex
                    : null,

            transactionHashBinary:
                transactionHash
                    ? transactionHash.binary
                    : null,

            transactionHashDecimal:
                transactionHash
                    ? transactionHash.decimal
                    : null,

            transactionHashAngle:
                transactionHash
                    ? transactionHash.angle
                    : null,

            signature:
                `V_SIG_${this.id}_` +
                Math.random()
                    .toString(36)
                    .substr(2, 8)
                    .toUpperCase(),

            timestamp:
                this.lastVoteTimestamp
        };
    }


    // ========================================================
    // EXISTING LEDGER COMMIT
    // ========================================================

    commitBlock(block) {

        const blockCopy =
            JSON.parse(
                JSON.stringify(block)
            );

        this.localLedger.push(
            blockCopy
        );

        this.blocksValidated++;

        this.status = 'SYNCED';
    }


    getLedgerHeight() {

        return this.localLedger.length;
    }


    getLatestBlockHash() {

        if (
            this.localLedger.length === 0
        ) {

            return '0x0000000000000000';
        }

        return this.localLedger[
            this.localLedger.length - 1
        ].hash;
    }
}


// ============================================================
// BLOCKCHAIN NETWORK
// ============================================================

class BlockchainNetwork {

    constructor() {

        // ====================================================
        // PRIMARY USER
        // ====================================================

        this.user = {

            id: 'user_primary',

            name: 'Alice (Quantum Client)',

            address:
                '0x71A9c4E8B03Fa41d6D2802Ce89531De07b22F9c1',

            balance: 1000.00,

            quantumKeyId:
                'QK-KYBER-9021'
        };


        // ====================================================
        // CONTACTS
        // ====================================================

        this.contacts = [

            {
                name: 'Bob (Research Node)',
                address:
                    '0x3D89bC4E51F417937A4c91B875eA022b7931fA3b'
            },

            {
                name: 'Charlie (Quantum Vault)',
                address:
                    '0x9924Fa83C90bAe31E3e41F8c2794Dd5C129033eA'
            },

            {
                name: 'Diana (Smart Contract)',
                address:
                    '0x15F1B94A643B9c025d57F6d802Ce786a34Bf4410'
            },

            {
                name: 'Validator Pool Rewards',
                address:
                    '0x55609BcA4D8b82F865e903B4628a8dCe7C4a2290'
            }
        ];


        // ====================================================
        // EXACTLY 6 VALIDATORS
        // ====================================================

        this.validators = [

            new ValidatorNode(
                'VAL_1',
                'Validator-1 (Alpha)',
                '0xV1A4901C46E025Fa981CeD928bA95C170289a01',
                250000
            ),

            new ValidatorNode(
                'VAL_2',
                'Validator-2 (Beta)',
                '0xV2B7390F16C921Db982CeD928bA95C170289b02',
                200000
            ),

            new ValidatorNode(
                'VAL_3',
                'Validator-3 (Gamma)',
                '0xV3C5190D26E032Fc983CeD928bA95C170289c03',
                180000
            ),

            new ValidatorNode(
                'VAL_4',
                'Validator-4 (Delta)',
                '0xV4D7190E36F142Fd984CeD928bA95C170289d04',
                195000
            ),

            new ValidatorNode(
                'VAL_5',
                'Validator-5 (Epsilon)',
                '0xV5E1390A46A254Fe985CeD928bA95C170289e05',
                210000
            ),

            new ValidatorNode(
                'VAL_6',
                'Validator-6 (Zeta)',
                '0xV6F9490B56B365Ff986CeD928bA95C170289f06',
                225000
            )
        ];


        // ====================================================
        // SHARED LEDGER
        // ====================================================

        this.sharedLedger = [];


        // ====================================================
        // MEMPOOL
        // ====================================================

        this.mempool = [];


        // ====================================================
        // LOGS
        // ====================================================

        this.logs = [];


        // ====================================================
        // CALLBACKS
        // ====================================================

        this.onLog = null;

        this.onStateChange = null;

        this.isProcessing = false;
    }


    // ========================================================
    // GENESIS BLOCK
    // ========================================================

    async initializeGenesis() {

        this.log(
            'SYSTEM',
            'Initializing Quantum Shared Ledger network with 6 validators...'
        );

        const genesisTx =
            new Transaction(

                '0x0000000000000000000000000000000000000000',

                this.user.address,

                1000.00,

                0,

                {
                    note:
                        'Genesis allocation to primary user node'
                }
            );

        const genesisTxHash =
            await hashTransaction(
                genesisTx
            );

        genesisTx.status =
            'COMMITTED';

        genesisTx.validationDetails = {

            status: 'approved',

            validatorVote: 'approved',

            transactionHash:
                genesisTxHash.hex,

            transactionHashBinary:
                genesisTxHash.binary,

            transactionHashDecimal:
                genesisTxHash.decimal,

            transactionHashAngle:
                genesisTxHash.angle
        };


        const genesisBlock =
            new Block(

                0,

                Date.now(),

                [genesisTx],

                '0x0000000000000000000000000000000000000000000000000000000000000000',

                genesisTxHash
            );


        genesisBlock.proposer =
            this.validators[0].name;


        genesisBlock.validatorSignatures =
            this.validators.map(
                v => ({

                    validatorId: v.id,

                    validatorName: v.name,

                    address: v.address,

                    vote: 'approved',

                    transactionHash:
                        genesisTxHash.hex,

                    transactionHashBinary:
                        genesisTxHash.binary,

                    transactionHashDecimal:
                        genesisTxHash.decimal,

                    transactionHashAngle:
                        genesisTxHash.angle,

                    signature:
                        `GENESIS_SIG_${v.id}`,

                    timestamp:
                        Date.now()
                })
            );


        genesisBlock.hash =
            await genesisBlock.calculateHash();


        this.sharedLedger.push(
            genesisBlock
        );


        this.validators.forEach(
            v => {

                v.commitBlock(
                    genesisBlock
                );
            }
        );


        this.log(
            'LEDGER',
            `Genesis Block #0 committed! Hash: ` +
            `${genesisBlock.hash.slice(0, 16)}... ` +
            `Synced to all 6 validators.`
        );


        this.notifyState();
    }


    // ========================================================
    // LOG
    // ========================================================

    log(
        type,
        message,
        details = null
    ) {

        const entry = {

            id:
                'log_' +
                Date.now() +
                '_' +
                Math.random()
                    .toString(36)
                    .substr(2, 4),

            timestamp:
                new Date()
                    .toLocaleTimeString(),

            type,

            message,

            details
        };


        this.logs.push(
            entry
        );


        if (this.onLog) {
            this.onLog(entry);
        }
    }


    // ========================================================
    // STATE NOTIFICATION
    // ========================================================

    notifyState() {

        if (this.onStateChange) {
            this.onStateChange(
                this
            );
        }
    }


    // ========================================================
    // CREATE TRANSACTION AND ADD TO MEMPOOL
    // ========================================================

    async createTransaction(
        recipient,
        amount,
        fee = 1,
        memo = ''
    ) {

        const transaction =
            new Transaction(
                this.user.address,
                recipient,
                Number(amount),
                Number(fee),
                {
                    memo,
                    clientKeyId:
                        this.user.quantumKeyId
                }
            );

        this.addTransaction(
            transaction
        );

        return transaction;
    }


    // ========================================================
    // ADD TRANSACTION TO MEMPOOL
    // ========================================================

    addTransaction(
        transaction
    ) {

        this.mempool.push(
            transaction
        );

        this.log(
            'MEMPOOL',
            `Transaction ${transaction.txId} added to mempool.`
        );

        this.notifyState();
    }


    // ========================================================
    // PROCESS ONE BLOCK AT A TIME
    // ========================================================

    async processMempoolPipeline(
        stepCallback = null
    ) {

        if (this.isProcessing) {
            return null;
        }

        if (
            this.mempool.length === 0
        ) {

            return null;
        }


        this.isProcessing = true;


        try {

            // =================================================
            // ONE TRANSACTION AT A TIME
            // =================================================

            const currentTx =
                this.mempool[0];


            this.log(
                'MEMPOOL',
                `Processing transaction ${currentTx.txId}...`
            );


            if (stepCallback) {

                await stepCallback({

                    phase:
                        'TRANSACTION_RECEIVED',

                    tx:
                        currentTx
                });
            }


            await new Promise(
                r => setTimeout(r, 300)
            );


            // =================================================
            // EXISTING TRANSACTION HASH
            // =================================================

            const transactionHash =
                await hashTransaction(
                    currentTx
                );


            this.log(
                'VALIDATOR',
                `Transaction hashed. ` +
                `SHA-256: ${transactionHash.hex.slice(0, 18)}...`
            );


            this.log(
                'VALIDATOR',
                `Binary: ${transactionHash.binary.slice(0, 32)}...`
            );


            this.log(
                'VALIDATOR',
                `Decimal: ${transactionHash.decimal}`
            );


            this.log(
                'VALIDATOR',
                `Angle: ${transactionHash.angle.length > 24
                    ? transactionHash.angle.slice(0, 24) + '...'
                    : transactionHash.angle
                } rad [0, π/4]`
            );


            // =================================================
            // PHASE 2:
            // QUANTUM THETA-PROTOCOL VALIDATION
            // =================================================

            // Randomly select ONE validator as verifier.
            const verifierIndex =
                Math.floor(
                    Math.random() *
                    this.validators.length
                );

            const verifier =
                this.validators[
                verifierIndex
                ];


            // Generate theta_1 ... theta_6.
            const thetaAngles =
                generateThetaAngles(6);


            // Build ONE shared 6-qubit GHZ circuit.
            const quantumCircuit =
                buildThetaProtocolCircuit(
                    thetaAngles
                );


            this.log(
                'CONSENSUS',
                `Verifier selected: ${verifier.name}`
            );


            this.log(
                'CONSENSUS',
                `Theta protocol circuit prepared. ` +
                `Sum(theta) = ${thetaAngles.reduce(
                    (sum, theta) =>
                        sum + theta,
                    0
                )
                } rad`
            );


            // =================================================
            // ACTUAL QUANTUM EXECUTION
            // =================================================

            const measurementResults =
                await runQuantumThetaProtocol(
                    thetaAngles
                );


            // =================================================
            // SIX VALIDATOR MEASUREMENTS
            // =================================================

            const validatorVotes = [];


            for (
                let i = 0;
                i < this.validators.length;
                i++
            ) {

                const validator =
                    this.validators[i];


                this.log(
                    'VALIDATOR',
                    `${validator.name} received qubit ${i} ` +
                    `with theta=${thetaAngles[i]}`
                );


                const voteResult =
                    validator.validateCandidateTransaction(

                        currentTx,

                        transactionHash,

                        i,

                        thetaAngles[i],

                        measurementResults[i],

                        i === verifierIndex
                    );


                validatorVotes.push(
                    voteResult
                );


                this.log(
                    'VALIDATOR',
                    `${validator.name} measured ` +
                    `Y${i + 1} = ${measurementResults[i]}`
                );


                if (stepCallback) {

                    await stepCallback({

                        phase:
                            'VALIDATOR_MEASUREMENT',

                        validatorIndex:
                            i,

                        validator,

                        voteResult,

                        tx:
                            currentTx,

                        transactionHash,

                        theta:
                            thetaAngles[i],

                        measurementResult:
                            measurementResults[i],

                        progress:
                            `${i + 1}/6`
                    });
                }


                await new Promise(
                    r => setTimeout(r, 260)
                );
            }


            // =================================================
            // PHASE 3:
            // QUANTUM CONSENSUS
            // =================================================

            /*
             * Paper condition:
             *
             * Y1 XOR Y2 XOR Y3 XOR Y4 XOR Y5 XOR Y6
             *
             * =
             *
             * ((theta1 + ... + theta6) / pi) mod 2
             */

            const measuredParity =
                measurementResults.reduce(
                    (result, bit) =>
                        result ^ bit,
                    0
                );


            /*
             * Our theta generator guarantees:
             *
             * theta1 + ... + theta6 = pi
             *
             * Therefore:
             *
             * (pi / pi) mod 2 = 1
             */

            const expectedParity = 1;


            const consensusReached =
                measuredParity ===
                expectedParity;


            this.log(
                'CONSENSUS',
                `Quantum theta-protocol: ` +
                `measured parity=${measuredParity}, ` +
                `expected parity=${expectedParity}, ` +
                `verifier=${verifier.name}`
            );


            if (!consensusReached) {

                throw new Error(

                    `Quantum consensus failed: ` +

                    `measured parity ` +
                    `${measuredParity} != ` +

                    `expected parity ` +
                    `${expectedParity}.`
                );
            }


            // =================================================
            // QUANTUM CONSENSUS PASSED
            // =================================================

            currentTx.validate(
                transactionHash
            );


            /*
             * Preserve the quantum verification information
             * on the transaction.
             */

            currentTx.validationDetails = {

                ...(currentTx.validationDetails || {}),

                quantumVerification: {

                    protocol:
                        'theta-protocol',

                    verifierId:
                        verifier.id,

                    verifierName:
                        verifier.name,

                    thetaAngles,

                    measurementResults,

                    measuredParity,

                    expectedParity,

                    circuit:
                        quantumCircuit
                }
            };


            this.log(
                'CONSENSUS',
                `Quantum theta-protocol consensus achieved. ` +
                `Proceeding to block assembly.`
            );


            if (stepCallback) {

                await stepCallback({

                    phase:
                        'CONSENSUS_REACHED',

                    verifier,

                    thetaAngles,

                    measurementResults,

                    measuredParity,

                    expectedParity,

                    transactionHash
                });
            }


            await new Promise(
                r => setTimeout(r, 300)
            );


            // =================================================
            // PHASE 4:
            // EXISTING BLOCK CREATION
            // =================================================

            const previousBlock =
                this.sharedLedger[
                this.sharedLedger.length - 1
                ];


            const newBlockIndex =
                this.sharedLedger.length;


            const blockTimestamp =
                Date.now();


            const proposer =
                this.validators[
                newBlockIndex %
                this.validators.length
                ];


            currentTx.status =
                'COMMITTED';


            const newBlock =
                new Block(

                    newBlockIndex,

                    blockTimestamp,

                    [currentTx],

                    previousBlock.hash,

                    transactionHash
                );


            newBlock.proposer =
                proposer.name;


            newBlock.validatorSignatures =
                validatorVotes;


            newBlock.hash =
                await newBlock.calculateHash();


            this.log(
                'BLOCK',
                `Block #${newBlock.index} successfully created ` +
                `by proposer ${proposer.name}. ` +
                `Hash: ${newBlock.hash.slice(0, 18)}... ` +
                `(PrevHash: ${newBlock.previousHash.slice(0, 18)}...)`
            );


            if (stepCallback) {

                await stepCallback({

                    phase:
                        'BLOCK_MINTED',

                    block:
                        newBlock,

                    transactionHash
                });
            }


            await new Promise(
                r => setTimeout(r, 350)
            );


            // =================================================
            // PHASE 5:
            // EXISTING LEDGER COMMIT
            // =================================================

            this.sharedLedger.push(
                newBlock
            );


            for (
                let v of this.validators
            ) {

                v.commitBlock(
                    newBlock
                );
            }


            // =================================================
            // PHASE 6:
            // EXISTING STATE SETTLEMENT
            // =================================================

            this.user.balance -=
                (
                    currentTx.amount +
                    currentTx.fee
                );


            this.mempool.shift();


            this.log(
                'LEDGER',
                `Shared Ledger updated! ` +
                `Height: ${this.sharedLedger.length}. ` +
                `All 6 validators synchronized.`
            );


            this.log(
                'USER',
                `User balance updated: ` +
                `${this.user.balance.toFixed(2)} QTC ` +
                `(-${currentTx.amount + currentTx.fee} QTC).`
            );


            if (stepCallback) {

                await stepCallback({

                    phase:
                        'LEDGER_COMMITTED',

                    block:
                        newBlock,

                    tx:
                        currentTx,

                    transactionHash
                });
            }


            this.notifyState();


            return {

                block:
                    newBlock,

                tx:
                    currentTx,

                transactionHash
            };

        } finally {

            this.isProcessing =
                false;
        }
    }


    // ========================================================
    // VERIFY LEDGER INTEGRITY
    // ========================================================

    async verifyLedgerIntegrity() {

        for (
            let i = 1;
            i < this.sharedLedger.length;
            i++
        ) {

            const currentBlock =
                this.sharedLedger[i];

            const prevBlock =
                this.sharedLedger[i - 1];


            if (
                currentBlock.previousHash !==
                prevBlock.hash
            ) {

                return {

                    valid: false,

                    brokenAtIndex: i,

                    reason:
                        'Previous hash mismatch'
                };
            }


            const calculatedHash =
                await currentBlock.calculateHash();


            if (
                currentBlock.hash !==
                calculatedHash
            ) {

                return {

                    valid: false,

                    brokenAtIndex: i,

                    reason:
                        'Block hash tampering detected'
                };
            }


            if (
                currentBlock.transactions &&
                currentBlock.transactions.length > 0 &&
                currentBlock.transactionHash
            ) {

                const primaryTx =
                    currentBlock.transactions[0];


                const recomputedTxHash =
                    await hashTransaction(
                        primaryTx
                    );


                const currentHex =
                    typeof currentBlock.transactionHash ===
                        'object'

                        ? currentBlock.transactionHash.hex

                        : currentBlock.transactionHash;


                if (
                    recomputedTxHash.hex !==
                    currentHex
                ) {

                    return {

                        valid: false,

                        brokenAtIndex: i,

                        reason:
                            'Transaction hash integrity mismatch'
                    };
                }
            }
        }


        return {

            valid: true,

            blockCount:
                this.sharedLedger.length
        };
    }
}


// ============================================================
// EXPORT
// ============================================================

window.QChain = {

    hashTransaction,

    validateTransaction,

    calculateTransactionAngle,

    generateThetaAngles,

    buildThetaProtocolCircuit,

    runQuantumThetaProtocol,

    BlockchainNetwork,

    Transaction,

    Block,

    ValidatorNode
};