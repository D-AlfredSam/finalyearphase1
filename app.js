// /**
//  * Application Controller & UI Binding
//  * Coordinates Blockchain Network, Network Visualizer, and DOM interactions.
//  */

// // Simple Web Audio Synthesizer for high-tech micro-audio feedback
// class QuantumSoundFx {
//     constructor() {
//         this.ctx = null;
//     }

//     init() {
//         if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
//             const AudioCtx = window.AudioContext || window.webkitAudioContext;
//             this.ctx = new AudioCtx();
//         }
//     }

//     play(freq, type = 'sine', duration = 0.12, gainVal = 0.05) {
//         try {
//             this.init();
//             if (!this.ctx) return;
//             if (this.ctx.state === 'suspended') this.ctx.resume();

//             const osc = this.ctx.createOscillator();
//             const gain = this.ctx.createGain();
//             osc.type = type;
//             osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

//             gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
//             gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

//             osc.connect(gain);
//             gain.connect(this.ctx.destination);

//             osc.start();
//             osc.stop(this.ctx.currentTime + duration);
//         } catch (e) {
//             // Audio policy graceful fallback
//         }
//     }

//     txBroadcast() { this.play(587.33, 'triangle', 0.18, 0.06); }
//     valApprove() { this.play(880.00, 'sine', 0.1, 0.04); }
//     blockMined() { 
//         this.play(659.25, 'sine', 0.12, 0.06);
//         setTimeout(() => this.play(1046.50, 'sine', 0.25, 0.07), 80);
//     }
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     const sfx = new QuantumSoundFx();

//     // 1. Initialize Network
//     const network = new window.QChain.BlockchainNetwork();

//     // UI Elements
//     const userBalanceEl = document.getElementById('userBalance');
//     const userAddressEl = document.getElementById('userAddress');
//     const recipientSelect = document.getElementById('recipientSelect');
//     const txAmountInput = document.getElementById('txAmount');
//     const txMemoInput = document.getElementById('txMemo');
//     const sendTxBtn = document.getElementById('sendTxBtn');
//     const mempoolListEl = document.getElementById('mempoolList');
//     const mempoolCountBadge = document.getElementById('mempoolCountBadge');
//     const blockCountBadge = document.getElementById('blockCountBadge');
//     const ledgerBlocksEl = document.getElementById('ledgerBlocks');
//     const consoleTerminalEl = document.getElementById('consoleTerminal');
//     const validatorsGridEl = document.getElementById('validatorsGrid');
//     const ledgerTabsContainer = document.getElementById('ledgerTabsContainer');
//     const syncStatusEl = document.getElementById('syncStatus');
//     const inspectCodeBtn = document.getElementById('inspectCodeBtn');
//     const codeModal = document.getElementById('codeModal');
//     const blockModal = document.getElementById('blockModal');
//     const autoTrafficBtn = document.getElementById('autoTrafficBtn');
//     const verifyLedgerBtn = document.getElementById('verifyLedgerBtn');

//     let selectedValidatorView = 'GLOBAL'; // GLOBAL or 0..5
//     let autoTrafficInterval = null;

//     // 2. Setup Network Visualizer
//     const visualizer = new window.NetworkVisualizer('networkCanvas', network);

//     // 3. Render Initial Validators Cards
//     function renderValidatorsCards() {
//         validatorsGridEl.innerHTML = '';
//         network.validators.forEach((v, idx) => {
//             const card = document.createElement('div');
//             card.className = 'validator-node-card';
//             card.id = `validator-card-${idx}`;

//             const badgeClass = v.status === 'CONSENSUS_REACHED' ? 'val-badge approved' : 'val-badge online';
//             const badgeText = v.status === 'CONSENSUS_REACHED' ? 'Approved ✓' : 'Online';

//             card.innerHTML = `
//                 <div class="val-header">
//                     <span class="val-title">${v.name}</span>
//                     <span class="${badgeClass}" id="val-badge-${idx}">${badgeText}</span>
//                 </div>
//                 <div class="val-meta">
//                     <div>Address: ${v.address.slice(0, 10)}...${v.address.slice(-4)}</div>
//                     <div>Stake: ${v.stake.toLocaleString()} QTC</div>
//                     <div>Local Ledger: <strong id="val-blocks-${idx}">${v.getLedgerHeight()} blocks</strong></div>
//                 </div>
//                 <div class="val-fn-call" id="val-fn-${idx}">
//                     validateTransaction() &rarr; <span style="color:#10b981;font-weight:bold;">returns approved</span>
//                 </div>
//             `;
//             validatorsGridEl.appendChild(card);
//         });
//     }

//     // 4. Render Validator Tabs for Shared Ledger
//     function renderLedgerTabs() {
//         ledgerTabsContainer.innerHTML = '';

//         const globalTab = document.createElement('button');
//         globalTab.className = `ledger-tab ${selectedValidatorView === 'GLOBAL' ? 'active' : ''}`;
//         globalTab.textContent = 'Global Shared Ledger';
//         globalTab.addEventListener('click', () => {
//             selectedValidatorView = 'GLOBAL';
//             renderLedgerTabs();
//             renderLedgerBlocks();
//         });
//         ledgerTabsContainer.appendChild(globalTab);

//         network.validators.forEach((v, idx) => {
//             const tab = document.createElement('button');
//             tab.className = `ledger-tab ${selectedValidatorView === idx ? 'active' : ''}`;
//             tab.textContent = `Node V${idx + 1} Copy`;
//             tab.addEventListener('click', () => {
//                 selectedValidatorView = idx;
//                 renderLedgerTabs();
//                 renderLedgerBlocks();
//             });
//             ledgerTabsContainer.appendChild(tab);
//         });
//     }

//     // 5. Render Shared Ledger Blocks
//     function renderLedgerBlocks() {
//         ledgerBlocksEl.innerHTML = '';

//         let blocksToDisplay = [];
//         let viewLabel = '';

//         if (selectedValidatorView === 'GLOBAL') {
//             blocksToDisplay = network.sharedLedger;
//             viewLabel = 'Consensus Network Shared Ledger';
//         } else {
//             const val = network.validators[selectedValidatorView];
//             blocksToDisplay = val.localLedger;
//             viewLabel = `${val.name}'s Local Synchronized Copy`;
//         }

//         // Show newest block on top
//         const reversedBlocks = [...blocksToDisplay].reverse();

//         reversedBlocks.forEach((block, displayIndex) => {
//             const card = document.createElement('div');
//             card.className = 'block-card';

//             const txCount = block.transactions.length;
//             const primaryTx = block.transactions[0] || {};
//             const isGenesis = block.index === 0;

