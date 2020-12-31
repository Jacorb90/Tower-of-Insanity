function ts(num) {
	num = new ExpantaNum(num)
	if (num.sign==-1) return "-"+ts(num.abs());
	if (isNaN(num.array[0][1])) return "NaN";
	if (!isFinite(num.array[0][1])) return "Infinity";
	var s="";
	if (!num.layer) s+="";
	else if (num.layer<3) s+="J".repeat(num.layer);
	else s+="J^"+gfe(num.layer)+" ";
	if (num.array.length>=3||num.array.length==2&&num.array[1][0]>=2){
		for (var i=num.array.length-1;i>=2;--i){
			var e=num.array[i];
			var q=e[0]>=5?"{"+gfe(e[0])+"}":"^".repeat(e[0]);
			if (e[1]>1) s+="(10"+q+")^"+gfe(e[1])+" ";
			else if (e[1]==1) s+="10"+q;
		}
	}
	var op0=Math.round(num.operator(0)*1000)/1000;
	var op1=Math.round(num.operator(1)*1000)/1000;
	if (!op1) s+=String(op0);
	else if (op1<3) s+="e".repeat(op1-1)+gfe(Math.pow(10,op0-Math.floor(op0)))+"e"+gfe(Math.floor(op0));
	else if (op1<8) s+="e".repeat(op1)+gfe(op0);
	else s+="(10^)^"+gfe(op1)+" "+gfe(op0);
	return s;
}

function gfe(num) {
	num = new ExpantaNum(num)
	if (num.gte(1e9)) return f(num)
	num = num.toNumber()
	num = Math.round(num*100)/100
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function f(num) {
	num = new ExpantaNum(num)
	if (num.lt(0)) return "-"+f(num.times(-1))
	if (num.eq(0)) return "0"
	if (num.lt(0.001)) {
		if (num.gt(ExpantaNum.pow(0.1, 1e6))) return Math.pow(10, num.log10().toNumber() % 1 + 1).toFixed(2).replace(/([0-9]+(.[0-9]+[1-9])?)(.?0+$)/, '$1') + 'e-' + num.log10().times(-1).plus(1).floor()
		return "1/("+f(num.pow(-1))+")"
	}
	if (num.lt(1e6)) return ts(num);
	if (num.lt('ee6')) return Math.pow(10, num.log10().toNumber() % 1).toFixed(2).replace(/([0-9]+(.[0-9]+[1-9])?)(.?0+$)/, '$1') + 'e' + num.log10().floor()
	return ts(num);
}

function displayTime(num) {
	num = new ExpantaNum(num)
	if (num.eq(0)) return "0s"
	let s = ""
	for (var i=0;i<Object.keys(TIMES).length;i++) {
		let name = Object.keys(TIMES)[i]
		if (num.lt(TIMES[name]) && i<Object.keys(TIMES).length-1) continue
		let n = num
		if (i>0) n = n.mod(TIMES[Object.keys(TIMES)[i-1]])
		if (n.lte(0)) continue
		n = n.div(TIMES[name])
		if (name!="s") n = n.floor()
		s+=(s==""?"":", ")+f(n)+name
	}
	return s
}