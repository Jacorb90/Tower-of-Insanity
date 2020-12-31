var player = defaultStart

function getHPAdj() {
	let adj = new ExpantaNum(1)
	adj = adj.div(ExpantaNum.pow(ExpantaNum.add(10, getUpgs(11).plus(getUpgs(12)).times(2)), getUpgs(8).add(getUpgs(10))))
	return adj
}

function getFloorEff(f=player.floor) {
	let eff = f.pow(1.2).div(2).add(1)
	return eff
}

function getTotalEnemyHP(noFloor=false, adj=new ExpantaNum(0)) {
	let f = player.floor
	if (noFloor) f = new ExpantaNum(0)
	let x = player.room.add(adj).times(getFloorEff(f))
	let b = BASE
	let s = START
	let ss = SCALE_START
	let hp = b.pow(x.times(ExpantaNum.max(x.div(ss), 1))).times(s)
	hp = hp.times(getHPAdj())
	return hp.ceil()
}

function canContinue() { return player.enemies.lte(0) }

function getDmg() {
	let dmg = new ExpantaNum(1)
	dmg = dmg.times(ExpantaNum.pow(ExpantaNum.add(3, getUpgs(11).plus(getUpgs(12))), getUpgs(1).add(getUpgs(3))))
	dmg = dmg.times(getAdultEff())
	return dmg.floor()
}

function getGoldGain() {
	let p = getTotalEnemyHP(true) 
	p = p.div(getHPAdj())
	let gain = p.sqrt().div(2)
	gain = gain.times(ExpantaNum.pow(ExpantaNum.add(2, getUpgs(11).plus(getUpgs(12))), getUpgs(2).add(getUpgs(4))))
	if (hasNurseryUpg(6)) gain = gain.times(getAdultEff())
	return gain.floor()
}

function action(bulk=new ExpantaNum(1)) {
	let dmg = getDmg().times(bulk);
	if (!canContinue()) {
		player.enemyhp = player.enemyhp.sub(dmg).max(0)
		if (player.enemyhp.lte(0)) {
			player.enemies = new ExpantaNum(0)
			player.gold = player.gold.add(getGoldGain())
		}
	} 
	if (canContinue()) {
		player.room = player.room.add(1)
		player.enemies = new ExpantaNum(1)
		player.enemyhp = getTotalEnemyHP()
	}
}

function getUpgs(x) {
	return player.upgrades[x]?player.upgrades[x]:new ExpantaNum(0)
}

function getUpgCost(x) {
	let cost = UPGS.costs[x].times(ExpantaNum.pow(UPGS.incs[x], ExpantaNum.pow(UPGS.incs[x], getUpgs(x)).sub(1)))
	if (x<5) cost = cost.div(ExpantaNum.pow(ExpantaNum.add(10, getUpgs(11).plus(getUpgs(12)).times(2)), getUpgs(5).add(getUpgs(6))))
	return cost.ceil()
}

function getUpgTarg(x) {
	let gold = player.gold;
	if (x<5) gold = gold.times(ExpantaNum.pow(ExpantaNum.add(10, getUpgs(11).plus(getUpgs(12)).times(2)), getUpgs(5).add(getUpgs(6))));
	let targ = gold.div(UPGS.costs[x]).max(1).logBase(UPGS.incs[x]).plus(1).logBase(UPGS.incs[x]).plus(1).floor()
	return targ;
}

function buyUpg(x) {
	if (player.gold.lt(getUpgCost(x))) return
	player.gold = player.gold.sub(getUpgCost(x))
	if (player.upgrades[x]) player.upgrades[x] = player.upgrades[x].add(1)
	else player.upgrades[x] = new ExpantaNum(1)
	if (x==8 || x==10) player.enemyhp = player.enemyhp.div(ExpantaNum.add(10, getUpgs(11).plus(getUpgs(12)).times(2))).ceil()
}

function autobuyUpgs(start, end) {
	for (let x=start;x<=end;x++) {
		if (player.gold.lt(getUpgCost(x))) continue;
		let target = getUpgTarg(x);
		let orig = player.upgrades[x]||new ExpantaNum(0);
		if (target.sub(orig).lt(1)) continue;
		if (player.upgrades[x]) player.upgrades[x] = player.upgrades[x].max(target);
		else player.upgrades[x] = target;
		if (x==8 || x==10) player.enemyhp = player.enemyhp.div(ExpantaNum.add(10, getUpgs(11).plus(getUpgs(12)).times(2)).pow(target.sub(orig))).ceil()
	}
}

