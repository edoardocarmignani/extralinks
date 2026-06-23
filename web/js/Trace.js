/**
 * Trace logic adapted from quick-connections <https://github.com/niknah/quick-connections>
 */

import { buildNodeBBoxIndex, findSegmentIntersections } from "./NodeBBoxIndex.js"

class MapLinks {
	constructor(canvas, config) {
		this.canvas = canvas;
		this.nodesByRight = [];
		this.nodesById = [];
		this.pathsByLinkId = new Map();
		this.nodeBBoxIndex = null;
		this.config = config;
		this.maxDirectLineDistance = Number.MAX_SAFE_INTEGER;
	}

	findClippedNode(outputXY, inputXY) {
		const intersections = findSegmentIntersections(this.nodeBBoxIndex, outputXY, inputXY);
		if (intersections.length) {
			return intersections[0];
		}
		return null;
	}

	testPath(path) {
		const len1 = (path.length - 1);
		for (let p = 0; p < len1; ++p) {
			const clipped = this.findClippedNode(path[p], path[p + 1]);
			if (clipped) {
				return clipped;
			}
		}
		return null;
	}

	mapFinalLink(outputXY, inputXY) {
		const clipped = this.findClippedNode(outputXY, inputXY);
		if (!clipped) {
			const dist = Math.sqrt(((outputXY[0] - inputXY[0]) ** 2) + ((outputXY[1] - inputXY[1]) ** 2));
			if (dist < this.maxDirectLineDistance) {
				return { path: _path90Or45(outputXY, inputXY) };
			}
		}

		const horzDistance = inputXY[0] - outputXY[0];
		const vertDistance = inputXY[1] - outputXY[1];
		const horzDistanceAbs = Math.abs(horzDistance);
		const vertDistanceAbs = Math.abs(vertDistance);

		if (horzDistanceAbs > vertDistanceAbs) {
			const goingLeft = inputXY[0] < outputXY[0];
			const pathStraight45 = [
				[outputXY[0], outputXY[1]],
				[inputXY[0] - (goingLeft ? -vertDistanceAbs : vertDistanceAbs), outputXY[1]],
				[inputXY[0], inputXY[1]],
			];
			if (!this.testPath(pathStraight45)) {
				return { path: pathStraight45 };
			}

			const path45Straight = [
				[outputXY[0], outputXY[1]],
				[outputXY[0] + (goingLeft ? -vertDistanceAbs : vertDistanceAbs), inputXY[1]],
				[inputXY[0], inputXY[1]],
			];
			if (!this.testPath(path45Straight)) {
				return { path: path45Straight };
			}
		} else {
			const goingUp = inputXY[1] < outputXY[1];
			const pathStraight45 = [
				[outputXY[0], outputXY[1]],
				[outputXY[0], inputXY[1] + (goingUp ? horzDistanceAbs : -horzDistanceAbs)],
				[inputXY[0], inputXY[1]],
			];
			if (!this.testPath(pathStraight45)) {
				return { path: pathStraight45 };
			}

			const path45Straight = [
				[outputXY[0], outputXY[1]],
				[inputXY[0], outputXY[1] - (goingUp ? horzDistanceAbs : -horzDistanceAbs)],
				[inputXY[0], inputXY[1]],
			];
			if (!this.testPath(path45Straight)) {
				return { path: path45Straight };
			}
		}

		const path90Straight = [
			[outputXY[0], outputXY[1]],
			[outputXY[0], inputXY[1]],
			[inputXY[0], inputXY[1]],
		];
		const clippedVert = this.testPath(path90Straight);
		if (!clippedVert) {
			return { path: path90Straight };
		}

		const pathStraight90 = [
			[outputXY[0], outputXY[1]],
			[inputXY[0], outputXY[1]],
			[inputXY[0], inputXY[1]],
		];
		const clippedHorz = this.testPath(pathStraight90);
		if (!clippedHorz) {
			return { path: pathStraight90 };
		}
		return {
			clippedHorz,
			clippedVert,
		};
	}

