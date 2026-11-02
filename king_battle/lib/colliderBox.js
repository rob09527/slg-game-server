var getRectangVertexs = function(box) {
	var temp1 = {}, temp2 = {}, temp3 = {}, temp4 = {};
	var vertexs = [];
	var cos_theta = Math.cos(box.theta * Math.PI / 180);
	// console.log(cos_theta);
	var sin_theta = Math.sin(box.theta * Math.PI / 180);

	temp1.x = box.x + box.w/2 * cos_theta - box.h/2 * sin_theta;
	temp1.y = box.y + box.w/2 * sin_theta + box.h/2 * cos_theta;
	vertexs.push(temp1);
	temp2.x = box.x - box.w/2 * cos_theta - box.h/2 * sin_theta;
	temp2.y = box.y - box.w/2 * sin_theta + box.h/2 * cos_theta;
	vertexs.push(temp2);
	temp3.x = 2 * box.x - vertexs[0].x;
	temp3.y = 2 * box.y - vertexs[0].y;
	vertexs.push(temp3);
	temp4.x = 2 * box.x - vertexs[1].x;
	temp4.y = 2 * box.y - vertexs[1].y;
	vertexs.push(temp4);
	// console.log(vertexs);
	return vertexs;
};

var getCross = function (p1, p2, p) {
	return (p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y);
};

var isPointInRect = function(p, vertexs) {
	return (getCross(vertexs[0], vertexs[1], p) * getCross(vertexs[2], vertexs[3], p) >= 0 
		 && getCross(vertexs[1], vertexs[2], p) * getCross(vertexs[3], vertexs[0], p) >= 0);
};

var segmentsCrossPoint = function(a, b, c, d) {
	var area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
	var area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
	if(area_abc * area_abd >= 0) return false;
	var area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
	var area_cdb = area_cda + area_abc - area_abd;
	if(area_cda * area_cdb >= 0) return false;

	return true;
};

// 两个任意角度的矩形是否相交
var isIntersrect = function(box1, box2) {
	var vertexs1 = getRectangVertexs(box1);
	var vertexs2 = getRectangVertexs(box2);

	for(var i = 0; i < 4; ++i) {
		if(isPointInRect(vertexs1[i], vertexs2)) return true;
	}

	for(var i = 0; i < 4; ++i) {
		if(isPointInRect(vertexs2[i], vertexs1)) return true;
	}

	for(var i = 0; i < 4; ++i) {
		for(var j = 0; j < 4; ++j) {
			if(segmentsCrossPoint(vertexs1[i], vertexs1[(i+1)%4], vertexs2[j], vertexs2[(j+1)%4])) return true;
		}
	}
	return false;
};

var isIntersCircle = function(circle, box) {

};

// 是否在扇形内
var isInterSector = function(point, sector, src) {
	let disx = sector.dst.x - sector.src.x;
	let disy = sector.dst.y - sector.src.y;
	let theta = Math.atan2(disy,disx) * 180 / Math.PI;
	theta = theta >= 0 ? theta : 360 + theta;
	
	let xpdis = point.x - src.x;
	let ypdis = point.y - src.y;

	if(xpdis*xpdis + ypdis*ypdis > Math.pow(sector.r, 2)) return false;

	let ptheta = Math.atan2(ypdis, xpdis) * 180 / Math.PI;
	ptheta = ptheta >= 0 ? ptheta : 360 + ptheta;

	let min = theta - sector.theta/2;
	let max = theta + sector.theta/2;

	return (ptheta >= min && ptheta <= max) || (ptheta + 360 >= min && ptheta + 360 <= max) || (ptheta >= min + 360 && ptheta <= max + 360);
};

module.exports = {
    isIntersrect: isIntersrect,
	isInterSector: isInterSector,
};