//             card.innerHTML = `
//                 <div class="block-header">
//                     <div class="block-badge">
//                         <span style="color:${isGenesis ? '#a855f7' : '#00f0ff'};">
//                             ${isGenesis ? '⚡ Genesis Block #0' : `📦 Block #${block.index}`}
//                         </span>
//                         ${block.proposer ? `<span style="font-size:10px;color:#94a3b8;font-weight:normal;">by ${block.proposer}</span>` : ''}
//                     </div>
//                     <span style="font-size:10px;color:#64748b;font-family:var(--font-mono);">
//                         ${new Date(block.timestamp).toLocaleTimeString()}
//                     </span>
//                 </div>

//                 <div class="block-hash-row">
//                     <span>Block Hash:</span>
//                     <span class="hash-val">${block.hash ? block.hash.slice(0, 16) + '...' + block.hash.slice(-8) : 'Generating...'}</span>
//                 </div>
//                 <div class="block-hash-row">
//                     <span>Prev Hash:</span>
//                     <span class="hash-val" style="color:#94a3b8;">${block.previousHash.slice(0, 16)}...</span>
//                 </div>
//                 ${block.transactionHash ? `
//                 <div class="block-hash-row">
//                     <span>Tx Hash:</span>
//                     <span class="hash-val" style="color:#10b981;">${(typeof block.transactionHash === 'object' ? block.transactionHash.hex : block.transactionHash).slice(0, 16)}...</span>
//                 </div>` : ''}

//                 <div class="block-txs-box">
//                     <div style="font-size:11px;font-weight:600;color:#cbd5e1;display:flex;justify-content:space-between;">
//                         <span>Transactions: ${txCount}</span>
//                         <span style="color:#10b981;">Validation: Approved ✓</span>
//                     </div>
//                     <div style="font-family:var(--font-mono);font-size:10px;color:#38bdf8;margin-top:4px;">
//                         ${primaryTx.sender ? `${primaryTx.sender.slice(0, 8)}... &rarr; ${primaryTx.recipient.slice(0, 8)}... (${primaryTx.amount} QTC)` : 'No transactions'}
//                     </div>
//                 </div>

//                 <div class="block-signatures">
//                     <span style="font-size:10px;color:#94a3b8;margin-right:4px;">Validators:</span>
//                     ${(block.validatorSignatures || []).map((sig, i) => `
//                         <span class="sig-pill" title="${sig.validatorName}: Approved">V${i + 1} ✓</span>
//                     `).join('')}
//                 </div>
//             `;

//             card.addEventListener('click', () => {
//                 showBlockDetailsModal(block);
//             });

//             ledgerBlocksEl.appendChild(card);

//             // Chained connector line between blocks
//             if (displayIndex < reversedBlocks.length - 1) {
//                 const connector = document.createElement('div');
//                 connector.className = 'block-connector';
//                 ledgerBlocksEl.appendChild(connector);
//             }
//         });

//         // Update badge
//         blockCountBadge.textContent = `${network.sharedLedger.length} Blocks`;
//         syncStatusEl.textContent = `All 6 Validators in Sync (Height: ${network.sharedLedger.length})`;
//     }

//     // 6. Render Mempool
//     function renderMempool() {
//         mempoolListEl.innerHTML = '';
//         mempoolCountBadge.textContent = `${network.mempool.length} Pending`;

//         if (network.mempool.length === 0) {
//             mempoolListEl.innerHTML = `
//                 <div class="mempool-empty">
//                     Mempool empty. Submit a transaction above to start validation!
//                 </div>
//             `;
//             return;
//         }

//         network.mempool.forEach((tx) => {
//             const item = document.createElement('div');
//             item.className = 'mempool-item';
//             item.innerHTML = `
//                 <div>
//                     <div style="font-weight:600;color:#ffffff;">Send ${tx.amount} QTC</div>
//                     <div style="font-family:var(--font-mono);font-size:10px;color:#94a3b8;">
//                         To: ${tx.recipient.slice(0, 12)}...
//                     </div>
//                 </div>
//                 <div style="text-align:right;">
//                     <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:rgba(245,158,11,0.15);color:#fbbf24;">
//                         Pending Validation
//                     </span>
//                     <div style="font-size:9px;color:#64748b;margin-top:2px;">Fee: ${tx.fee} QTC</div>
//                 </div>
//             `;
//             mempoolListEl.appendChild(item);
//         });
//     }

//     // 7. Update UI State & Balance
//     function updateUIState() {
//         userBalanceEl.textContent = network.user.balance.toFixed(2);
//         userAddressEl.textContent = `${network.user.address.slice(0, 16)}...${network.user.address.slice(-6)}`;
//         renderMempool();
//         renderLedgerBlocks();

//         // Update validator heights in cards
//         network.validators.forEach((v, idx) => {
//             const countEl = document.getElementById(`val-blocks-${idx}`);
//             if (countEl) countEl.textContent = `${v.getLedgerHeight()} blocks`;
//         });
//     }

//     // Populate contacts dropdown
//     recipientSelect.innerHTML = network.contacts.map((c, i) => 
//         `<option value="${c.address}">${c.name} (${c.address.slice(0, 8)}...)</option>`
//     ).join('');

//     // Console Logging Handlers
//     network.onLog = (entry) => {
//         const row = document.createElement('div');
//         row.className = 'log-entry';
//         row.innerHTML = `
//             <span class="log-time">${entry.timestamp}</span>
//             <span class="log-tag log-tag-${entry.type}">[${entry.type}]</span>
//             <span class="log-msg">${entry.message}</span>
//         `;
//         consoleTerminalEl.insertBefore(row, consoleTerminalEl.firstChild);
//     };

//     network.onStateChange = () => {
//         updateUIState();
//     };

//     // Initialize Genesis Block
//     await network.initializeGenesis();
//     renderValidatorsCards();
//     renderLedgerTabs();
//     updateUIState();

//     // 8. Preset Amount Buttons
//     document.querySelectorAll('.preset-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             txAmountInput.value = btn.dataset.amount;
//         });
//     });

//     // 9. Process Step-by-Step Consensus Animation
//     async function executeConsensusStepPipeline() {
//         sendTxBtn.disabled = true;

//         // Reset step indicators
//         const stepCards = [
//             document.getElementById('step-1'),
//             document.getElementById('step-2'),
//             document.getElementById('step-3'),
//             document.getElementById('step-4')
//         ];
//         stepCards.forEach(s => {
//             s.classList.remove('active', 'completed');
//         });

//         // Run network mempool pipeline
//         await network.processMempoolPipeline(async (step) => {
//             if (step.phase === 'VALIDATION_START') {
//                 stepCards[0].classList.add('active');
//                 visualizer.animateTxBroadcast();
//                 sfx.txBroadcast();
//             } else if (step.phase === 'VALIDATOR_VOTE') {
//                 stepCards[0].classList.remove('active');
//                 stepCards[0].classList.add('completed');
//                 stepCards[1].classList.add('active');

//                 // Highlight validator card
//                 const valCard = document.getElementById(`validator-card-${step.validatorIndex}`);
//                 const valBadge = document.getElementById(`val-badge-${step.validatorIndex}`);
//                 const valFn = document.getElementById(`val-fn-${step.validatorIndex}`);