	mapLink(outputXY, inputXY, isBlocked) {
		const { clippedHorz, clippedVert, path } = this.mapFinalLink(outputXY, inputXY);
		if (path) {
			return path;
		}

		const horzDistance = inputXY[0] - outputXY[0];
		const vertDistance = inputXY[1] - outputXY[1];
		const horzDistanceAbs = Math.abs(horzDistance);
		const vertDistanceAbs = Math.abs(vertDistance);

		let blockedNodeId;
		let pathAroundNode;
		let lastPathLocation;
		let linesArea;

		if (horzDistanceAbs > vertDistanceAbs) {
			blockedNodeId = clippedHorz.node.node.id;
			linesArea = clippedHorz.node.linesArea;
			const horzEdge = horzDistance <= 0
				? (linesArea[2])
				: (linesArea[0] - 1);
			pathAroundNode = [
				[outputXY[0], outputXY[1]],
				[horzEdge, outputXY[1]],
			];

			if (horzDistance <= 0) {
				linesArea[2] += this.config.lineSpace;
			} else {
				linesArea[0] -= this.config.lineSpace;
			}

			const vertDistanceViaBlockTop =
				Math.abs(inputXY[1] - linesArea[1]) +
				Math.abs(linesArea[1] - outputXY[1]);
			const vertDistanceViaBlockBottom =
				Math.abs(inputXY[1] - linesArea[3]) +
				Math.abs(linesArea[3] - outputXY[1]);

			lastPathLocation = [
				horzEdge,
				vertDistanceViaBlockTop <= vertDistanceViaBlockBottom ?
					(linesArea[1])
					: (linesArea[3]),
			];
			const unblockNotPossible1 = this.testPath([...pathAroundNode, lastPathLocation]);
			if (unblockNotPossible1) {
				lastPathLocation = [
					horzEdge,
					vertDistanceViaBlockTop > vertDistanceViaBlockBottom ?
						(linesArea[1])
						: (linesArea[3]),
				];
			}
			if (lastPathLocation[1] < outputXY[1]) {
				linesArea[1] -= this.config.lineSpace;
				lastPathLocation[1] -= 1;
			} else {
				linesArea[3] += this.config.lineSpace;
				lastPathLocation[1] += 1;
			}
		} else {
			blockedNodeId = clippedVert.node.node.id;
			linesArea = clippedVert.node.linesArea;
			const vertEdge =
				vertDistance <= 0
					? (linesArea[3] + 1)
					: (linesArea[1] - 1);
			pathAroundNode = [
				[outputXY[0], outputXY[1]],
				[outputXY[0], vertEdge],
			];
			if (vertDistance <= 0) {
				linesArea[3] += this.config.lineSpace;
			} else {
				linesArea[1] -= this.config.lineSpace;
			}

			const horzDistanceViaBlockLeft =
				Math.abs(inputXY[0] - linesArea[0]) +
				Math.abs(linesArea[0] - outputXY[0]);
			const horzDistanceViaBlockRight =
				Math.abs(inputXY[0] - linesArea[2]) +
				Math.abs(linesArea[2] - outputXY[0]);

			lastPathLocation = [
				horzDistanceViaBlockLeft <= horzDistanceViaBlockRight ?
					(linesArea[0] - 1)
					: (linesArea[2]),
				vertEdge,
			];
			const unblockNotPossible1 = this.testPath([...pathAroundNode, lastPathLocation]);
			if (unblockNotPossible1) {
				lastPathLocation = [
					horzDistanceViaBlockLeft > horzDistanceViaBlockRight ?
						(linesArea[0])
						: (linesArea[2]),
					vertEdge,
				];
			}
			if (lastPathLocation[0] < outputXY[0]) {
				linesArea[0] -= this.config.lineSpace;
			} else {
				linesArea[2] += this.config.lineSpace;
			}
		}

		if (isBlocked[blockedNodeId] > 3) {
			isBlocked.blocked = true;
			return _path90Or45(outputXY, inputXY);
		}
		if (isBlocked[blockedNodeId])
			++isBlocked[blockedNodeId];
		else
			isBlocked[blockedNodeId] = 1;
		const nextPath = this.mapLink(
			lastPathLocation,
			inputXY,
			isBlocked,
		);
		return [...pathAroundNode, lastPathLocation, ...nextPath.slice(1)];
	}

	expandSourceNodeLinesArea(sourceNodeInfo, path) {
		if (path.length < 3) {
			return false;
		}

		const linesArea = sourceNodeInfo.linesArea;
		if (path[1][0] === path[2][0]) {
			linesArea[2] += this.config.lineSpace;
		}
		return true;
	}

	expandTargetNodeLinesArea(targetNodeInfo, path) {
		if (path.length < 2) {
			return false;
		}

		const linesArea = targetNodeInfo.linesArea;
		const path2Len = path.length - 2;
		if (path[path2Len - 1][0] === path[path2Len][0]) {
			linesArea[0] -= this.config.lineSpace;
		}
		return true;
	}