function getAscendReq() {
	let floor = player.floor
	if (floor.gte(4)) floor = floor.times(0.9)
	let req = ASCEND_REQ.add(floor.pow(2))
	return req.round()
}

function canAscend() {
	return player.room.gte(getAscendReq())
}

function nextFloor() {
	if (!canAscend()) return
	ascendReset()
	player.floor = player.floor.add(1)
}

function prevFloor() {
	if (player.floor.lte(0)) return
	ascendReset()
	player.floor = player.floor.sub(1).max(0)
}

function ascendReset() {
	player.room = new ExpantaNum(0)
	player.gold = new ExpantaNum(0)
	player.enemyhp = new ExpantaNum(0)
	player.enemies = new ExpantaNum(0)
	if (player.upgrades[1]) player.upgrades[1] = new ExpantaNum(0)
	if (player.upgrades[2]) player.upgrades[2] = new ExpantaNum(0)
	if (player.upgrades[5]) player.upgrades[5] = new ExpantaNum(0)
	if (player.upgrades[7]) player.upgrades[7] = new ExpantaNum(0)
	if (player.upgrades[8]) player.upgrades[8] = new ExpantaNum(0)
	if (player.upgrades[11]) player.upgrades[11] = new ExpantaNum(0)
	if (player.upgrades[14]) player.upgrades[14] = new ExpantaNum(0)
}

var upg7diff = new ExpantaNum(0)
var upg13diff = new ExpantaNum(0);