//                 if (valCard) {
//                     valCard.classList.add('approved');
//                     valBadge.className = 'val-badge approved';
//                     valBadge.textContent = 'Approved ✓';
//                     valFn.innerHTML = `validateTransaction() &rarr; <strong style="color:#10b981;">"approved"</strong> (200 OK)`;
//                 }

//                 visualizer.animateValidatorApproval(step.validatorIndex);
//                 sfx.valApprove();
//             } else if (step.phase === 'CONSENSUS_REACHED') {
//                 stepCards[1].classList.remove('active');
//                 stepCards[1].classList.add('completed');
//                 stepCards[2].classList.add('active');
//             } else if (step.phase === 'BLOCK_MINTED') {
//                 stepCards[2].classList.remove('active');
//                 stepCards[2].classList.add('completed');
//                 stepCards[3].classList.add('active');
//                 sfx.blockMined();
//             } else if (step.phase === 'LEDGER_COMMITTED') {
//                 stepCards[3].classList.remove('active');
//                 stepCards[3].classList.add('completed');
//                 visualizer.animateBlockCommit(0);

//                 // Flash success notification
//                 setTimeout(() => {
//                     visualizer.resetValidatorVisuals();
//                     // Reset card visuals gently after commit
//                     network.validators.forEach((_, idx) => {
//                         const card = document.getElementById(`validator-card-${idx}`);
//                         if (card) card.classList.remove('approved', 'validating');
//                     });
//                 }, 1800);
//             }
//         });

//         sendTxBtn.disabled = false;
//         updateUIState();
//     }

//     // 10. Handle Transaction Submit
//     document.getElementById('txForm').addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const recipient = recipientSelect.value;
//         const amount = parseFloat(txAmountInput.value);
//         const memo = txMemoInput.value;

//         if (isNaN(amount) || amount <= 0) {
//             alert('Please enter a valid amount greater than 0.');
//             return;
//         }

//         try {
//             await network.createTransaction(recipient, amount, 1.0, memo);
//             // Auto process immediately through consensus
//             await executeConsensusStepPipeline();
//         } catch (err) {
//             alert(err.message);
//         }
//     });

//     // 11. Modal Handlers
//     inspectCodeBtn.addEventListener('click', () => {
//         codeModal.classList.add('open');
//     });

//     document.getElementById('closeCodeModal').addEventListener('click', () => {
//         codeModal.classList.remove('open');
//     });

//     codeModal.addEventListener('click', (e) => {
//         if (e.target === codeModal) codeModal.classList.remove('open');
//     });

//     function showBlockDetailsModal(block) {
//         document.getElementById('blockDetailIndex').textContent = `#${block.index}`;
//         document.getElementById('blockDetailHash').textContent = block.hash;
//         document.getElementById('blockDetailPrevHash').textContent = block.previousHash;

//         const txHashHex = block.transactionHash ? (typeof block.transactionHash === 'object' ? block.transactionHash.hex : block.transactionHash) : 'N/A';
//         const txHashBinary = block.transactionHash && typeof block.transactionHash === 'object' ? block.transactionHash.binary : 'N/A';
//         const txHashDecimal = block.transactionHash && typeof block.transactionHash === 'object' ? block.transactionHash.decimal : 'N/A';
//         const txHashAngle = block.transactionHash && typeof block.transactionHash === 'object' ? block.transactionHash.angle : 'N/A';

//         const hexEl = document.getElementById('blockDetailTxHashHex');
//         if (hexEl) hexEl.textContent = txHashHex;
//         const binEl = document.getElementById('blockDetailTxHashBinary');
//         if (binEl) binEl.textContent = txHashBinary;
//         const decEl = document.getElementById('blockDetailTxHashDecimal');
//         if (decEl) decEl.textContent = txHashDecimal;
//         const angleEl = document.getElementById('blockDetailTxHashAngle');
//         if (angleEl) angleEl.textContent = txHashAngle;

//         document.getElementById('blockDetailTimestamp').textContent = new Date(block.timestamp).toLocaleString();
//         document.getElementById('blockDetailProposer').textContent = block.proposer || 'Genesis';
//         document.getElementById('blockDetailNonce').textContent = block.nonce;

//         const txsList = document.getElementById('blockDetailTxs');
//         txsList.innerHTML = block.transactions.map(t => `
//             <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:6px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.06);">
//                 <div style="font-weight:600;color:#00f0ff;">Tx ID: ${t.txId}</div>
//                 <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">
//                     From: <span style="font-family:var(--font-mono);">${t.sender}</span><br>
//                     To: <span style="font-family:var(--font-mono);">${t.recipient}</span><br>
//                     Amount: <strong>${t.amount} QTC</strong> (Fee: ${t.fee} QTC)
//                 </div>
//                 <div style="font-size:10px;color:#10b981;margin-top:4px;">
//                     Validation Status: <strong>${t.validationDetails ? t.validationDetails.status.toUpperCase() : 'APPROVED'}</strong>
//                 </div>
//             </div>
//         `).join('');

//         const sigsList = document.getElementById('blockDetailSigs');
//         sigsList.innerHTML = (block.validatorSignatures || []).map(s => `
//             <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:11px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
//                 <span style="color:#ffffff;">${s.validatorName}:</span>
//                 <span style="color:#34d399;">VOTE: ${s.vote.toUpperCase()} (${s.signature})</span>
//             </div>
//         `).join('');

//         blockModal.classList.add('open');
//     }

//     document.getElementById('closeBlockModal').addEventListener('click', () => {
//         blockModal.classList.remove('open');
//     });

//     blockModal.addEventListener('click', (e) => {
//         if (e.target === blockModal) blockModal.classList.remove('open');
//     });

//     // 12. Verify Ledger Integrity Action
//     verifyLedgerBtn.addEventListener('click', async () => {
//         verifyLedgerBtn.disabled = true;
//         verifyLedgerBtn.innerHTML = 'Verifying SHA-256 Chain...';

//         const result = await network.verifyLedgerIntegrity();
//         if (result.valid) {
//             network.log('SYSTEM', `✓ Audit Complete: All ${result.blockCount} blocks in the Shared Ledger are mathematically linked and verified across all 6 validators!`);
//             alert(`✓ SHA-256 Ledger Integrity Verified!\n\nTotal Blocks: ${result.blockCount}\nPrevious Hash Pointers: 100% Valid\nValidator Signatures: 6/6 Replicated\nTampering Detected: NONE`);
//         } else {
//             network.log('SYSTEM', `Ledger verification failed at block ${result.brokenAtIndex}: ${result.reason}`);
//         }

//         verifyLedgerBtn.disabled = false;
//         verifyLedgerBtn.innerHTML = `
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
//             Audit Shared Ledger
//         `;
//     });

