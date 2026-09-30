/**
 * Interactive P2P Network Topology & Consensus Visualizer
 * Renders the 1 User Node and 6 Validator Nodes on an animated HTML5 Canvas.
 * Visualizes packet routing for:
 * - Transaction broadcast (User -> Validators)
 * - Validation & Approval consensus (Validators -> Ring)
 * - Shared Ledger block propagation (Proposer -> All Validators)
 */

class NetworkVisualizer {
    constructor(canvasId, network) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.network = network;

        this.nodes = [];
        this.packets = [];
        this.pulses = [];
        this.hoveredNode = null;
        this.animFrameId = null;

        this.initCanvasSize();
        this.setupTopology();
        this.setupEvents();
        this.startAnimationLoop();
    }

    initCanvasSize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 800;
        this.height = rect.height || 360;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    setupTopology() {
        this.nodes = [];
        const w = this.width;
        const h = this.height;

        // User Node (Placed on Left Side)
        const userNode = {
            id: 'user_node',
            name: 'User 1 (Alice)',
            role: 'TRANSACTION_INITIATOR',
            subtext: '0x71A...F9c1',
            x: w * 0.18,
            y: h * 0.5,
            radius: 26,
            color: '#00f0ff',
            glowColor: 'rgba(0, 240, 255, 0.4)',
            pulsePhase: 0,
            active: true,
            statusText: 'Ready'
        };
        this.nodes.push(userNode);

        // 6 Validator Nodes (Arranged in a balanced Hexagonal Ring on the Right)
        const centerX = w * 0.68;
        const centerY = h * 0.5;
        const ringRadius = Math.min(w * 0.23, h * 0.38);

        const validatorNames = [
            'Validator 1 (Alpha)',
            'Validator 2 (Beta)',
            'Validator 3 (Gamma)',
            'Validator 4 (Delta)',
            'Validator 5 (Epsilon)',
            'Validator 6 (Zeta)'
        ];

        for (let i = 0; i < 6; i++) {
            // Hexagon angles (-90 deg start)
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const vx = centerX + ringRadius * Math.cos(angle);
            const vy = centerY + ringRadius * Math.sin(angle);

            this.nodes.push({
                id: `VAL_${i + 1}`,
                validatorIndex: i,
                name: validatorNames[i],
                role: 'VALIDATOR',
                subtext: `Node V${i + 1}`,
                x: vx,
                y: vy,
                radius: 20,
                color: '#8b5cf6', // Indigo / violet for validators
                glowColor: 'rgba(139, 92, 246, 0.4)',
                active: true,
                statusText: 'Online',
                vote: null
            });
        }
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.setupTopology();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.hoveredNode = null;
            for (let node of this.nodes) {
                const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
                if (dist <= node.radius + 6) {
                    this.hoveredNode = node;
                    this.canvas.style.cursor = 'pointer';
                    break;
                }
            }
            if (!this.hoveredNode) {
                this.canvas.style.cursor = 'default';
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredNode = null;
        });
    }

    /**
     * Spawns animated packets traveling between nodes
     */
    sendPacket(fromId, toId, color = '#00f0ff', size = 4, speed = 0.02, meta = '') {
        const fromNode = this.nodes.find(n => n.id === fromId);
        const toNode = this.nodes.find(n => n.id === toId);
        if (!fromNode || !toNode) return;

        this.packets.push({
            fromX: fromNode.x,
            fromY: fromNode.y,
            toX: toNode.x,
            toY: toNode.y,
            progress: 0,
            speed: speed,
            color: color,
            size: size,
            meta: meta
        });
    }

    /**
     * Broadcasts from User to all 6 validators (Transaction submission)
     */
    animateTxBroadcast() {
        this.addPulse('user_node', '#00f0ff', 45);
        for (let i = 1; i <= 6; i++) {
            setTimeout(() => {
                this.sendPacket('user_node', `VAL_${i}`, '#00f0ff', 5, 0.025, 'Tx Payload');
            }, (i - 1) * 60);
        }
    }

    /**
     * Visualizes the 6 validator nodes voting "Approved"
     */
    animateValidatorApproval(valIndex) {
        const node = this.nodes.find(n => n.id === `VAL_${valIndex + 1}`);
        if (!node) return;

        node.color = '#10b981'; // Green for approved
        node.glowColor = 'rgba(16, 185, 129, 0.6)';
        node.statusText = 'Approved ✓';
        this.addPulse(node.id, '#10b981', 35);

        // Send confirmation to peer validators in the ring
        const nextValIndex = ((valIndex + 1) % 6) + 1;
        this.sendPacket(node.id, `VAL_${nextValIndex}`, '#10b981', 3, 0.035, 'Vote: Approved');
    }

    /**
     * Broadcasts newly minted block to update the shared ledger across all 6 nodes
     */
    animateBlockCommit(proposerIndex = 0) {
        const proposerNode = this.nodes.find(n => n.id === `VAL_${proposerIndex + 1}`) || this.nodes[1];
        this.addPulse(proposerNode.id, '#fbbf24', 50);

        for (let i = 1; i <= 6; i++) {
            if (i !== (proposerIndex + 1)) {
                this.sendPacket(proposerNode.id, `VAL_${i}`, '#fbbf24', 4, 0.03, 'Block Commit');
            }
        }
        // Also send confirmation back to user
        this.sendPacket(proposerNode.id, 'user_node', '#10b981', 5, 0.02, 'Receipt Confirmed');
    }

    addPulse(nodeId, color, maxRadius) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;
        this.pulses.push({
            x: node.x,
            y: node.y,
            radius: node.radius,
            maxRadius: maxRadius,
            alpha: 0.9,
            color: color
        });
    }

    resetValidatorVisuals() {
        for (let i = 1; i <= 6; i++) {
            const v = this.nodes.find(n => n.id === `VAL_${i}`);
            if (v) {
                v.color = '#8b5cf6';
                v.glowColor = 'rgba(139, 92, 246, 0.4)';
                v.statusText = 'Online';
            }
        }
    }

    startAnimationLoop() {
        const render = () => {
            this.draw();
            this.animFrameId = requestAnimationFrame(render);
        };
        render();
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Mesh Connections
        this.drawConnections(ctx);

        // 2. Draw Pulses
        this.drawPulses(ctx);

        // 3. Draw Packets
        this.drawPackets(ctx);

        // 4. Draw Nodes
        this.drawNodes(ctx);

        // 5. Draw Tooltips
        if (this.hoveredNode) {
            this.drawTooltip(ctx, this.hoveredNode);
        }
    }

    drawConnections(ctx) {
        const userNode = this.nodes[0];
        const valNodes = this.nodes.slice(1);

        // User -> Validators links
        for (let v of valNodes) {
            ctx.beginPath();
            ctx.moveTo(userNode.x, userNode.y);
            ctx.lineTo(v.x, v.y);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Hexagon ring between the 6 validators (Consensus Ring)
        for (let i = 0; i < valNodes.length; i++) {
            const current = valNodes[i];
            const next = valNodes[(i + 1) % valNodes.length];

            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.28)';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Cross connections within the ring for distributed peer mesh
            const opposite = valNodes[(i + 3) % valNodes.length];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(opposite.x, opposite.y);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw consensus ring center label
        const centerX = this.width * 0.68;
        const centerY = this.height * 0.5;
        ctx.save();
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SHARED LEDGER CONSENSUS', centerX, centerY - 6);
        ctx.fillText('6/6 PEER MESH', centerX, centerY + 8);
        ctx.restore();
    }

    drawPulses(ctx) {
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const p = this.pulses[i];
            p.radius += 0.8;
            p.alpha -= 0.02;

            if (p.alpha <= 0) {
                this.pulses.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawPackets(ctx) {
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const pkt = this.packets[i];
            pkt.progress += pkt.speed;

            if (pkt.progress >= 1) {
                this.packets.splice(i, 1);
                continue;
            }

            const currentX = pkt.fromX + (pkt.toX - pkt.fromX) * pkt.progress;
            const currentY = pkt.fromY + (pkt.toY - pkt.fromY) * pkt.progress;

            ctx.save();
            // Glow
            ctx.beginPath();
            ctx.arc(currentX, currentY, pkt.size + 3, 0, Math.PI * 2);
            ctx.fillStyle = pkt.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(currentX, currentY, pkt.size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.95;
            ctx.fill();
            ctx.restore();
        }
    }

    drawNodes(ctx) {
        for (let node of this.nodes) {
            ctx.save();

            // Outer Aura Glow
            const gradient = ctx.createRadialGradient(
                node.x, node.y, node.radius * 0.4,
                node.x, node.y, node.radius * 1.7
            );
            gradient.addColorStop(0, node.glowColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 1.7, 0, Math.PI * 2);
            ctx.fill();

            // Outer ring border
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = node === this.hoveredNode ? 3 : 2;
            ctx.stroke();

            // Inner circle icon / core
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();

            // Node Labels
            ctx.font = '11px "Outfit", sans-serif';
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center';
            ctx.fillText(node.name, node.x, node.y + node.radius + 15);

            // Subtext / Status
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = node.statusText.includes('Approved') ? '#34d399' : 'rgba(148, 163, 184, 0.8)';
            ctx.fillText(node.statusText, node.x, node.y + node.radius + 27);

            ctx.restore();
        }
    }

    drawTooltip(ctx, node) {
        ctx.save();
        const padding = 10;
        const lineHeight = 16;
        let lines = [
            `Name: ${node.name}`,
            `Role: ${node.role}`,
            `Status: ${node.statusText}`
        ];

        if (node.role === 'TRANSACTION_INITIATOR') {
            lines.push(`Address: ${this.network.user.address.slice(0, 16)}...`);
            lines.push(`Balance: ${this.network.user.balance.toFixed(2)} QTC`);
        } else {
            const v = this.network.validators[node.validatorIndex];
            if (v) {
                lines.push(`Stake: ${v.stake.toLocaleString()} QTC`);
                lines.push(`Blocks Validated: ${v.blocksValidated}`);
                lines.push(`Shared Ledger Height: ${v.getLedgerHeight()}`);
                lines.push(`Validation Function: Returns "approved"`);
            }
        }

        ctx.font = '11px "Inter", sans-serif';
        let maxWidth = 0;
        for (let l of lines) {
            maxWidth = Math.max(maxWidth, ctx.measureText(l).width);
        }

        const boxWidth = maxWidth + padding * 2;
        const boxHeight = lines.length * lineHeight + padding * 2;
        let boxX = node.x - boxWidth / 2;
        let boxY = node.y - node.radius - boxHeight - 12;

        if (boxX < 10) boxX = 10;
        if (boxX + boxWidth > this.width - 10) boxX = this.width - boxWidth - 10;
        if (boxY < 10) boxY = node.y + node.radius + 35;

        // Tooltip background
        ctx.fillStyle = 'rgba(10, 15, 29, 0.95)';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
        ctx.fill();
        ctx.stroke();

        // Tooltip text
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        for (let i = 0; i < lines.length; i++) {
            ctx.fillStyle = i === 0 ? '#00f0ff' : '#cbd5e1';
            ctx.fillText(lines[i], boxX + padding, boxY + padding + i * lineHeight);
        }

        ctx.restore();
    }
}

window.NetworkVisualizer = NetworkVisualizer;
