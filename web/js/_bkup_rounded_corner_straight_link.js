// import {app} from "../../../scripts/app.js"

// console.log("INIT RCL")

// const LinkRenderers = {
//     curved: {
//         draw: function(ctx, start, end, slot_id, radius, offset, curvature, color, width) {
//             const x0 = start[0];
//             const y1 = start[1];
//             const x2 = end[0];
//             const y2 = end[1];

//             const dx = x2 - x0;
//             const dy = y2 - y1;

//             const dirX = Math.sign(dx);
//             const dirY = Math.sign(dy);

//             const offsetX = Math.max((slot_id * curvature + offset) * dirX, 0);
//             const oX = Math.min(offsetX, (dx * 0.5))
//             const x1 = x0 + oX;

//             const r = Math.min(radius, Math.abs(dx * 0.5), Math.abs(dy * 0.5));

//             ctx.save();
//             ctx.lineWidth = width;
//             ctx.strokeStyle = color;
//             ctx.beginPath();

//             ctx.moveTo(x0, y1);
//             ctx.lineTo(x1 - r * dirX, y1);
//             ctx.arcTo(x1, y1, x1, y1 + r * dirY, r);
//             ctx.lineTo(x1, y2 - r * dirY);
//             ctx.arcTo(x1, y2, x1 + r * dirX, y2, r);
//             ctx.lineTo(x2, y2);

//             ctx.stroke();
//             ctx.restore();
//         }
//     },

//     rounded: {
//         draw: function(ctx, start, end, radius, color, width) {
//             const x0 = start[0];
//             const y1 = start[1];
//             const x2 = end[0];
//             const y2 = end[1];

//             const dx = x2 - x0;
//             const dy = y2 - y1;

//             const dirX = Math.sign(dx);
//             const dirY = Math.sign(dy);

//             const r = Math.min(radius, Math.abs(dx * 0.5), Math.abs(dy * 0.5));

//             ctx.save();
//             ctx.lineWidth = width;
//             ctx.strokeStyle = color;
//             ctx.beginPath();

//             ctx.moveTo(x0, y1);
//             ctx.lineTo(midX - r * dirX, y1);
//             ctx.arcTo(midX, y1, midX, y1 + r * dirY, r);
//             ctx.lineTo(midX, y2 - r * dirY);
//             ctx.arcTo(midX, y2, midX + r * dirX, y2, r);
//             ctx.lineTo(x2, y2);

//             ctx.stroke();
//             ctx.restore();
//         }
//     }
// }

// class RoundedCornerLines {
//     #visibleReroutes = /* @__PURE__ */ new Set();
//     #snapToGrid;
//     init() {
//         const RADIUS = 20;
//         const OFFSET = 25;
//         const CURVATURE = 5;
//         const oldDrawConnections = LGraphCanvas.prototype.drawConnections;
//         LGraphCanvas.prototype.drawConnections = function drawConnections(ctx, ) {
//             this.renderedPaths.clear();
//             const { graph } = this;

//             const nodes = graph._nodes;
//             for (const node22 of nodes) {
//               const { inputs } = node22;
//               if (!inputs?.length) continue;
//               for (const [i2, input] of inputs.entries()) {
//                 if (!input || input.link == null) continue;
//                 const link_id = input.link;
//                 const link2 = graph._links.get(link_id);
//                 const linkColour = link2 != null && this.highlighted_links[link2.id] ? "#FFF" : link2?.color || link2?.type != null && LGraphCanvas.link_type_colors[link2.type] || this.default_link_color;
//                 if (!link2) continue;
//                 const endPos = node22.getInputPos(i2);
//                 const start_node = graph.getNodeById(link2.origin_id);
//                 if (start_node == null) continue;
//                 const outputId = link2.origin_slot;
//                 const startPos = outputId === -1 ? [start_node.pos[0] + 10, start_node.pos[1] + 10] : start_node.getOutputPos(outputId);
//                 const output = start_node.outputs[outputId];
//                 if (!output) continue;

//                 // if (this.linkConnector.isConnecting) {
//                 //     const { renderLinks } = this.linkConnector;
//                 //     for (const renderLink of renderLinks) {
//                 //         const { fromPos: pos } = renderLink;
//                 //         const hpos = this._highlighted_links ?? this.graph_mouse;

//                 //         LinkRenderers["curved"].draw(ctx, pos, hpos, outputId, RADIUS, OFFSET, CURVATURE, "#FFF", this.connections_width*2);
//                 //     }

//                 // }

//                 LinkRenderers["curved"].draw(ctx, startPos, endPos, outputId, RADIUS, OFFSET, CURVATURE, linkColour, this.connections_width);

//                 // 2) *right here*—draw & hook up the midpoint marker
//                 LiteGraph.LGraphCanvas
//                     .prototype
//                     .drawLinkPoints
//                     .call(this, ctx, link2, startPos, endPos);
//         }
//     }
// }

// const rcl = new RoundedCornerLines();
// rcl.init();