	getNodeOnPos(xy) {
		for (let i = 0; i < this.nodesByRight.length; ++i) {
			const nodeI = this.nodesByRight[i];
			const { linesArea } = nodeI;
			if (xy[0] >= linesArea[0]
				&& xy[1] >= linesArea[1]
				&& xy[0] < linesArea[2]
				&& xy[1] < linesArea[3]
			) {
				return nodeI;
			}
		}
		return null;
	}

	mapLinks(nodesByExecution) {
		const graphLinks = this.canvas.graph.links;
		if (!graphLinks) {
			console.error('Missing graph.links', this.canvas.graph);
			return;
		}

		this.nodesByRight = [];
		this.nodesById = {};
		this.pathsByLinkId.clear();
		this.nodesByRight = nodesByExecution.map((node) => {
			const area = _getNodeArea(node);
			if (!area) {
				return null;
			}
			const linesArea = Array.from(area);
			linesArea[0] += this.config.nodeSpace[0];
			linesArea[1] += this.config.nodeSpace[1];
			linesArea[2] += this.config.nodeSpace[2];
			linesArea[3] += this.config.nodeSpace[3];
			const obj = {
				node,
				area,
				linesArea,
			};
			this.nodesById[node.id] = obj;
			return obj;
		}).filter(Boolean);
		this.nodeBBoxIndex = buildNodeBBoxIndex(this.nodesByRight);
		const nodesByRightId = this.nodesByRight.reduce(
			(a, x) => {
				a[x.node.id] = x.node;
				return a;
			},
			{},
		);
		this.nodesByRight.filter((nodeI) => {
			const { node } = nodeI;
			const outputs = node.outputs;
			if (!outputs) {
				return false;
			}
			outputs.filter((output, slot) => {
				const links = output.links;
				if (!links) {
					return false;
				}

				const outputXYConnection = _getSlotPosition(node, slot, false);
				if (!outputXYConnection) {
					return false;
				}
				const outputNodeInfo = this.nodesById[node.id];
				let outputXY = Array.from(outputXYConnection);
				links.filter((linkId) => {
					outputXY[0] = outputNodeInfo.linesArea[2];
					const link = _getGraphLink(graphLinks, linkId);
					if (!link) {
						return false;
					}
					let targetNode = this.canvas.graph.getNodeById(link.target_id);
					if (!targetNode) {
						targetNode = nodesByRightId[link.target_id];
					}
					if (!targetNode) {
						return false;
					}

					const inputXYConnection = _getSlotPosition(targetNode, link.target_slot, true);
					if (!inputXYConnection) {
						return false;
					}
					const inputXY = Array.from(inputXYConnection);
					const nodeInfo = this.nodesById[targetNode.id];
					if (!nodeInfo) {
						return false;
					}
					inputXY[0] = nodeInfo.linesArea[0] - 1;

					const inputBlockedByNode =
						this.getNodeOnPos(inputXY);
					const outputBlockedByNode =
						this.getNodeOnPos(outputXY);

					let path = null;
					if (!inputBlockedByNode && !outputBlockedByNode) {
						const isBlocked = {};
						const pathFound = this.mapLink(outputXY, inputXY, isBlocked);

						if (pathFound) {
							while (pathFound.length >= 2) {
								const lastPathPoint1 = pathFound[pathFound.length - 1];
								const lastPathPoint2 = pathFound[pathFound.length - 2];
								if (lastPathPoint1[0] === lastPathPoint2[0]
									&& lastPathPoint1[1] === lastPathPoint2[1]
								) {
									pathFound.pop();
								} else {
									break;
								}
							}
						}
						if (!isBlocked.blocked && pathFound && pathFound.length > 2) {
							path = [outputXYConnection, ...pathFound, inputXYConnection];
							this.expandTargetNodeLinesArea(nodeInfo, path);
						}
					}
					if (!path) {
						path = [outputXYConnection, outputXY, inputXY, inputXYConnection];
					}
					this.expandSourceNodeLinesArea(nodeI, path);
					this.pathsByLinkId.set(linkId, path);
					this.pathsByLinkId.set(String(linkId), path);
					outputXY = [
						outputXY[0] + this.config.lineSpace,
						outputXY[1],
					];
					return false;
				});
				return false;
			});
			return false;
		});
	}

}

class TraceRoutes {
	constructor() {
		this.mapLinks = null;
		this.graph = null;
		this.maxDirectLineDistance = Number.MAX_SAFE_INTEGER;
		this.config = {
			lineSpace: Math.floor((_getLiteGraph()?.NODE_SLOT_HEIGHT ?? 20) / 2),
			nodeSpace: [-8, -4, 12, 4],
		};
	}

