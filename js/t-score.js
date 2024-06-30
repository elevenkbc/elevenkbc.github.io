const mean = 70;
const stdDev = 10;
//t = mean + stdDev*z 
//t = 70 + 10z
let tTable = null;
let cdfChartInstance = null;

// zTable: z值從 0.00到3.19對應的機率，(查表)
async function fetchZTable() {
	try {
		const response = await fetch('./zTable.txt');
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		const text = await response.text();
		// Store the text content in the global variable
		zTable = text.split(",");
		return zTable;

	} catch (error) {
		console.error('There has been a problem with your fetch operation:', error);
	}
}

function toDecimal(x) {
	//四捨五入取到小數點後兩位
	var f = parseFloat(x);
	if (isNaN(f)) {
		return;
	}
	f = Math.round(x * 100) / 100;
	return f;
}

async function tScoreToRank() {
	tTable = await fetchZTable();
	var t_score = document.getElementById("t_score").value;//t分數
	var p_num = document.getElementById("p_num").value;//考試總人數

	if (!t_score || !p_num) {
		alert("錯誤！您有欄位未輸入！");
		return;
	}
	if (isNaN(t_score) || t_score < 0 || 100 < t_score) {
		alert("錯誤！T分數格式錯誤！");
		return;
	}
	if (isNaN(p_num) || p_num < 1) {
		alert("錯誤！考試總人數格式錯誤！");
		return;
	}
	p_num = Math.round(p_num); //人數只能是整數，故四捨五入到整數
	var z = (t_score - mean) / stdDev;
	z = toDecimal(z);

	pr = await getProbolity(z);

	var num_win = p_num * pr; //贏過的人數
	num_win = Math.floor(num_win); //取高斯函數

	var t1 = "您的排名是";
	var t2 = "人中的第";
	var t3 = "名";
	document.getElementById('rank').innerHTML = t1 + p_num + t2 + (p_num - num_win) + t3;
	DrawCDF(t_score, pr);
}

async function getProbolity(z) {
	tTable = await fetchZTable();
	z = toDecimal(z);
	var prob;
	var ind;
	var dalta = 0.01
	if (z >= 0) {
		ind = z / (dalta);
		if (ind >= 319) {
			ind = 319;
		}
		prob = zTable[Math.round(ind)];
	} else {
		ind = (-z) / (dalta);
		if (ind >= 319) {
			ind = 319;
		}
		prob = 1.0 - zTable[Math.round(ind)];

	}
	return prob;
}

// Normal Distribution PDF 
function normalPdf(x, mean, stdDev) {
	return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
}

// Reference to the chart instance
function DrawCDF(t_score, pr) {
	console.log('t_score:' + t_score + ', pr:' + pr)
	// Generate data points for the full range CDF
	const xValuesFull = [];
	const yValuesFull = [];
	const minXFull = mean - 4 * stdDev;
	const maxXFull = mean + 4 * stdDev;
	const step = 0.5;

	for (let x = minXFull; x <= maxXFull; x += step) {
		xValuesFull.push(x.toFixed(2));
		yValuesFull.push(normalPdf(x, mean, stdDev));
	}

	// Generate data points for the partial range CDF (from -4 to 0)
	const xValuesPartial = [];
	const yValuesPartial = [];
	const minXPartial = minXFull;
	t_score = parseFloat(t_score);

	for (let x = minXPartial; x <= t_score; x += step) {
		xValuesPartial.push(x.toFixed(2));
		yValuesPartial.push(normalPdf(x, mean, stdDev));
	}

	// Endpoint variable for the partial range
	const partialRangeEndpoint = Number.parseFloat(t_score).toFixed(2);

	// Custom plugin to draw text on the chart
	const drawTextPlugin = {
		id: 'drawTextPlugin',
		afterDatasetsDraw(chart, args, options) {
			const { ctx, chartArea: { left, right, top, bottom, width, height }, scales: { x, y } } = chart;

			// Calculate the position to draw the text
			var xPosition = x.getPixelForValue(partialRangeEndpoint); // Positioning at the endpoint of the partial range
			var yPositionProb = normalPdf(partialRangeEndpoint, mean, stdDev)
			if (yPositionProb > 0.035) {
				yPositionProb = 0.035;
			}
			if (yPositionProb < 0.005) {
				yPositionProb =  0.005;
			}
			var yPosition = y.getPixelForValue(yPositionProb); // Positioning at the CDF value at the endpoint

			ctx.save();
			ctx.font = '20px Arial';
			ctx.fillStyle = 'rgba(255, 99, 132, 1)'; // Text color matching the filled area
			ctx.textAlign = 'center';
			if (pr != -1) {
				if (0.01 <= pr) {
					const z = (t_score - mean) / stdDev;
					ctx.fillText("你的t分數:" + t_score, xPosition, yPosition); // Adjusted y position to place text above the curve
					ctx.fillText("贏過" + toDecimal(pr) * 100 + "%的人", xPosition, yPosition + 20); // Adjusted y position to place text above the curve
				}
			}

			ctx.restore();
		}
	};



	// Destroy existing chart instance if it exists
	if (cdfChartInstance) {
		cdfChartInstance.destroy();
	}

	const ctx = document.getElementById('t_score_cdf').getContext('2d');
	cdfChartInstance = new Chart(ctx, {
		type: 'line',
		data: {
			labels: xValuesFull,
			datasets: [
				{
					data: yValuesFull,
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 2,
					fill: false,
					pointRadius: 0, // Hide data points
					pointHoverRadius: 0, // Hide data points on hover
					// No need to specify legend options to hide since it's the default behavior
				},
				{
					data: yValuesPartial,
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 2,
					fill: 'origin', // Fills the area under the curve
					backgroundColor: 'rgba(255, 99, 132, 0.2)', // Light red fill color
					spanGaps: true, // Ensures the dataset spans only from -4 to 0
					pointRadius: 0, // Hide data points
					pointHoverRadius: 0, // Hide data points on hover

				}
			]
		},
		options: {
			plugins: {
				legend: {
					display: false,
					onClick: (e) => e.stopPropagation() // Disable hiding datasets by clicking on the legend
				}
			},
			scales: {
				x: {
					title: {
						display: true,
						text: 'T-分數'
					},
					ticks: {
						callback: function (value, index) {
							// Display ticks at intervals of 0.5
							if (index % 5 === 0) {
								return value / 2 + 30;
								// return (value - 40) * 0.1;
							}
							return '';
						},
						min: -4,
						max: 4
					}
				},
				y: {
					title: {
						display: true,
						text: '機率'
					},
					ticks: {
						callback: function (value) {
							return value.toFixed(3);
						},
						min: 0,
						max: 1
					}
				}
			}
		},
		plugins: [drawTextPlugin]
	});
}

var p_numButton = document.getElementById("p_num");
p_numButton.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
        tScoreToRank();
    }
});

var t_scoreButton = document.getElementById("t_score");
t_scoreButton.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
        tScoreToRank();
    }
});


DrawCDF(0, -1);
