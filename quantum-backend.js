// ============================================================
// Q-LEDGER QUANTUM BACKEND BRIDGE
// Browser -> Python/Qiskit
// ============================================================

window.QChainQuantumBackend = {

    async runThetaProtocol({
        thetaAngles
    }) {

        const response =
            await fetch(
                'http://127.0.0.1:5000/theta-protocol',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({
                            thetaAngles
                        })
                }
            );


        if (!response.ok) {

            let message =
                `Quantum backend HTTP error: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData.error) {

                    message =
                        errorData.error;
                }

            } catch (error) {
                // Keep HTTP error message.
            }

            throw new Error(
                message
            );
        }


        const data =
            await response.json();


        if (
            !data.success ||
            !Array.isArray(data.measurements)
        ) {

            throw new Error(
                data.error ||
                'Invalid response from quantum backend.'
            );
        }


        if (
            data.measurements.length !== 6
        ) {

            throw new Error(
                'Quantum backend returned ' +
                `${data.measurements.length} ` +
                'measurements instead of 6.'
            );
        }


        const measurements =
            data.measurements.map(
                bit => Number(bit)
            );


        if (
            measurements.some(
                bit =>
                    bit !== 0 &&
                    bit !== 1
            )
        ) {

            throw new Error(
                'Quantum backend returned non-binary measurements.'
            );
        }


        return measurements;
    }
};