function gameLoop(diff) {
	player.totalFloor = player.totalFloor.max(player.floor)
	player.totalRoom = player.totalRoom.max(player.room)
	document.getElementById("room").textContent = gfe(player.room)
	document.getElementById("floor").textContent = gfe(player.floor)
	document.getElementById("enemyhp").textContent = f(player.enemyhp)+"/"+f(getTotalEnemyHP())
	document.getElementById("gold").textContent = f(player.gold)
	document.getElementById("nextRoom").textContent = canContinue() ? "Next Room" : "Attack!"
	for (i=1;i<=UPGS.num;i++) {
		document.getElementById("upg"+i).className = "longbtn"+(player.gold.gte(getUpgCost(i))?"":" locked")
		document.getElementById("upg"+i+"cost").textContent = f(getUpgCost(i))
	}
	document.getElementById("nextFloor").className = "longbtn"+(canAscend()?"":" locked")
	document.getElementById("nextFloor").textContent = "Next Floor"+(canAscend()?"":(" (Req: Room "+f(getAscendReq())+")"))
	document.getElementById("prevFloor").style.display = player.floor.gt(0)?"":"none"
	document.getElementById("floor1upgs").style.display = player.totalFloor.gte(1) ? "" : "none"
	document.getElementById("floor2upgs").style.display = player.totalFloor.gte(2) ? "" : "none"
	if (getUpgs(7).add(getUpgs(9)).gt(0)) {
		upg7diff = upg7diff.add(diff)
		if (upg7diff.gte(ExpantaNum.div(ExpantaNum.add(5, getUpgs(11).plus(getUpgs(12)).times(1.5)).pow(-1), getUpgs(7).add(getUpgs(9))))) {
			let bulk = upg7diff.div(ExpantaNum.div(ExpantaNum.add(5, getUpgs(11).plus(getUpgs(12)).times(1.5)).pow(-1), getUpgs(7).add(getUpgs(9)))).floor()
			upg7diff = new ExpantaNum(0)
			action(bulk)
		}
	}
	if (new ExpantaNum(getUpgs(13)).gt(0)) {
		upg13diff = upg13diff.add(diff);
		if (upg13diff.gte(ExpantaNum.div(1.5, getUpgs(13)))) {
			upg13diff = new ExpantaNum(0);
			autobuyUpgs(1, 12);
		}
	}
	document.getElementById("floor3upgs").style.display = player.totalFloor.gte(3) ? "" : "none"
	document.getElementById("floor4upgs").style.display = player.totalFloor.gte(4) ? "" : "none"
	document.getElementById("floor5upgs").style.display = player.totalFloor.gte(5) ? "" : "none"
	document.getElementById("floor6upgs").style.display = player.totalFloor.gte(6) ? "" : "none"
	document.getElementById("upg1eff").textContent = f(new ExpantaNum(3).add(getUpgs(11).plus(getUpgs(12))))
	document.getElementById("upg2eff").textContent = f(new ExpantaNum(2).add(getUpgs(11).plus(getUpgs(12))))
	document.getElementById("upg5eff").textContent = f(new ExpantaNum(10).add(getUpgs(11).plus(getUpgs(12)).times(2)))
	document.getElementById("upg7eff").textContent = f(new ExpantaNum(5).add(getUpgs(11).plus(getUpgs(12)).times(1.5)))
	document.getElementById("upg8eff").textContent = f(new ExpantaNum(10).add(getUpgs(11).plus(getUpgs(12)).times(2)))
	tabs = document.getElementsByClassName("tab")
	for (i=0;i<tabs.length;i++) {
		tab = tabs[i]
		tab.style.display = player.tab==tab.id?"":"none"
	}
	for (i=0;i<Object.keys(TABS).length;i++) {
		let name = Object.keys(TABS)[i];
		let data = TABS[name];
		let el = document.getElementById(name+"tabbtn")
		el.style.display = data.display()?"":"none"
		
		let unl = data.unl();
		el.className = unl?"":"locked"
		if (unl && el.hasAttribute("tooltip")) el.removeAttribute("tooltip")
		if (!unl) el.setAttribute('tooltip', data.text);
	}
	if (player.nursery.teens.gt(0) && player.totalFloor.gte(4)) {
		if (getGrowthRate("teen").lt(31)) {
			player.nursery.growthTime3 = player.nursery.growthTime3.add(diff)
			if (player.nursery.growthTime3.gte(getGrowthRate("teen").pow(-1))) {
				player.nursery.growthTime3 = new ExpantaNum(0)
				player.nursery.teens = player.nursery.teens.sub(1)
				player.nursery.adults = player.nursery.adults.add(1)
			}
		} else {
			player.nursery.growthTime3 = new ExpantaNum(0)
			let growth = getGrowthRate("teen").times(diff).min(player.nursery.teens)
			player.nursery.teens = player.nursery.teens.sub(growth.floor())
			player.nursery.adults = player.nursery.adults.add(growth.floor())
		}
	}
	if (player.nursery.children.gt(0) && player.totalFloor.gte(4)) {
		if (getGrowthRate("child").lt(31)) {
			player.nursery.growthTime2 = player.nursery.growthTime2.add(diff)
			if (player.nursery.growthTime2.gte(getGrowthRate("child").pow(-1))) {
				player.nursery.growthTime2 = new ExpantaNum(0)
				player.nursery.children = player.nursery.children.sub(1)
				player.nursery.teens = player.nursery.teens.add(1)
			}
		} else {
			player.nursery.growthTime2 = new ExpantaNum(0)
			let growth = getGrowthRate("child").times(diff).min(player.nursery.children)
			player.nursery.children = player.nursery.children.sub(growth.floor())
			player.nursery.teens = player.nursery.teens.add(growth.floor())
		}
	}
	if (player.nursery.babies.gt(0) && player.totalFloor.gte(4)) {
		if (getGrowthRate("baby").lt(31)) {
			player.nursery.growthTime = player.nursery.growthTime.add(diff)
			if (player.nursery.growthTime.gte(getGrowthRate("baby").pow(-1))) {
				player.nursery.growthTime = new ExpantaNum(0)
				player.nursery.babies = player.nursery.babies.sub(1)
				player.nursery.children = player.nursery.children.add(1)
			}
		} else {
			player.nursery.growthTime = new ExpantaNum(0)
			let growth = getGrowthRate("baby").times(diff).min(player.nursery.babies)
			player.nursery.babies = player.nursery.babies.sub(growth.floor())
			player.nursery.children = player.nursery.children.add(growth.floor())
		}
	}
	if (player.nursery.adults.gt(0) && player.totalFloor.gte(4)) {
		if (getHatchRate().lt(31)) {
			player.nursery.hatchTime = player.nursery.hatchTime.add(diff)
			if (player.nursery.hatchTime.gte(getHatchRate().pow(-1))) {
				player.nursery.hatchTime = new ExpantaNum(0)
				player.nursery.babies = player.nursery.babies.add(1)
			}
		} else {
			player.nursery.hatchTime = new ExpantaNum(0)
			player.nursery.babies = player.nursery.babies.add(getHatchRate().times(diff).floor())
		}
	}
	document.getElementById("adults").textContent = f(player.nursery.adults)
	document.getElementById("adultDmg").textContent = f(getAdultEff())
	document.getElementById("babies").textContent = f(player.nursery.babies)
	document.getElementById("babyGrowthRate").textContent = displayTime(getEachGrowth("baby").pow(-1))
	document.getElementById("babyGrowthRateInc").textContent = f(getGrowthInc("baby"))
	document.getElementById("children").textContent = f(player.nursery.children)
	document.getElementById("childGrowthRate").textContent = displayTime(getEachGrowth("child").pow(-1))
	document.getElementById("childGrowthRateInc").textContent = f(getGrowthInc("child"))
	document.getElementById("teens").textContent = f(player.nursery.teens)
	document.getElementById("teenGrowthRate").textContent = displayTime(getEachGrowth("teen").pow(-1))
	document.getElementById("teenGrowthRateInc").textContent = f(getGrowthInc("teen"))
	document.getElementById("hireAdult").className = "longbtn2"+(player.gold.gte(getAdultCost()) ? "" : " locked")
	document.getElementById("boostBaby").className = "longbtn2"+(player.nursery.adults.gte(getBabyCost()) ? "" : " locked")
	document.getElementById("boostChild").className = "longbtn2"+(player.nursery.adults.gte(getChildCost()) ? "" : " locked")
	document.getElementById("boostTeen").className = "longbtn2"+(player.nursery.adults.gte(getTeenCost()) ? "" : " locked")
	document.getElementById("hireAdultCost").textContent = f(getAdultCost())
	document.getElementById("boostBabyCost").textContent = f(getBabyCost())
	document.getElementById("boostChildCost").textContent = f(getChildCost())
	document.getElementById("boostTeenCost").textContent = f(getTeenCost())
	for (i=1;i<=NURSERY_UPGS.num;i++) {
		let unl = player.totalFloor.gte(NURSERY_UPGS.unls[i])
		let cost = NURSERY_UPGS.costs[i]
		document.getElementById("nursery"+i).style.display = unl?"":"none";
		if (!unl) continue;
		document.getElementById("nursery"+i).className = "longbtn2"+(player.nursery.upgrades.includes(i) ? " bought" : (player.nursery.adults.gte(cost) ? "" : " locked"))
		document.getElementById("nursery"+i+"cost").textContent = f(cost)
	}
	document.getElementById("nursery6desc").textContent = hasNurseryUpg(6)?" and Gold gain":""
}

