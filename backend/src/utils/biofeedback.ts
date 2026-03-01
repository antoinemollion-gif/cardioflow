export function calculateCoherence(heartRateData: number[]): number {
    if (heartRateData.length < 2) return 0;
    const mean = heartRateData.reduce((a, b) => a + b) / heartRateData.length;
    const variance = heartRateData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / heartRateData.length;
    const standardDeviation = Math.sqrt(variance);
    const coherenceScore = Math.min(100, Math.max(0, 100 - standardDeviation));
    return coherenceScore;
}

export function calculateAverageHeartRate(heartRateData: number[]): number {
    if (heartRateData.length === 0) return 0;
    return heartRateData.reduce((a, b) => a + b) / heartRateData.length;
}

export function calculateRespiratoryRate(heartRateData: number[]): number {
    if (heartRateData.length < 60) return 0;
    let peaks = 0;
    for (let i = 1; i < heartRateData.length - 1; i++) {
        if (heartRateData[i] > heartRateData[i - 1] && heartRateData[i] > heartRateData[i + 1]) {
            peaks++;
        }
    }
    return (peaks / heartRateData.length) * 60;
}

export function calculateBiofeedbackMetrics(heartRateData: number[]) {
    return {
        coherence: calculateCoherence(heartRateData),
        averageHeartRate: calculateAverageHeartRate(heartRateData),
        respiratoryRate: calculateRespiratoryRate(heartRateData)
    };
}