	recalcMapLinks() {
		const canvas = { graph: this.graph };
		this.mapLinks = new MapLinks(canvas, this.config);
		this.mapLinks.maxDirectLineDistance = this.maxDirectLineDistance;
		const nodesByExecution = _getRoutingNodes(this.graph);
		try {
			this.mapLinks.mapLinks(nodesByExecution);
		} catch (e) {
			console.error('mapLinks error', e);
		}
	}
}

function _getLiteGraph() {
	return globalThis.LiteGraph || globalThis.window?.LiteGraph;
}

function _getGraphLink(graphLinks, linkId) {
	return graphLinks?.[linkId] ?? graphLinks?.[String(linkId)] ?? graphLinks?.get?.(linkId) ?? graphLinks?.get?.(String(linkId));
}

function _appendUniqueNode(nodes, seen, node) {
	if (!node) {
		return;
	}

	const id = node.id ?? `${node.type ?? "node"}:${node.pos?.[0]},${node.pos?.[1]}`;
	if (seen.has(id)) {
		return;
	}

	seen.add(id);
	nodes.push(node);
}

function _getRoutingNodes(graph) {
	const nodes = [];
	const seen = new Set();

	let executionNodes = [];
	try {
		executionNodes = graph?.computeExecutionOrder?.() || [];
	} catch (e) {
		executionNodes = [];
	}

	executionNodes.forEach((node) => _appendUniqueNode(nodes, seen, node));
	(graph?._nodes || []).forEach((node) => _appendUniqueNode(nodes, seen, node));

	return nodes;
}