function showTab(x) {
	if (TABS[x]) if (!TABS[x].unl()) return;
	player.tab = x
}

function getAdultEffExp() {
	let exp = new ExpantaNum(1.8)
	if (hasNurseryUpg(2)) exp = exp.add(0.2)
	if (player.totalFloor.gte(6)) exp = exp.add(ExpantaNum.div(getUpgs(14), 10));
	return exp
}

function getAdultEff() {
	let a = player.nursery.adults
	let eff = a.plus(1).pow(getAdultEffExp())
	return eff
}

function getGrowthInc(type) {
	let inc = new ExpantaNum(2)
	if (hasNurseryUpg(8)) {
		if (player.nursery.babyBoosts.gt(0) && type=="baby") inc = inc.plus(player.nursery.babyBoosts)
		if (player.nursery.childBoosts.gt(0) && type=="child") inc = inc.plus(player.nursery.childBoosts)
		if (player.nursery.teenBoosts.gt(0) && type=="teen") inc = inc.plus(player.nursery.teenBoosts)
	}
	return inc
}

function getEachGrowth(type) {
	let growth = new ExpantaNum(0.1)
	let inc = getGrowthInc(type)
	if (player.nursery.babyBoosts.gt(0) && type=="baby") growth = growth.times(ExpantaNum.pow(inc, player.nursery.babyBoosts))
	if (player.nursery.childBoosts.gt(0) && type=="child") growth = growth.times(ExpantaNum.pow(inc, player.nursery.childBoosts))
	if (player.nursery.teenBoosts.gt(0) && type=="teen") growth = growth.times(ExpantaNum.pow(inc, player.nursery.teenBoosts))
	if (type=="baby" && hasNurseryUpg(7)) growth = growth.times(ExpantaNum.pow(1.5, player.nursery.boughtAdults));
	if (type=="child" && hasNurseryUpg(3)) growth = growth.times(ExpantaNum.pow(1.1, player.totalFloor))
	return growth
}

function getGrowthRate(type) {
	let resource = {baby: player.nursery.babies, child: player.nursery.children, teen: player.nursery.teens}[type]
	let rate = ExpantaNum.mul(getEachGrowth(type), resource)
	return rate
}

