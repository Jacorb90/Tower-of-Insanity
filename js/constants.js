const defaultStart = {
	room: new ExpantaNum(0),
	floor: new ExpantaNum(0),
	gold: new ExpantaNum(0),
	enemyhp: new ExpantaNum(0),
	enemies: new ExpantaNum(0),
	upgrades: {1: new ExpantaNum(0), 2: new ExpantaNum(0), 3: new ExpantaNum(0), 4: new ExpantaNum(0), 5: new ExpantaNum(0), 6: new ExpantaNum(0), 7: new ExpantaNum(0), 8: new ExpantaNum(0), 9: new ExpantaNum(0), 10: new ExpantaNum(0), 11: new ExpantaNum(0), 12: new ExpantaNum(0), 13: new ExpantaNum(0), 14: new ExpantaNum(0)},
	totalFloor: new ExpantaNum(0),
	totalRoom: new ExpantaNum(0),
	tab: "main",
	nursery: {
		adults: new ExpantaNum(0),
		babies: new ExpantaNum(0),
		children: new ExpantaNum(0),
		teens: new ExpantaNum(0),
		hatchTime: new ExpantaNum(0),
		growthTime: new ExpantaNum(0),
		growthTime2: new ExpantaNum(0),
		growthTime3: new ExpantaNum(0),
		boughtAdults: new ExpantaNum(0),
		babyBoosts: new ExpantaNum(0),
		childBoosts: new ExpantaNum(0),
		teenBoosts: new ExpantaNum(0),
		upgrades: [],
	},
}

const BASE = new ExpantaNum(1.1)
const START = new ExpantaNum(10)
const SCALE_START = new ExpantaNum(20)

const TIMES = {
	UL: new ExpantaNum(86400*365*13.2e9),
	y: new ExpantaNum(86400*365),
	d: new ExpantaNum(86400),
	h: new ExpantaNum(3600),
	m: new ExpantaNum(60),
	s: new ExpantaNum(1),
}

const UPGS = {
	num: 14,
	costs: [null, new ExpantaNum(5), new ExpantaNum(50), new ExpantaNum(10), new ExpantaNum(100), new ExpantaNum(250), new ExpantaNum(2.5e3), new ExpantaNum(200), new ExpantaNum(300), new ExpantaNum(2e3), new ExpantaNum(1.5e3), new ExpantaNum(1e8), new ExpantaNum(1e9), new ExpantaNum(1e50), new ExpantaNum(1e60)],
	incs: [null, new ExpantaNum(2), new ExpantaNum(5), new ExpantaNum(2), new ExpantaNum(5), new ExpantaNum(2.5), new ExpantaNum(2.5), new ExpantaNum(2), new ExpantaNum(1.5), new ExpantaNum(2), new ExpantaNum(1.5), new ExpantaNum(2.8), new ExpantaNum(2.8), new ExpantaNum(7.5), new ExpantaNum(3.93)],
}

const ASCEND_REQ = new ExpantaNum(35)

const TABS = {
	nursery: {
		display() { return true },
		text: "Reach Floor 4 to unlock The Nursery.",
		unl() { return player.totalFloor.gte(4) },
	},
}

const NURSERY_UPGS = {
	num: 9,
	unls: [null, 4, 4, 4, 4, 5, 5, 5, 5, 6],
	costs: [null, new ExpantaNum(2.5e3), new ExpantaNum(25e3), new ExpantaNum(15e4), new ExpantaNum(2e5), new ExpantaNum(1e6), new ExpantaNum(8e8), new ExpantaNum(1.5e9), new ExpantaNum(2e9), new ExpantaNum(1e30)],
}