function _getNodeArea(node) {
	if (!node) {
		return null;
	}

	try {
		if (node.getBounding) {
			const barea = new Float32Array(4);
			node.getBounding(barea);
			return [
				barea[0],
				barea[1],
				barea[0] + barea[2],
				barea[1] + barea[3],
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

function _getSlotPosition(node, slot, isInput) {
	try {
		if (node.getSlotPosition) {
			return node.getSlotPosition(slot, isInput);
		}
		if (isInput && node.getInputPos) {
			return node.getInputPos(slot);
		}
		if (!isInput && node.getOutputPos) {
			return node.getOutputPos(slot);
		}
	} catch (e) {
	}

	if (!node.pos || !node.size) {
		return null;
	}

	const slotHeight = _getLiteGraph()?.NODE_SLOT_HEIGHT ?? 20;
	const y = node.pos[1] + ((slot ?? 0) + 0.5) * slotHeight;
	return isInput ? [node.pos[0], y] : [node.pos[0] + node.size[0], y];
}

function _drawTracePath(path2d, route, cornerRadius) {
	if (route.length <= 1) {
		return;
	}

	let isPrevDotRound = false;
	for (let p = 0; p < route.length; ++p) {
		const pos = route[p];

		if (p === 0) {
			path2d.moveTo(pos[0], pos[1]);
		}
		const prevPos = pos;
		const cornerPos = route[p + 1];
		const nextPos = route[p + 2];

		let drawn = false;
		if (nextPos) {
			const xDiffBefore = cornerPos[0] - prevPos[0];
			const yDiffBefore = cornerPos[1] - prevPos[1];
			const xDiffAfter = nextPos[0] - cornerPos[0];
			const yDiffAfter = nextPos[1] - cornerPos[1];
			const lenBefore = Math.sqrt((xDiffBefore ** 2) + (yDiffBefore ** 2));
			const lenAfter = Math.sqrt((xDiffAfter ** 2) + (yDiffAfter ** 2));
			const cross = (xDiffBefore * yDiffAfter) - (yDiffBefore * xDiffAfter);

			if (lenBefore > 0.001 && lenAfter > 0.001 && Math.abs(cross) > 0.001) {
				const radius = Math.min(cornerRadius, lenBefore * 0.5, lenAfter * 0.5);
				const beforePos = [
					cornerPos[0] - ((xDiffBefore / lenBefore) * radius),
					cornerPos[1] - ((yDiffBefore / lenBefore) * radius),
				];
				const afterPos = [
					cornerPos[0] + ((xDiffAfter / lenAfter) * radius),
					cornerPos[1] + ((yDiffAfter / lenAfter) * radius),
				];

				if (isPrevDotRound
					&& Math.abs(isPrevDotRound[0] - beforePos[0]) <= cornerRadius
					&& Math.abs(isPrevDotRound[1] - beforePos[1]) <= cornerRadius) {
				} else {
					path2d.lineTo(beforePos[0], beforePos[1]);
					path2d.quadraticCurveTo(cornerPos[0], cornerPos[1], afterPos[0], afterPos[1]);
				}
				isPrevDotRound = beforePos;
				drawn = true;
			}
		}
		if (p > 0 && !drawn) {
			if (!isPrevDotRound) {
				path2d.lineTo(pos[0], pos[1]);
			}
			isPrevDotRound = false;
		}
	}
}

function _centerOf(route, pos) {
	let best = -1;
	for (let i = 0; i < route.length - 1; i++) {
		const length = ((route[i + 1][0] - route[i][0]) ** 2) + ((route[i + 1][1] - route[i][1]) ** 2);
		if (length > best) {
			best = length;
			pos[0] = (route[i][0] + route[i + 1][0]) * 0.5;
			pos[1] = (route[i][1] + route[i + 1][1]) * 0.5;
			pos[2] = Math.atan2(route[i + 1][1] - route[i][1], route[i + 1][0] - route[i][0]);
		}
	}
}

function _drawFallback90Or45(path, start, end, pos) {
	const route = _path90Or45([start.x, start.y], [end.x, end.y]);
	_centerOf(route, pos);
	_drawTracePath(path, route, _traceRoutes.config.lineSpace);
}

function _samePoint(a, b) {
	return a && b && Math.abs(a[0] - b[0]) < 0.001 && Math.abs(a[1] - b[1]) < 0.001;
}

function _appendUniquePoint(route, point) {
	if (!_samePoint(route[route.length - 1], point)) {
		route.push(point);
	}
}

function _path90Or45(from, to) {
	if (_samePoint(from, to)) {
		return [from];
	}

	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const absDx = Math.abs(dx);
	const absDy = Math.abs(dy);

	if (dx === 0 || dy === 0 || Math.abs(absDx - absDy) < 0.001) {
		return [from, to];
	}

	let mid;
	if (absDx > absDy) {
		mid = [to[0] - (Math.sign(dx) * absDy), from[1]];
	} else {
		mid = [from[0], to[1] - (Math.sign(dy) * absDx)];
	}

	return [from, mid, to];
}

function _normalizeRoute90Or45(points) {
	if (points.length <= 1) {
		return points;
	}

	const route = [points[0]];
	for (let i = 0; i < points.length - 1; i++) {
		const segment = _path90Or45(points[i], points[i + 1]);
		for (const point of segment.slice(1)) {
			_appendUniquePoint(route, point);
		}
	}
	return route;
}

const _traceRoutes = new TraceRoutes();

let _lastGraph = null;
let _lastHash = null;

function _graphHash(graph) {
	if (!graph) {
		return "";
	}

	let hash = "";
	const nodes = graph._nodes || [];
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		hash += `${node.id}:${node.pos?.[0]},${node.pos?.[1]},${node.size?.[0]},${node.size?.[1]};`;
	}
	const links = graph.links || {};
	const linkIds = Object.keys(links).sort();
	for (let i = 0; i < linkIds.length; i++) {
		const link = links[linkIds[i]];
		hash += `link:${linkIds[i]},${link?.origin_id},${link?.origin_slot},${link?.target_id},${link?.target_slot};`;
	}
	return hash;
}

function _ensureTraceRoutes(graph) {
	if (!graph) {
		return;
	}

	_traceRoutes.graph = graph;
	const hash = _graphHash(graph);
	if (_lastGraph === graph && _lastHash === hash && _traceRoutes.mapLinks) {
		return;
	}

	_lastGraph = graph;
	_lastHash = hash;
	_traceRoutes.recalcMapLinks();
}

export const traceRenderer = {
	_linkId: null,

	prepare(linkId, graph, isStale) {
		this._linkId = linkId;
		if (isStale) {
			_lastHash = null;
		}
		_ensureTraceRoutes(graph);
	},

	draw(path, start, end, slot_id, start_node, end_node, radius, offset, curvature, pos, is_dragging) {
		if (is_dragging || !start_node || !end_node) {
			_drawFallback90Or45(path, start, end, pos);
			return;
		}

		const route = this._linkId != null
			? _traceRoutes.mapLinks?.pathsByLinkId.get(this._linkId)
			: null;

		if (!route) {
			_drawFallback90Or45(path, start, end, pos);
			return;
		}

		const fullRoute = _normalizeRoute90Or45([[start.x, start.y], ...route.slice(1, -1), [end.x, end.y]]);
		_centerOf(fullRoute, pos);
		_drawTracePath(path, fullRoute, _traceRoutes.config.lineSpace);
	},
};