function getHatchRate() {
	let rate = ExpantaNum.mul(1/3, player.nursery.adults.sqrt())
	if (hasNurseryUpg(1)) rate = rate.times(10)
	if (hasNurseryUpg(5)) rate = rate.times(ExpantaNum.pow(1.02, player.totalRoom));
	if (hasNurseryUpg(8)) {
		let inc = getGrowthInc("baby").root(2.3);
		if (player.nursery.babyBoosts.gt(0)) rate = rate.times(ExpantaNum.pow(inc, player.nursery.babyBoosts))
		if (player.nursery.childBoosts.gt(0)) rate = rate.times(ExpantaNum.pow(inc, player.nursery.childBoosts))
		if (player.nursery.teenBoosts.gt(0)) rate = rate.times(ExpantaNum.pow(inc, player.nursery.teenBoosts))
	}
	if (hasNurseryUpg(9)) rate = rate.times(ExpantaNum.pow(2.5, player.totalFloor));
	return rate
}

function getAdultCost() {
	let cost = ExpantaNum.pow(10, player.nursery.boughtAdults.plus(1).pow(2)).times(1e29)
	if (hasNurseryUpg(4)) cost = cost.div(25)
	return cost
}

function hireAdult() {
	if (player.gold.lt(getAdultCost())) return
	player.gold = player.gold.sub(getAdultCost())
	player.nursery.adults = player.nursery.adults.plus(1)
	player.nursery.boughtAdults = player.nursery.boughtAdults.add(1)
}

function getBabyCost() {
	let cost = ExpantaNum.pow(3, player.nursery.babyBoosts.plus(1).pow(2)).times(100/3)
	if (hasNurseryUpg(4)) cost = cost.div(25)
	return cost.floor()
}

function boostBaby() {
	if (player.nursery.adults.lt(getBabyCost())) return
	player.nursery.adults = player.nursery.adults.sub(getBabyCost())
	player.nursery.babyBoosts = player.nursery.babyBoosts.add(1)
}

function getChildCost() {
	let cost = ExpantaNum.pow(2.5, player.nursery.childBoosts.plus(1).pow(2)).times(100)
	if (hasNurseryUpg(4)) cost = cost.div(25)
	return cost.floor()
}

function boostChild() {
	if (player.nursery.adults.lt(getChildCost())) return
	player.nursery.adults = player.nursery.adults.sub(getChildCost())
	player.nursery.childBoosts = player.nursery.childBoosts.add(1)
}

function getTeenCost() {
	let cost = ExpantaNum.pow(2, player.nursery.teenBoosts.plus(1).pow(2)).times(500)
	if (hasNurseryUpg(4)) cost = cost.div(25)
	return cost.floor()
}

function boostTeen() {
	if (player.nursery.adults.lt(getTeenCost())) return
	player.nursery.adults = player.nursery.adults.sub(getTeenCost())
	player.nursery.teenBoosts = player.nursery.teenBoosts.add(1)
}

function buyNurseryUpg(x) {
	if (player.nursery.upgrades.includes(x)) return
	if (player.totalFloor.lt(NURSERY_UPGS.unls[x])) return;
	if (player.nursery.adults.lt(NURSERY_UPGS.costs[x])) return
	player.nursery.adults = player.nursery.adults.sub(NURSERY_UPGS.costs[x])
	player.nursery.upgrades.push(x)
}

function hasNurseryUpg(x) {
	if (player.totalFloor.lt(NURSERY_UPGS.unls[x])) return false;
	return player.nursery.upgrades.includes(x);
}

function save() {
	localStorage.setItem('rpgInc', btoa(JSON.stringify(player)))
}

function load() {
	if (localStorage.getItem('rpgInc') === null) player = defaultStart
	else player = JSON.parse(atob(localStorage.getItem('rpgInc')))
	checkExistence(player,defaultStart)
	transformToDecimal(player,defaultStart)
}

function checkExistence(object,orig) {
	for(i in orig) {
		if (object[i] === undefined) object[i] = orig[i]
		else if (typeof(object[i]) == "object") checkExistence(object[i],orig[i]) 
	}
}

function transformToDecimal(object,orig) { 
	for(i in orig) {
		if (orig[i] instanceof ExpantaNum) object[i] = new ExpantaNum(object[i])
		else if (typeof(object[i]) == "object") transformToDecimal(object[i],orig[i])
	}
}

setInterval(function() {
	gameLoop(new ExpantaNum(0.033))
}, 33)