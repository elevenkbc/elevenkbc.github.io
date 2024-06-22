var g_a = 70;
var g_b = 10;
//t = g_a*z + g_b;


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


// zTable: z值從 0.00到3.19對應的機率，(查表)
async function tScoreToRank(){
	var tTable = await fetchZTable();
	console.log(zTable)
	var t_score = document.getElementById("t_score").value;//t分數
	var p_num = document.getElementById("p_num").value;//考試總人數
	
	if(!t_score || !p_num){
		alert("錯誤！您有欄位未輸入！");
		return;
	}
	if(isNaN(t_score)||t_score<0||100<t_score){
		alert("錯誤！T分數格式錯誤！");
		return;
	}
	if(isNaN(p_num)||p_num<1){
		alert("錯誤！考試總人數格式錯誤！");
		return;
	}
	p_num = Math.round(p_num); //人數只能是整數，故四捨五入到整數
	var z = (t_score - g_a) / g_b;
	z = toDecimal(z);
	
	pr = getProbolity(z);
	console.log(typeof pr);


	console.log("z=", z);
	console.log("pr=", pr);
	var num_win = p_num*pr; //贏過的人數
	num_win = Math.floor(num_win); //取高斯函數
	var t1 = "您的排名是";
	var t2 = "人中的第";
	var t3 = "名";
	document.getElementById('rank').innerHTML = t1 + p_num + t2 + (p_num-num_win) + t3;
}

function getProbolity(z){
	z = toDecimal(z);
	var prob;
	var ind;
	var dalta = 0.01
	if(z>=0){
		ind = z/(dalta);
		if(ind>=319){
			ind = 319;
		}
		prob = zTable[Math.round(ind)];
	}else{
		ind = (-z)/(dalta);
		if(ind>=319){
			ind = 319;
		}
		prob = 1.0 - zTable[Math.round(ind)];
		
	}
	return prob;
}


function toDecimal(x) { 
	//四捨五入取到小數點後兩位
    var f = parseFloat(x);  
    if (isNaN(f)) {  
        return;  
    }  
    f = Math.round(x*100)/100;  
    return f;  
}
