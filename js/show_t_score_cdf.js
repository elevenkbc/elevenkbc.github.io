function erf(x) {
    // save the sign of x
    var sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    // constants
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    // A&S formula 7.1.26
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y; // erf(-x) = -erf(x);
}

// Function to calculate the cumulative density function (CDF) of the normal distribution
function normalCdf(x, mean, stdDev) {
    return (1 + erf((x - mean) / (Math.sqrt(2) * stdDev))) / 2;
}

// Generate data points
const mean = 0;
const stdDev = 1;
const numPoints = 100;
const xValues = [];
const yValues = [];
const minX = -4;
const maxX = 4;
const step = (maxX - minX) / numPoints;

for (let x = minX; x <= maxX; x += step) {
    xValues.push(x);
    yValues.push(normalCdf(x, mean, stdDev));
}

// Create chart
const ctx = document.getElementById('t_score_cdf').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: xValues,
        datasets: [{
            label: 'CDF of Normal Distribution',
            data: yValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Z-Score'
                },
                ticks: {
                    display: false,
                    min: -4,
                    max: 4,
                    stepSize: 0.5
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Cumulative Probability'
                },
                ticks: {
                    callback: function (value) {
                        return value.toFixed(2);
                    },
                    min: 0,
                    max: 1
                }
            }
        }
    }
});