//     // 13. Auto-Traffic Simulator Toggle
//     autoTrafficBtn.addEventListener('click', () => {
//         if (autoTrafficInterval) {
//             clearInterval(autoTrafficInterval);
//             autoTrafficInterval = null;
//             autoTrafficBtn.classList.remove('btn-emerald');
//             autoTrafficBtn.classList.add('btn-secondary');
//             autoTrafficBtn.innerHTML = '⚡ Auto-Traffic: OFF';
//             network.log('SYSTEM', 'Automatic transaction generator stopped.');
//         } else {
//             autoTrafficBtn.classList.remove('btn-secondary');
//             autoTrafficBtn.classList.add('btn-emerald');
//             autoTrafficBtn.innerHTML = '⚡ Auto-Traffic: ACTIVE';
//             network.log('SYSTEM', 'Automatic transaction generator started (every 6 seconds).');

//             const sendRandomTx = async () => {
//                 if (network.user.balance < 20) {
//                     clearInterval(autoTrafficInterval);
//                     autoTrafficInterval = null;
//                     autoTrafficBtn.textContent = 'Auto-Traffic (Low Balance)';
//                     return;
//                 }
//                 const randomContact = network.contacts[Math.floor(Math.random() * network.contacts.length)];
//                 const randomAmount = Math.floor(Math.random() * 25) + 5;
//                 await network.createTransaction(randomContact.address, randomAmount, 1, 'Auto Quantum Stream');
//                 await executeConsensusStepPipeline();
//             };

//             sendRandomTx();
//             autoTrafficInterval = setInterval(sendRandomTx, 6500);
//         }
//     });
// });




/**
 * Application Controller & UI Binding
 * Coordinates Blockchain Network, Network Visualizer, and DOM interactions.
 *
 * Quantum Consensus UI Flow:
 *
 * 1. User submits transaction
 * 2. Transaction enters mempool
 * 3. One shared 6-qubit GHZ protocol is prepared
 * 4. Each validator performs a local theta measurement
 * 5. Measurements Y1...Y6 are collected
 * 6. Randomly selected verifier checks XOR parity
 * 7. If quantum consensus passes, block is minted
 * 8. Block is synchronized across all validator ledgers
 */

// ============================================================
// SIMPLE WEB AUDIO SYNTHESIZER
// ============================================================

class QuantumSoundFx {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
    }

    play(freq, type = 'sine', duration = 0.12, gainVal = 0.05) {
        try {
            this.init();

            if (!this.ctx) return;

            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(
                freq,
                this.ctx.currentTime
            );

            gain.gain.setValueAtTime(
                gainVal,
                this.ctx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                this.ctx.currentTime + duration
            );

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);

        } catch (e) {
            // Audio policy graceful fallback
        }
    }

    txBroadcast() {
        this.play(587.33, 'triangle', 0.18, 0.06);
    }

    valApprove() {
        this.play(880.00, 'sine', 0.1, 0.04);
    }

    blockMined() {
        this.play(659.25, 'sine', 0.12, 0.06);

        setTimeout(() => {
            this.play(
                1046.50,
                'sine',
                0.25,
                0.07
            );
        }, 80);
    }
}


