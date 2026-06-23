/**
 * Trace logic adapted from quick-connections <https://github.com/niknah/quick-connections>
 */

const EPSILON = 1e-6;
const INSIDE = 1;
const DEFAULT_CELL_SIZE = 256;

function clipT(num, denom, c) {
	const tE = c[0], tL = c[1];
	if (Math.abs(denom) < EPSILON) {
		return num < 0;
	}
	const t = num / denom;
	if (denom > 0) {
		if (t > tL) {
			return 0;
		}
		if (t > tE) {
			c[0] = t;
		}
	} else {
		if (t < tE) {
			return 0;
		}
		if (t < tL) {
			c[1] = t;
		}
	}
	return 1;
}

function liangBarsky(a, b, box, da, db) {
	const x1 = a[0], y1 = a[1];
	const x2 = b[0], y2 = b[1];
	const dx = x2 - x1;
	const dy = y2 - y1;
	if (da === undefined || db === undefined) {
		da = a;
		db = b;
	} else {
		da[0] = a[0];
		da[1] = a[1];
		db[0] = b[0];
		db[1] = b[1];
	}
	if (Math.abs(dx) < EPSILON
		&& Math.abs(dy) < EPSILON
		&& x1 >= box[0]
		&& x1 <= box[2]
		&& y1 >= box[1]
		&& y1 <= box[3]) {
		return INSIDE;
	}
	const c = [0, 1];
	if (clipT(box[0] - x1, dx, c)
		&& clipT(x1 - box[2], -dx, c)
		&& clipT(box[1] - y1, dy, c)
		&& clipT(y1 - box[3], -dy, c)) {
		const tE = c[0], tL = c[1];
		if (tL < 1) {
			db[0] = x1 + tL * dx;
			db[1] = y1 + tL * dy;
		}
		if (tE > 0) {
			da[0] += tE * dx;
			da[1] += tE * dy;
		}
		return INSIDE;
	}
	return 0;
}

function getAreaFromNode(node) {
	if (!node) {
		return null;
	}
	try {
		if (node.getBounding) {
			const area = new Float32Array(4);
			node.getBounding(area);
			return [
				area[0],
				area[1],
				area[0] + area[2],
				area[1] + area[3],
			];
		}
	} catch (e) {
	}
	if (node.pos && node.size) {
		return [
			node.pos[0],
			node.pos[1],
			node.pos[0] + node.size[0],
			node.pos[1] + node.size[1],
		];
	}
	return null;
}

function normalizeBox(item, index) {
	const node = item?.node || item;
	const area = item?.area || getAreaFromNode(node);
	if (!area) {
		return null;
	}

	return {
		id: node?.id ?? item?.id ?? index,
		node,
		area: Array.from(area),
		linesArea: Array.from(item?.linesArea || area),
		source: item,
	};
}

function cellRange(area, cellSize) {
	return {
		x1: Math.floor(area[0] / cellSize),
		y1: Math.floor(area[1] / cellSize),
		x2: Math.floor(area[2] / cellSize),
		y2: Math.floor(area[3] / cellSize),
	};
}

function cellKey(x, y) {
	return `${x},${y}`;
}

function expandedArea(area, padding) {
	return [
		area[0] - padding,
		area[1] - padding,
		area[2] + padding,
		area[3] + padding,
	];
}

function segmentArea(from, to, padding) {
	return [
		Math.min(from[0], to[0]) - padding,
		Math.min(from[1], to[1]) - padding,
		Math.max(from[0], to[0]) + padding,
		Math.max(from[1], to[1]) + padding,
	];
}

export function buildNodeBBoxIndex(items, options = {}) {
	const cellSize = options.cellSize || DEFAULT_CELL_SIZE;
	const padding = options.padding || 0;
	const boxes = [];
	const grid = new Map();

	(items || []).forEach((item, index) => {
		const box = normalizeBox(item, index);
		if (!box) {
			return;
		}

		box.area = expandedArea(box.area, padding);
		box.linesArea = expandedArea(box.linesArea, padding);
		const boxIndex = boxes.push(box) - 1;
		const range = cellRange(box.area, cellSize);

		for (let x = range.x1; x <= range.x2; x++) {
			for (let y = range.y1; y <= range.y2; y++) {
				const key = cellKey(x, y);
				let bucket = grid.get(key);
				if (!bucket) {
					bucket = new Set();
					grid.set(key, bucket);
				}
				bucket.add(boxIndex);
			}
		}
	});

	return { cellSize, boxes, grid };
}

export function querySegmentCandidates(index, from, to, padding = 0) {
	if (!index) {
		return [];
	}

	const seen = new Set();
	const candidates = [];
	const range = cellRange(segmentArea(from, to, padding), index.cellSize);

	for (let x = range.x1; x <= range.x2; x++) {
		for (let y = range.y1; y <= range.y2; y++) {
			const bucket = index.grid.get(cellKey(x, y));
			if (!bucket) {
				continue;
			}
			for (const boxIndex of bucket) {
				if (seen.has(boxIndex)) {
					continue;
				}
				seen.add(boxIndex);
				candidates.push(index.boxes[boxIndex]);
			}
		}
	}

	return candidates;
}

export function findSegmentIntersections(index, from, to, options = {}) {
	const padding = options.padding || 0;
	const excludeNodeIds = options.excludeNodeIds || null;
	const candidates = querySegmentCandidates(index, from, to, padding);
	const hits = [];

	for (const candidate of candidates) {
		if (excludeNodeIds?.has?.(candidate.id) || excludeNodeIds?.has?.(String(candidate.id))) {
			continue;
		}

		const clipA = [-1, -1];
		const clipB = [-1, -1];
		const clipped = liangBarsky(from, to, candidate.area, clipA, clipB);
		if (clipped !== INSIDE) {
			continue;
		}

		const centerX = candidate.area[0] + ((candidate.area[2] - candidate.area[0]) / 2);
		const centerY = candidate.area[1] + ((candidate.area[3] - candidate.area[1]) / 2);
		const dx = centerX - from[0];
		const dy = centerY - from[1];
		hits.push({
			start: clipA,
			end: clipB,
			node: candidate.source || candidate,
			distance: (dx * dx) + (dy * dy),
		});
	}

	hits.sort((a, b) => a.distance - b.distance);
	return hits;
}
