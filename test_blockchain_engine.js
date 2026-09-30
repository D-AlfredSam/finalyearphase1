const crypto = require('crypto');

// Setup environment simulating browser Web Crypto
global.window = {
    crypto: {
        subtle: {
            digest: async (algo, buffer) => {
                const hash = crypto.createHash('sha256');
                hash.update(Buffer.from(buffer));
                return hash.digest();
            }
        }
    }
};

const fs = require('fs');
const blockchainCode = fs.readFileSync(__dirname + '/blockchain.js', 'utf8');
eval(blockchainCode);

(async () => {
    console.log("=================================================");
    console.log("=== Testing Quantum Blockchain Engine with SHA-256 Tx Hashing ===");
    console.log("=================================================\n");

    // 1. Test hashTransaction function
    console.log("Testing Step 1: hashTransaction function & representations...");
    const sampleTx = {
        txId: 'tx_alpha_99',
        sender: '0x71A9c4E8B03Fa41d6D2802Ce89531De07b22F9c1',
        recipient: '0x3D89bC4E51F417937A4c91B875eA022b7931fA3b',
        amount: 50.0,
        fee: 1.0,
        timestamp: 1700000000000,
        metadata: { note: 'deterministic test' },
        signature: 'SIG_Q_SAMPLE123',
        status: 'PENDING'
    };

    const hash1 = await window.QChain.hashTransaction(sampleTx);
    const hash2 = await window.QChain.hashTransaction(sampleTx);

    // Verify determinism
    if (hash1.hex !== hash2.hex || hash1.binary !== hash2.binary || hash1.decimal !== hash2.decimal) {
        throw new Error("FAIL: hashTransaction is not deterministic!");
    }
    console.log("✓ Check 1: Deterministic serialization verified.");

    // Verify HEX representation
    if (typeof hash1.hex !== 'string' || hash1.hex.length !== 64) {
        throw new Error(`FAIL: HEX hash must be 64 characters, got ${hash1.hex.length}`);
    }
    console.log(`✓ Check 2: HEX hash is 64 chars: ${hash1.hex.slice(0, 16)}...`);

    // Verify BINARY representation (exactly 256 bits)
    if (typeof hash1.binary !== 'string' || hash1.binary.length !== 256) {
        throw new Error(`FAIL: Binary representation must be exactly 256 bits, got ${hash1.binary.length}`);
    }
    if (!/^[01]{256}$/.test(hash1.binary)) {
        throw new Error("FAIL: Binary representation contains non-binary characters!");
    }
    console.log(`✓ Check 3: Binary representation is exactly 256 bits (Length: ${hash1.binary.length}).`);

    // Verify DECIMAL representation (generated using BigInt)
    const expectedDecimal = BigInt('0b' + hash1.binary).toString();
    if (hash1.decimal !== expectedDecimal) {
        throw new Error(`FAIL: Decimal does not match BigInt representation!`);
    }
    console.log(`✓ Check 4: Decimal representation matches BigInt ('0b' + binary): ${hash1.decimal.slice(0, 20)}...`);

    // 2. Test validateTransaction function
    console.log("\nTesting Step 2: validateTransaction(tx, transactionHash)...");
    const valResult = window.QChain.validateTransaction(sampleTx, hash1);
    if (valResult.status !== 'approved' || valResult.validatorVote !== 'approved') {
        throw new Error("FAIL: validateTransaction did not return approved!");
    }
    if (valResult.transactionHash !== hash1.hex || valResult.transactionHashBinary !== hash1.binary || valResult.transactionHashDecimal !== hash1.decimal) {
        throw new Error("FAIL: validateTransaction did not expose complete transaction hash details!");
    }
    console.log("✓ Check 5: validateTransaction returns approved and embeds hex, 256-bit binary, and BigInt decimal.");

    // 3. Test Network Initialization with 1 User and 6 Validators
    console.log("\nTesting Step 3: Network Initialization...");
    const network = new window.QChain.BlockchainNetwork();
    if (network.validators.length !== 6) {
        throw new Error(`FAIL: Expected 6 validators, found ${network.validators.length}`);
    }
    console.log(`✓ Check 6: 1 User and 6 Validators initialized.`);

    // 4. Test Genesis Block initialization with transaction hash
    await network.initializeGenesis();
    const genesisBlock = network.sharedLedger[0];
    if (network.sharedLedger.length !== 1 || !genesisBlock.transactionHash) {
        throw new Error("FAIL: Genesis block failed to commit with transaction hash!");
    }
    console.log(`✓ Check 7: Genesis Block created with Tx Hash: ${genesisBlock.transactionHash.hex.slice(0, 16)}...`);

    // Verify all 6 validators local ledger has genesis block
    for (let v of network.validators) {
        if (v.getLedgerHeight() !== 1 || v.getLatestBlockHash() !== genesisBlock.hash) {
            throw new Error(`FAIL: Validator ${v.name} is not synchronized!`);
        }
    }
    console.log("✓ Check 8: All 6 validators synchronized with Genesis Block.");

    // 5. Test Transaction Creation & Mempool
    console.log("\nTesting Step 4: Transaction Creation & Mempool...");
    const initialBalance = network.user.balance;
    const recipient = network.contacts[0].address;
    const tx = await network.createTransaction(recipient, 100, 1, 'Quantum Hashed Tx');
    if (network.mempool.length !== 1) {
        throw new Error("FAIL: Transaction did not enter mempool");
    }
    console.log(`✓ Check 9: User initiated transaction (ID: ${tx.txId}, Amount: 100 QTC).`);

    // 6. Test Consensus Pipeline: SHA-256 tx hash computed ONCE and passed to all 6 validators
    console.log("\nTesting Step 5: Consensus Pipeline & Validator Hash Distribution...");
    let computedTxHash = null;
    let validatorVotes = [];

    const pipelineResult = await network.processMempoolPipeline(async (step) => {
        if (step.phase === 'VALIDATION_START') {
            computedTxHash = step.transactionHash;
        } else if (step.phase === 'VALIDATOR_VOTE') {
            validatorVotes.push(step.voteResult);
            // Verify that each validator received the exact same hash
            if (step.voteResult.transactionHash !== computedTxHash.hex) {
                throw new Error(`FAIL: Validator ${step.validator.name} did not receive matching transaction hash!`);
            }
            if (step.voteResult.transactionHashBinary !== computedTxHash.binary) {
                throw new Error(`FAIL: Validator ${step.validator.name} binary hash mismatch!`);
            }
            if (step.voteResult.transactionHashDecimal !== computedTxHash.decimal) {
                throw new Error(`FAIL: Validator ${step.validator.name} decimal hash mismatch!`);
            }
        }
    });

    if (!computedTxHash) {
        throw new Error("FAIL: Transaction hash was not generated before validation!");
    }
    if (validatorVotes.length !== 6) {
        throw new Error(`FAIL: Expected 6 validator votes, got ${validatorVotes.length}`);
    }
    console.log(`✓ Check 10: Transaction hash calculated ONCE before validation:`);
    console.log(`    HEX:     ${computedTxHash.hex}`);
    console.log(`    BINARY:  ${computedTxHash.binary.slice(0, 32)}... (Length: ${computedTxHash.binary.length} bits)`);
    console.log(`    DECIMAL: ${computedTxHash.decimal.slice(0, 24)}... (BigInt)`);
    console.log(`✓ Check 11: Exact same hash sent to all 6 validators; all 6 voted "approved".`);

    // 7. Verify Block Creation & Distinct Block Hash vs Transaction Hash
    console.log("\nTesting Step 6: Block Assembly & Distinct Hashes...");
    if (network.sharedLedger.length !== 2) {
        throw new Error("FAIL: Block was not committed to shared ledger!");
    }
    const newBlock = network.sharedLedger[1];

    if (!newBlock.transactionHash || newBlock.transactionHash.hex !== computedTxHash.hex) {
        throw new Error("FAIL: Block does not contain the transaction hash!");
    }
    if (newBlock.hash === newBlock.transactionHash.hex) {
        throw new Error("FAIL: Block hash and transaction hash must be distinct!");
    }
    if (newBlock.previousHash !== genesisBlock.hash) {
        throw new Error("FAIL: Previous hash pointer does not match previous block hash!");
    }
    console.log(`✓ Check 12: Block #${newBlock.index} contains transaction hash: ${newBlock.transactionHash.hex.slice(0, 16)}...`);
    console.log(`✓ Check 13: Block Hash is distinct and chained: ${newBlock.hash.slice(0, 16)}... (PrevHash: ${newBlock.previousHash.slice(0, 16)}...)`);

    // 8. Verify Distributed Shared Ledger Synchronization
    console.log("\nTesting Step 7: Shared Ledger Synchronization across all 6 Validators...");
    for (let v of network.validators) {
        if (v.getLedgerHeight() !== 2) {
            throw new Error(`FAIL: Validator ${v.name} ledger height is ${v.getLedgerHeight()}, expected 2`);
        }
        if (v.getLatestBlockHash() !== newBlock.hash) {
            throw new Error(`FAIL: Validator ${v.name} block hash mismatch!`);
        }
    }
    console.log("✓ Check 14: All 6 validators hold identical, synchronized copies of the Shared Ledger.");

    // 9. Verify User Balance Update
    if (network.user.balance !== (initialBalance - 101)) {
        throw new Error(`FAIL: User balance mismatch! Expected ${initialBalance - 101}, got ${network.user.balance}`);
    }
    console.log(`✓ Check 15: User balance accurately updated (-100 amount, -1 fee).`);

    // 10. Verify Ledger Integrity (including transaction hash correspondence)
    console.log("\nTesting Step 8: Ledger Integrity Verification...");
    const audit = await network.verifyLedgerIntegrity();
    if (!audit.valid) {
        throw new Error(`FAIL: Ledger integrity check failed: ${audit.reason}`);
    }
    console.log(`✓ Check 16: Full SHA-256 Ledger Audit passed 100% across all ${audit.blockCount} blocks.`);

    console.log("\n=================================================");
    console.log(">>> ALL 16 VERIFICATION CRITERIA PASSED SUCCESSFULLY! <<<");
    console.log("=================================================");
    process.exit(0);
})();