// ============================================================
// APPLICATION INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

    const sfx = new QuantumSoundFx();

    // ========================================================
    // 1. INITIALIZE BLOCKCHAIN NETWORK
    // ========================================================

    const network = new window.QChain.BlockchainNetwork();


    // ========================================================
    // UI ELEMENT REFERENCES
    // ========================================================

    const userBalanceEl =
        document.getElementById('userBalance');

    const userAddressEl =
        document.getElementById('userAddress');

    const recipientSelect =
        document.getElementById('recipientSelect');

    const txAmountInput =
        document.getElementById('txAmount');

    const txMemoInput =
        document.getElementById('txMemo');

    const sendTxBtn =
        document.getElementById('sendTxBtn');

    const mempoolListEl =
        document.getElementById('mempoolList');

    const mempoolCountBadge =
        document.getElementById('mempoolCountBadge');

    const blockCountBadge =
        document.getElementById('blockCountBadge');

    const ledgerBlocksEl =
        document.getElementById('ledgerBlocks');

    const consoleTerminalEl =
        document.getElementById('consoleTerminal');

    const validatorsGridEl =
        document.getElementById('validatorsGrid');

    const ledgerTabsContainer =
        document.getElementById('ledgerTabsContainer');

    const syncStatusEl =
        document.getElementById('syncStatus');

    const inspectCodeBtn =
        document.getElementById('inspectCodeBtn');

    const codeModal =
        document.getElementById('codeModal');

    const blockModal =
        document.getElementById('blockModal');

    const autoTrafficBtn =
        document.getElementById('autoTrafficBtn');

    const verifyLedgerBtn =
        document.getElementById('verifyLedgerBtn');


    // ========================================================
    // APPLICATION STATE
    // ========================================================

    let selectedValidatorView = 'GLOBAL';

    let autoTrafficInterval = null;


    // ========================================================
    // 2. SETUP NETWORK VISUALIZER
    // ========================================================

    const visualizer =
        new window.NetworkVisualizer(
            'networkCanvas',
            network
        );


    // ========================================================
    // 3. RENDER QUANTUM VALIDATOR CARDS
    // ========================================================

    function renderValidatorsCards() {

        validatorsGridEl.innerHTML = '';

        network.validators.forEach((v, idx) => {

            const card =
                document.createElement('div');

            card.className =
                'validator-node-card';

            card.id =
                `validator-card-${idx}`;


            const badgeClass =
                v.status === 'CONSENSUS_REACHED'
                    ? 'val-badge approved'
                    : 'val-badge online';

            const badgeText =
                v.status === 'CONSENSUS_REACHED'
                    ? 'Consensus ✓'
                    : 'Online';


            card.innerHTML = `
                <div class="val-header">

                    <span class="val-title">
                        ${v.name}
                    </span>

                    <span
                        class="${badgeClass}"
                        id="val-badge-${idx}"
                    >
                        ${badgeText}
                    </span>

                </div>

                <div class="val-meta">

                    <div>
                        Address:
                        ${v.address.slice(0, 10)}...
                        ${v.address.slice(-4)}
                    </div>

                    <div>
                        Stake:
                        ${v.stake.toLocaleString()} QTC
                    </div>

                    <div>
                        Local Ledger:
                        <strong id="val-blocks-${idx}">
                            ${v.getLedgerHeight()} blocks
                        </strong>
                    </div>

                </div>

                <div
                    class="val-fn-call"
                    id="val-fn-${idx}"
                >
                    Qubit q${idx}
                    &rarr;
                    <span
                        style="
                            color:#00f0ff;
                            font-weight:bold;
                        "
                    >
                        θ-measurement
                    </span>
                </div>
            `;

            validatorsGridEl.appendChild(card);
        });
    }


    // ========================================================
    // 4. RENDER VALIDATOR TABS
    // ========================================================

    function renderLedgerTabs() {

        ledgerTabsContainer.innerHTML = '';


        // Global ledger tab
        const globalTab =
            document.createElement('button');

        globalTab.className =
            `ledger-tab ${selectedValidatorView === 'GLOBAL'
                ? 'active'
                : ''
            }`;

        globalTab.textContent =
            'Global Shared Ledger';


        globalTab.addEventListener(
            'click',
            () => {

                selectedValidatorView =
                    'GLOBAL';

                renderLedgerTabs();
                renderLedgerBlocks();
            }
        );


        ledgerTabsContainer.appendChild(
            globalTab
        );


        // Validator-specific ledger tabs
        network.validators.forEach((v, idx) => {

            const tab =
                document.createElement('button');

            tab.className =
                `ledger-tab ${selectedValidatorView === idx
                    ? 'active'
                    : ''
                }`;

            tab.textContent =
                `Node V${idx + 1} Copy`;


            tab.addEventListener(
                'click',
                () => {

                    selectedValidatorView =
                        idx;

                    renderLedgerTabs();
                    renderLedgerBlocks();
                }
            );


            ledgerTabsContainer.appendChild(tab);
        });
    }


    // ========================================================
    // 5. RENDER SHARED LEDGER BLOCKS
    // ========================================================

    function renderLedgerBlocks() {

        ledgerBlocksEl.innerHTML = '';

        let blocksToDisplay = [];
        let viewLabel = '';


        if (selectedValidatorView === 'GLOBAL') {

            blocksToDisplay =
                network.sharedLedger;

            viewLabel =
                'Consensus Network Shared Ledger';

        } else {

            const val =
                network.validators[
                selectedValidatorView
                ];

            blocksToDisplay =
                val.localLedger;

            viewLabel =
                `${val.name}'s Local Synchronized Copy`;
        }


        // Newest block first
        const reversedBlocks =
            [...blocksToDisplay].reverse();


        reversedBlocks.forEach(
            (block, displayIndex) => {

                const card =
                    document.createElement('div');

                card.className =
                    'block-card';


                const txCount =
                    block.transactions.length;

                const primaryTx =
                    block.transactions[0] || {};

                const isGenesis =
                    block.index === 0;


                card.innerHTML = `

                    <div class="block-header">

                        <div class="block-badge">

                            <span
                                style="
                                    color:${isGenesis
                        ? '#a855f7'
                        : '#00f0ff'
                    };
                                "
                            >
                                ${isGenesis
                        ? '⚡ Genesis Block #0'
                        : `📦 Block #${block.index}`
                    }
                            </span>

                            ${block.proposer
                        ? `
                                        <span
                                            style="
                                                font-size:10px;
                                                color:#94a3b8;
                                                font-weight:normal;
                                            "
                                        >
                                            by ${block.proposer}
                                        </span>
                                      `
                        : ''
                    }

                        </div>

                        <span
                            style="
                                font-size:10px;
                                color:#64748b;
                                font-family:var(--font-mono);
                            "
                        >
                            ${new Date(
                        block.timestamp
                    ).toLocaleTimeString()}
                        </span>

                    </div>


                    <div class="block-hash-row">

                        <span>
                            Block Hash:
                        </span>

                        <span class="hash-val">
                            ${block.hash
                        ? block.hash.slice(0, 16)
                        + '...'
                        + block.hash.slice(-8)
                        : 'Generating...'
                    }
                        </span>

                    </div>


                    <div class="block-hash-row">

                        <span>
                            Prev Hash:
                        </span>

                        <span
                            class="hash-val"
                            style="color:#94a3b8;"
                        >
                            ${block.previousHash.slice(0, 16)}...
                        </span>

                    </div>


                    ${block.transactionHash
                        ? `
                                <div class="block-hash-row">

                                    <span>
                                        Tx Hash:
                                    </span>

                                    <span
                                        class="hash-val"
                                        style="color:#10b981;"
                                    >
                                       ${(
                            typeof block.transactionHash === 'object'
                                ? block.transactionHash.hex
                                : block.transactionHash
                        ).slice(0, 16)}...
                                    </span>

                                </div>
                              `
                        : ''
                    }


                    <div class="block-txs-box">

                        <div
                            style="
                                font-size:11px;
                                font-weight:600;
                                color:#cbd5e1;
                                display:flex;
                                justify-content:space-between;
                            "
                        >

                            <span>
                                Transactions:
                                ${txCount}
                            </span>

                            <span
                                style="color:#10b981;"
                            >
                                Quantum Consensus: Passed ✓
                            </span>

                        </div>


                        <div
                            style="
                                font-family:var(--font-mono);
                                font-size:10px;
                                color:#38bdf8;
                                margin-top:4px;
                            "
                        >
                            ${primaryTx.sender
                        ? `
                                        ${primaryTx.sender.slice(0, 8)}
                                        ...
                                        &rarr;
                                        ${primaryTx.recipient.slice(0, 8)}
                                        ...
                                        (${primaryTx.amount} QTC)
                                      `
                        : 'No transactions'
                    }
                        </div>

                    </div>


                    <div class="block-signatures">

                        <span
                            style="
                                font-size:10px;
                                color:#94a3b8;
                                margin-right:4px;
                            "
                        >
                            Quantum Measurements:
                        </span>

                        ${(block.validatorSignatures || [])
                        .map((sig, i) => `

                                    <span
                                        class="sig-pill"
                                        title="${sig.validatorName ||
                            `Validator ${i + 1}`
                            }: Quantum measurement recorded"
                                    >
                                        V${i + 1} ✓
                                    </span>

                                `)
                        .join('')
                    }

                    </div>
                `;


                card.addEventListener(
                    'click',
                    () => {
                        showBlockDetailsModal(block);
                    }
                );


                ledgerBlocksEl.appendChild(card);


                // Connector
                if (
                    displayIndex <
                    reversedBlocks.length - 1
                ) {

                    const connector =
                        document.createElement('div');

                    connector.className =
                        'block-connector';

                    ledgerBlocksEl.appendChild(
                        connector
                    );
                }
            }
        );


        // Update block count
        blockCountBadge.textContent =
            `${network.sharedLedger.length} Blocks`;


        // Update synchronization status
        syncStatusEl.textContent =
            `All 6 Validators in Sync (Height: ${network.sharedLedger.length})`;
    }


    // ========================================================
    // 6. RENDER MEMPOOL
    // ========================================================

    function renderMempool() {

        mempoolListEl.innerHTML = '';

        mempoolCountBadge.textContent =
            `${network.mempool.length} Pending`;


        if (network.mempool.length === 0) {

            mempoolListEl.innerHTML = `
                <div class="mempool-empty">
                    Mempool empty.
                    Submit a transaction above
                    to start quantum validation!
                </div>
            `;

            return;
        }


        network.mempool.forEach((tx) => {

            const item =
                document.createElement('div');

            item.className =
                'mempool-item';


            item.innerHTML = `

                <div>

                    <div
                        style="
                            font-weight:600;
                            color:#ffffff;
                        "
                    >
                        Send ${tx.amount} QTC
                    </div>

                    <div
                        style="
                            font-family:var(--font-mono);
                            font-size:10px;
                            color:#94a3b8;
                        "
                    >
                        To:
                        ${tx.recipient.slice(0, 12)}...
                    </div>

                </div>


                <div style="text-align:right;">

                    <span
                        style="
                            font-size:10px;
                            padding:2px 6px;
                            border-radius:4px;
                            background:rgba(245,158,11,0.15);
                            color:#fbbf24;
                        "
                    >
                        Pending Quantum Validation
                    </span>

                    <div
                        style="
                            font-size:9px;
                            color:#64748b;
                            margin-top:2px;
                        "
                    >
                        Fee: ${tx.fee} QTC
                    </div>

                </div>

            `;

            mempoolListEl.appendChild(item);
        });
    }


    // ========================================================
    // 7. UPDATE UI STATE & BALANCE
    // ========================================================

    function updateUIState() {

        userBalanceEl.textContent =
            network.user.balance.toFixed(2);


        userAddressEl.textContent =
            `${network.user.address.slice(0, 16)}...` +
            `${network.user.address.slice(-6)}`;


        renderMempool();
        renderLedgerBlocks();


        // Update validator ledger heights
        network.validators.forEach(
            (v, idx) => {

                const countEl =
                    document.getElementById(
                        `val-blocks-${idx}`
                    );

                if (countEl) {

                    countEl.textContent =
                        `${v.getLedgerHeight()} blocks`;
                }
            }
        );
    }


    // ========================================================
    // POPULATE RECIPIENT DROPDOWN
    // ========================================================

    recipientSelect.innerHTML =
        network.contacts.map(
            (c) =>
                `<option value="${c.address}">
                    ${c.name}
                    (${c.address.slice(0, 8)}...)
                </option>`
        ).join('');


    // ========================================================
    // CONSOLE LOGGING
    // ========================================================

    network.onLog = (entry) => {

        const row =
            document.createElement('div');

        row.className =
            'log-entry';


        row.innerHTML = `

            <span class="log-time">
                ${entry.timestamp}
            </span>

            <span
                class="log-tag log-tag-${entry.type}"
            >
                [${entry.type}]
            </span>

            <span class="log-msg">
                ${entry.message}
            </span>

        `;


        consoleTerminalEl.insertBefore(
            row,
            consoleTerminalEl.firstChild
        );
    };


    network.onStateChange = () => {
        updateUIState();
    };


    // ========================================================
    // INITIALIZE GENESIS BLOCK
    // ========================================================

    await network.initializeGenesis();

    renderValidatorsCards();
    renderLedgerTabs();
    updateUIState();


    // ========================================================
    // 8. PRESET AMOUNT BUTTONS
    // ========================================================

    document
        .querySelectorAll('.preset-btn')
        .forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    txAmountInput.value =
                        btn.dataset.amount;
                }
            );
        });


    // ========================================================
    // 9. QUANTUM CONSENSUS ANIMATION PIPELINE
    // ========================================================

    async function executeConsensusStepPipeline() {

        sendTxBtn.disabled = true;


        // Reset step indicators
        const stepCards = [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3'),
            document.getElementById('step-4')
        ];


        stepCards.forEach(
            s => {

                if (!s) return;

                s.classList.remove(
                    'active',
                    'completed'
                );
            }
        );


        // ====================================================
        // RUN BLOCKCHAIN QUANTUM CONSENSUS PIPELINE
        // ====================================================

        try {

            await network.processMempoolPipeline(
                async (step) => {

                    // ----------------------------------------
                    // PHASE 01
                    // TRANSACTION BROADCAST
                    // ----------------------------------------

                    if (
                        step.phase ===
                        'VALIDATION_START'
                    ) {

                        stepCards[0].classList.add(
                            'active'
                        );

                        visualizer.animateTxBroadcast();

                        sfx.txBroadcast();
                    }


                    // ----------------------------------------
                    // PHASE 02
                    // GHZ PROTOCOL PREPARATION
                    // ----------------------------------------

                    else if (
                        step.phase ===
                        'GHZ_PROTOCOL_START'
                    ) {

                        stepCards[0]
                            .classList.remove('active');

                        stepCards[0]
                            .classList.add('completed');


                        stepCards[1]
                            .classList.add('active');


                        // Put all six validators
                        // into measurement state
                        network.validators.forEach(
                            (v, idx) => {

                                const valCard =
                                    document.getElementById(
                                        `validator-card-${idx}`
                                    );

                                const valBadge =
                                    document.getElementById(
                                        `val-badge-${idx}`
                                    );

                                const valFn =
                                    document.getElementById(
                                        `val-fn-${idx}`
                                    );


                                if (valCard) {

                                    valCard.classList.add(
                                        'validating'
                                    );
                                }


                                if (valBadge) {

                                    valBadge.className =
                                        'val-badge online';

                                    valBadge.textContent =
                                        'Measuring';
                                }


                                if (valFn) {

                                    valFn.innerHTML =
                                        `Qubit q${idx} &rarr; ` +
                                        `<strong style="color:#00f0ff;">` +
                                        `θ-measurement` +
                                        `</strong>`;
                                }
                            }
                        );
                    }


                    // ----------------------------------------
                    // PHASE 02
                    // INDIVIDUAL QUANTUM MEASUREMENT
                    // ----------------------------------------

                    else if (
                        step.phase ===
                        'QUANTUM_MEASUREMENT'
                    ) {

                        const idx =
                            step.validatorIndex;


                        if (
                            idx === undefined ||
                            idx === null
                        ) {
                            return;
                        }


                        const valCard =
                            document.getElementById(
                                `validator-card-${idx}`
                            );

                        const valBadge =
                            document.getElementById(
                                `val-badge-${idx}`
                            );

                        const valFn =
                            document.getElementById(
                                `val-fn-${idx}`
                            );


                        if (valCard) {

                            valCard.classList.add(
                                'approved'
                            );

                            valCard.classList.remove(
                                'validating'
                            );
                        }


                        if (valBadge) {

                            valBadge.className =
                                'val-badge approved';

                            valBadge.textContent =
                                `Y${idx + 1} = ${step.measurementResult
                                }`;
                        }


                        if (valFn) {

                            valFn.innerHTML =
                                `q${idx} &rarr; ` +
                                `<strong style="color:#10b981;">` +
                                `Y${idx + 1} = ${step.measurementResult
                                }` +
                                `</strong>`;
                        }


                        visualizer.animateValidatorApproval(
                            idx
                        );

                        sfx.valApprove();
                    }


                    // ----------------------------------------
                    // PHASE 03
                    // QUANTUM XOR CONSENSUS
                    // ----------------------------------------

                    else if (
                        step.phase ===
                        'QUANTUM_CONSENSUS'
                    ) {

                        stepCards[1]
                            .classList.remove(
                                'active'
                            );

                        stepCards[1]
                            .classList.add(
                                'completed'
                            );


                        stepCards[2]
                            .classList.add(
                                'active'
                            );


                        // Update validator cards
                        network.validators.forEach(
                            (v, idx) => {

                                const valCard =
                                    document.getElementById(
                                        `validator-card-${idx}`
                                    );

                                const valBadge =
                                    document.getElementById(
                                        `val-badge-${idx}`
                                    );


                                if (valCard) {

                                    valCard.classList.remove(
                                        'validating'
                                    );
                                }


                                if (valBadge) {

                                    valBadge.className =
                                        'val-badge approved';

                                    valBadge.textContent =
                                        'Measured ✓';
                                }
                            }
                        );


                        // Display XOR parity information
                        if (
                            step.parity !== undefined &&
                            step.expectedParity !== undefined
                        ) {

                            network.log(
                                'CONSENSUS',
                                `Quantum XOR parity = ${step.parity}; ` +
                                `expected parity = ${step.expectedParity}`
                            );
                        }


                        // Display verifier information
                        if (
                            step.verifierIndex !== undefined &&
                            step.verifierIndex !== null
                        ) {

                            network.log(
                                'CONSENSUS',
                                `Verifier selected: Validator ${step.verifierIndex + 1
                                }`
                            );
                        }
                    }


                    // ----------------------------------------
                    // PHASE 03
                    // BLOCK MINTED
                    // ----------------------------------------

                    else if (
                        step.phase ===
                        'BLOCK_MINTED'
                    ) {

                        stepCards[2]
                            .classList.remove(
                                'active'
                            );

                        stepCards[2]
                            .classList.add(
                                'completed'
                            );


                        stepCards[3]
                            .classList.add(
                                'active'
                            );


                        sfx.blockMined();
                    }


                    // ----------------------------------------
                    // PHASE 04
                    // LEDGER COMMITTED
                    // ----------------------------------------

                    else if (
                        step.phase ===
                        'LEDGER_COMMITTED'
                    ) {

                        stepCards[3]
                            .classList.remove(
                                'active'
                            );

                        stepCards[3]
                            .classList.add(
                                'completed'
                            );


                        visualizer.animateBlockCommit(0);


                        // Reset visual state after commit
                        setTimeout(
                            () => {

                                visualizer
                                    .resetValidatorVisuals();


                                network.validators.forEach(
                                    (_, idx) => {

                                        const card =
                                            document.getElementById(
                                                `validator-card-${idx}`
                                            );

                                        if (card) {

                                            card.classList.remove(
                                                'approved',
                                                'validating'
                                            );
                                        }
                                    }
                                );

                            },
                            1800
                        );
                    }
                }
            );


        } catch (err) {

            console.error(
                'Quantum consensus pipeline failed:',
                err
            );

            network.log(
                'ERROR',
                `Quantum consensus failed: ${err.message}`
            );

            // Reset animation
            stepCards.forEach(
                s => {

                    if (!s) return;

                    s.classList.remove(
                        'active'
                    );
                }
            );

        } finally {

            sendTxBtn.disabled = false;

            updateUIState();
        }
    }


    // ========================================================
    // 10. HANDLE TRANSACTION SUBMISSION
    // ========================================================

    document
        .getElementById('txForm')
        .addEventListener(
            'submit',
            async (e) => {

                e.preventDefault();


                const recipient =
                    recipientSelect.value;

                const amount =
                    parseFloat(
                        txAmountInput.value
                    );

                const memo =
                    txMemoInput.value;


                if (
                    isNaN(amount) ||
                    amount <= 0
                ) {

                    alert(
                        'Please enter a valid amount greater than 0.'
                    );

                    return;
                }


                try {

                    await network.createTransaction(
                        recipient,
                        amount,
                        1.0,
                        memo
                    );


                    // Automatically process through
                    // the quantum consensus pipeline
                    await executeConsensusStepPipeline();

                } catch (err) {

                    alert(err.message);
                }
            }
        );


    // ========================================================
    // 11. CODE INSPECTOR MODAL
    // ========================================================

    inspectCodeBtn.addEventListener(
        'click',
        () => {

            codeModal.classList.add('open');
        }
    );


    document
        .getElementById('closeCodeModal')
        .addEventListener(
            'click',
            () => {

                codeModal.classList.remove(
                    'open'
                );
            }
        );


    codeModal.addEventListener(
        'click',
        (e) => {

            if (e.target === codeModal) {

                codeModal.classList.remove(
                    'open'
                );
            }
        }
    );


    // ========================================================
    // BLOCK DETAILS MODAL
    // ========================================================

    function showBlockDetailsModal(block) {

        document
            .getElementById('blockDetailIndex')
            .textContent =
            `#${block.index}`;


        document
            .getElementById('blockDetailHash')
            .textContent =
            block.hash;


        document
            .getElementById('blockDetailPrevHash')
            .textContent =
            block.previousHash;


        // ----------------------------------------------------
        // Transaction hash information
        // ----------------------------------------------------

        const txHashHex =
            block.transactionHash
                ? (
                    typeof block.transactionHash === 'object'
                        ? block.transactionHash.hex
                        : block.transactionHash
                )
                : 'N/A';


        const txHashBinary =
            block.transactionHash &&
                typeof block.transactionHash === 'object'
                ? block.transactionHash.binary
                : 'N/A';


        const txHashDecimal =
            block.transactionHash &&
                typeof block.transactionHash === 'object'
                ? block.transactionHash.decimal
                : 'N/A';


        const txHashAngle =
            block.transactionHash &&
                typeof block.transactionHash === 'object'
                ? block.transactionHash.angle
                : 'N/A';


        const hexEl =
            document.getElementById(
                'blockDetailTxHashHex'
            );

        if (hexEl) {
            hexEl.textContent =
                txHashHex;
        }


        const binEl =
            document.getElementById(
                'blockDetailTxHashBinary'
            );

        if (binEl) {
            binEl.textContent =
                txHashBinary;
        }


        const decEl =
            document.getElementById(
                'blockDetailTxHashDecimal'
            );

        if (decEl) {
            decEl.textContent =
                txHashDecimal;
        }


        const angleEl =
            document.getElementById(
                'blockDetailTxHashAngle'
            );

        if (angleEl) {
            angleEl.textContent =
                txHashAngle;
        }


        // ----------------------------------------------------
        // Block metadata
        // ----------------------------------------------------

        document
            .getElementById('blockDetailTimestamp')
            .textContent =
            new Date(
                block.timestamp
            ).toLocaleString();


        document
            .getElementById('blockDetailProposer')
            .textContent =
            block.proposer || 'Genesis';


        document
            .getElementById('blockDetailNonce')
            .textContent =
            block.nonce;


        // ----------------------------------------------------
        // Transactions
        // ----------------------------------------------------

        const txsList =
            document.getElementById(
                'blockDetailTxs'
            );


        txsList.innerHTML =
            block.transactions
                .map(
                    t => `

                        <div
                            style="
                                background:rgba(255,255,255,0.03);
                                padding:10px;
                                border-radius:6px;
                                margin-bottom:8px;
                                border:1px solid rgba(255,255,255,0.06);
                            "
                        >

                            <div
                                style="
                                    font-weight:600;
                                    color:#00f0ff;
                                "
                            >
                                Tx ID: ${t.txId}
                            </div>


                            <div
                                style="
                                    font-size:11px;
                                    color:#cbd5e1;
                                    margin-top:4px;
                                "
                            >

                                From:
                                <span
                                    style="
                                        font-family:var(--font-mono);
                                    "
                                >
                                    ${t.sender}
                                </span>

                                <br>

                                To:
                                <span
                                    style="
                                        font-family:var(--font-mono);
                                    "
                                >
                                    ${t.recipient}
                                </span>

                                <br>

                                Amount:
                                <strong>
                                    ${t.amount} QTC
                                </strong>

                                (Fee:
                                ${t.fee} QTC)

                            </div>


                            <div
                                style="
                                    font-size:10px;
                                    color:#10b981;
                                    margin-top:4px;
                                "
                            >
                                Validation Status:
                                <strong>
                                    ${t.validationDetails
                            ? t.validationDetails.status.toUpperCase()
                            : 'QUANTUM CONSENSUS PASSED'
                        }
                                </strong>
                            </div>

                        </div>

                    `
                )
                .join('');


        // ----------------------------------------------------
        // Validator quantum measurements
        // ----------------------------------------------------

        const sigsList =
            document.getElementById(
                'blockDetailSigs'
            );


        sigsList.innerHTML =
            (block.validatorSignatures || [])
                .map(
                    (s, i) => {

                        const validatorName =
                            s.validatorName ||
                            `Validator ${i + 1}`;


                        const qubitIndex =
                            s.qubitIndex !== undefined
                                ? s.qubitIndex
                                : i;


                        const measurement =
                            s.measurementResult !== undefined
                                ? s.measurementResult
                                : (
                                    s.measurement !== undefined
                                        ? s.measurement
                                        : 'N/A'
                                );


                        const theta =
                            s.theta !== undefined
                                ? Number(s.theta).toFixed(8)
                                : 'N/A';


                        return `

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    font-family:var(--font-mono);
                                    font-size:11px;
                                    padding:6px 0;
                                    border-bottom:1px solid rgba(255,255,255,0.04);
                                "
                            >

                                <span
                                    style="color:#ffffff;"
                                >
                                    ${validatorName}:
                                </span>


                                <span
                                    style="color:#34d399;"
                                >
                                    q${qubitIndex}
                                    |
                                    θ=${theta}
                                    |
                                    Y${i + 1}=${measurement}
                                </span>

                            </div>

                        `;
                    }
                )
                .join('');


        blockModal.classList.add(
            'open'
        );
    }


    document
        .getElementById('closeBlockModal')
        .addEventListener(
            'click',
            () => {

                blockModal.classList.remove(
                    'open'
                );
            }
        );


    blockModal.addEventListener(
        'click',
        (e) => {

            if (e.target === blockModal) {

                blockModal.classList.remove(
                    'open'
                );
            }
        }
    );


    // ========================================================
    // 12. VERIFY LEDGER INTEGRITY
    // ========================================================

    verifyLedgerBtn.addEventListener(
        'click',
        async () => {

            verifyLedgerBtn.disabled = true;

            verifyLedgerBtn.innerHTML =
                'Verifying SHA-256 Chain...';


            try {

                const result =
                    await network.verifyLedgerIntegrity();


                if (result.valid) {

                    network.log(
                        'SYSTEM',
                        `✓ Audit Complete: All ${result.blockCount
                        } blocks in the Shared Ledger are mathematically linked and verified across all 6 validators!`
                    );


                    alert(
                        `✓ SHA-256 Ledger Integrity Verified!\n\n` +
                        `Total Blocks: ${result.blockCount}\n` +
                        `Previous Hash Pointers: 100% Valid\n` +
                        `Quantum Validator Records: 6/6 Replicated\n` +
                        `Tampering Detected: NONE`
                    );

                } else {

                    network.log(
                        'SYSTEM',
                        `Ledger verification failed at block ${result.brokenAtIndex
                        }: ${result.reason}`
                    );
                }

            } catch (err) {

                network.log(
                    'ERROR',
                    `Ledger audit failed: ${err.message}`
                );

                alert(
                    `Ledger audit failed:\n${err.message}`
                );

            } finally {

                verifyLedgerBtn.disabled =
                    false;


                verifyLedgerBtn.innerHTML = `
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        />
                    </svg>

                    Audit Shared Ledger
                `;
            }
        }
    );


    // ========================================================
    // 13. AUTO-TRAFFIC SIMULATOR
    // ========================================================

    autoTrafficBtn.addEventListener(
        'click',
        () => {

            // ------------------------------------------------
            // Stop auto traffic
            // ------------------------------------------------

            if (autoTrafficInterval) {

                clearInterval(
                    autoTrafficInterval
                );

                autoTrafficInterval =
                    null;


                autoTrafficBtn.classList.remove(
                    'btn-emerald'
                );

                autoTrafficBtn.classList.add(
                    'btn-secondary'
                );


                autoTrafficBtn.innerHTML =
                    '⚡ Auto-Traffic: OFF';


                network.log(
                    'SYSTEM',
                    'Automatic transaction generator stopped.'
                );


                return;
            }


            // ------------------------------------------------
            // Start auto traffic
            // ------------------------------------------------

            autoTrafficBtn.classList.remove(
                'btn-secondary'
            );

            autoTrafficBtn.classList.add(
                'btn-emerald'
            );


            autoTrafficBtn.innerHTML =
                '⚡ Auto-Traffic: ACTIVE';


            network.log(
                'SYSTEM',
                'Automatic transaction generator started (every 6 seconds).'
            );


            const sendRandomTx =
                async () => {

                    if (
                        network.user.balance < 20
                    ) {

                        clearInterval(
                            autoTrafficInterval
                        );

                        autoTrafficInterval =
                            null;


                        autoTrafficBtn.textContent =
                            'Auto-Traffic (Low Balance)';

                        return;
                    }


                    const randomContact =
                        network.contacts[
                        Math.floor(
                            Math.random() *
                            network.contacts.length
                        )
                        ];


                    const randomAmount =
                        Math.floor(
                            Math.random() * 25
                        ) + 5;


                    try {

                        await network.createTransaction(
                            randomContact.address,
                            randomAmount,
                            1,
                            'Auto Quantum Stream'
                        );


                        await executeConsensusStepPipeline();

                    } catch (err) {

                        network.log(
                            'ERROR',
                            `Auto-traffic transaction failed: ${err.message}`
                        );
                    }
                };


            // Run immediately
            sendRandomTx();


            // Continue every 6.5 seconds
            autoTrafficInterval =
                setInterval(
                    sendRandomTx,
                    6500
                );
        }
    );

});
