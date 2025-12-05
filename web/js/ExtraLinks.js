import {app} from "../../../scripts/app.js"

const LinkRenderers = {
    curved: {
        draw: function(path, start, end, slot_id, start_node, end_node, radius, offset, curvature, pos, is_dragging) {

            const outputs = start_node?.outputs.length ?? 1;

            const x0 = start.x;
            const y1 = start.y;
            const x2 = end.x;
            const y2 = end.y;

            const dx = x2 - x0;
            const dy = y2 - y1;

            const dirX = Math.sign(dx);
            const dirY = Math.sign(dy);

            const offsetX = Math.max((offset * (outputs > 1 ? Math.log(outputs) : 1) - slot_id * curvature) * dirX, 0);
            const oX = Math.min(offsetX, (dx * 0.5))
            const x1 = x0 + oX;

            const r = Math.min(radius, Math.abs(dx * 0.5), Math.abs(dy * 0.5), Math.abs(x0 - x1));

            path.moveTo(x0, y1);

            if (dx > offset) {
                path.lineTo(x1 - r * dirX, y1);
                path.arcTo(x1, y1, x1, y1 + r * dirY, r);
                path.lineTo(x1, y2 - r * dirY);
                path.arcTo(x1, y2, x1 + r * dirX, y2, r);
                path.lineTo(x2, y2);

                if ( Math.abs(x2 - x1) > Math.abs(y2 - y1) ) {
                    pos[0] = (x2 + x1) * 0.5;
                    pos[1] = y2;
                    pos[2] = Math.atan2(0, x2 - x1)
                } else {
                    pos[0] = x1;
                    pos[1] = (y2 + y1) * 0.5;
                    pos[2] = Math.atan2(y2 - y1, 0)
                }
            } else {
                if (is_dragging && !start_node) {
                    path.lineTo(x1 - r * dirX, y1);
                    path.arcTo(x1, y1, x1, y1 + r * dirY, r);
                    path.lineTo(x1, y2 - r * dirY);
                    path.arcTo(x1, y2, x1 + r * dirX, y2, r);
                    path.lineTo(x2, y2);
                    return;
                }
                const sourceBottom = start_node.pos[1] + start_node.size[1];
                const sourceLeft = (start_node.pos[1] + start_node.size[1] < y2) ? start_node.pos[0] + start_node.size[0] : start_node.pos[0] + 10;

                const trayY = sourceBottom + ((slot_id + 1) * offset / 2);

                const turnX1 = x0 + offset;
                let turnX2 = x2 - offset;

                if (x2 > sourceLeft) {
                    turnX2 = sourceLeft - offset;
                }

                path.arcTo(turnX1, y1, turnX1, trayY, r);
                path.arcTo(turnX1, trayY, turnX2, trayY, r);
                path.arcTo(turnX2, trayY, turnX2, y2, r);
                path.arcTo(turnX2, y2, x2, y2, r);
                path.lineTo(x2, y2);

                pos[0] = (x2 > sourceLeft) ? (turnX2 + turnX1) / 2 : (x0 + x2) / 2;
                pos[1] = trayY;
                pos[2] = (turnX2 < turnX1) ? Math.PI : 0;
            }
        }
    },
    manhattan: {
        draw: function(path, start, end, slot_id, start_node, end_node, radius, offset, curvature, pos, is_dragging) {

            const x0 = start.x;
            const y1 = start.y;
            const x2 = end.x;
            const y2 = end.y;

            const dx = x2 - x0;
            const dy = y2 - y1;

            const outputs = start_node?.outputs.length ?? 1;
            const dirX = Math.sign(dx);
            const limitedOffset = offset * (outputs > 1 ? Math.log(outputs) : 1);
            const fanOffset = Math.max((limitedOffset - slot_id * curvature) * dirX, 0);
            const r = Math.min(radius, Math.abs(dx) * 0.5, Math.abs(dy) * 0.5);

            path.moveTo(x0, y1);

            if (dx > offset) {
                const oX = Math.min(fanOffset, (dx * 0.5));
                const midX = (x2 + (x0 + oX)) * 0.5;

                path.arcTo(midX, y1, midX, y2, r);
                path.arcTo(midX, y2, x2, y2, r);
                path.lineTo(x2, y2);

                pos[0] = midX;
                pos[1] = (y1 + y2) * 0.5;
                pos[2] = Math.atan2(dy, (Math.abs(dy) < radius * 2) ? (Math.PI + radius) * 0.5 : 0);
            } else {
                if (is_dragging && !start_node) {
                    const midX = (x0 + x2) * 0.5;

                    path.arcTo(midX, y1, midX, y2, r);
                    path.arcTo(midX, y2, x2, y2, r);
                    path.lineTo(x2, y2);
                    return;
                }

                const sourceBottom = start_node.pos[1] + start_node.size[1];
                const sourceLeft = (start_node.pos[1] + start_node.size[1] < y2) ? start_node.pos[0] + start_node.size[0] : start_node.pos[0] + 10;

                const trayY = sourceBottom + ((slot_id + 1) * offset / 2);

                const turnX1 = x0 + offset;
                let turnX2 = x2 - offset;

                if (x2 > sourceLeft) {
                    turnX2 = sourceLeft - offset;
                }

                path.arcTo(turnX1, y1, turnX1, trayY, r);
                path.arcTo(turnX1, trayY, turnX2, trayY, r);
                path.arcTo(turnX2, trayY, turnX2, y2, r);
                path.arcTo(turnX2, y2, x2, y2, r);
                path.lineTo(x2, y2);

                pos[0] = (x2 > sourceLeft) ? (turnX2 + turnX1) / 2 : (x0 + x2) / 2;
                pos[1] = trayY;
                pos[2] = (turnX2 < turnX1) ? Math.PI : 0;
            }
        }
    },
    subway: {
        draw: function(path, start, end, slot_id, start_node, end_node, radius, offset, curvature, pos, is_dragging) {
            const x0 = start.x;
            const y0 = start.y;
            const x2 = end.x;
            const y2 = end.y;

            const dx = x2 - x0;
            const dy = y2 - y0;

            const r = Math.min(radius, offset, Math.abs(dx), Math.abs(dy));

            const midX = (x0 + x2) * 0.5;
            const hspace = (dx * 0.5);
            const vspace = Math.abs(dy) * 0.5;

            const diagDist = Math.max(0, Math.min(vspace, hspace));

            const c1 = midX - diagDist;
            const c2 = midX + diagDist;

            const turnX1 = x0 + offset;

            path.moveTo(x0, y0);

            if (dx > offset) {
                path.arcTo(c1, y0, c2, y2, r);
                path.arcTo(c2, y2, x2, y2, r);
                path.lineTo(x2, y2);

                pos[0] = midX;
                pos[1] = y0 + (dy * 0.5);
                pos[2] = Math.atan2(y2 - y0, (Math.abs(dy) < r * 2) ? (Math.PI + c2 - c1) : c2 - c1);
            } else {

                if (is_dragging && !start_node) {

                    path.arcTo(turnX1, y0, turnX1, y2, r);
                    path.arcTo(turnX1, y2, x2, y2, r);
                    path.lineTo(x2, y2);

                    pos[0] = midX;
                    pos[1] = (y0 + y2) * 0.5;
                    pos[2] = Math.atan2(dy, dx);
                    return;
                }

                const sourceBottom = start_node.pos[1] + start_node.size[1];
                const sourceLeft = (start_node.pos[1] + start_node.size[1] < y2) ? start_node.pos[0] + start_node.size[0]: start_node.pos[0] + 10;

                const trayY = sourceBottom + ((slot_id + 1) * offset / 2);
                let turnX2 = x2 - offset;

                if (Math.floor(x2) > Math.floor(sourceLeft)) {
                    turnX2 = sourceLeft - offset;
                }

                path.arcTo(turnX1, y0, turnX1, trayY, r);
                path.arcTo(turnX1, trayY, turnX2, trayY, r);
                path.arcTo(turnX2, trayY, turnX2, y2, r);
                path.arcTo(turnX2, y2, x2, y2, r);
                path.lineTo(x2, y2);

                pos[0] = (x2 > sourceLeft) ? (turnX2 + x0 + offset) / 2 : (x0 + x2) / 2;
                pos[1] = trayY;
                pos[2] = (turnX2 < turnX1) ? Math.PI : 0;
            }
        }
    },
};

export class ExtraLinks {

    init() {
        this.waitForCanvas().then(() => {
            this.patchDrawLinkPath();
            console.log("✅ Extra Links Loaded");
        });
    }

    async waitForCanvas() {
        while (!app.canvas ||
               !app.canvas.linkRenderer ||
               !app.canvas.linkRenderer.pathRenderer ||
               !app.canvas.linkRenderer.pathRenderer.drawLink) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }

    patchDrawLinkPath() {

        const pathRenderer = app.canvas.linkRenderer.pathRenderer;
        const pathRendererConstructor = pathRenderer.constructor;
        const _originalDrawLinkPath = pathRenderer.drawLinkPath;
        const _originalCalculateCenterPoint = pathRenderer.calculateCenterPoint;

        pathRendererConstructor.prototype.drawLinkPath = function drawLinkPath(ctx, path, link2, context, lineWidth, color2) {

            if (!app.extensionManager.setting.get("Extra Links.General.Enable")) {
                pathRendererConstructor.prototype.drawLinkPath = _originalDrawLinkPath;
                pathRendererConstructor.prototype.calculateCenterPoint = _originalCalculateCenterPoint;
                return;
            }

            const RADIUS    = app.extensionManager.setting.get("Extra Links.Shapes.Radius") ?? 10;
            const OFFSET    = app.extensionManager.setting.get("Extra Links.Shapes.Offset") ?? 25;
            const CURVATURE = app.extensionManager.setting.get("Extra Links.Shapes.Curvature") ?? 5;
            const SHAPE = app.extensionManager.setting.get("Extra Links.General.Shape") ?? "curved";

            const full_link_object = app.graph.links[link2?.id];
            const outputId = full_link_object?.origin_slot ?? 0;

            const start_node = app.graph.getNodeById(full_link_object?.origin_id);
            const end_node = app.graph.getNodeById(full_link_object?.target_id);

            const is_dragging = (link2?.id == 'temp') || !app.graph.links[link2.id];

            const startPos = link2.startPoint;
            const endPos = link2.endPoint;

            ctx.lineJoin = "round";
            ctx.lineWidth = lineWidth;
            ctx.fillStyle = ctx.strokeStyle = color2;

            const pos = [0, 0, 0];

            const renderer = LinkRenderers[SHAPE] || LinkRenderers.curved;

            renderer.draw(
                path,
                startPos,
                endPos,
                outputId,
                start_node,
                end_node,
                RADIUS,
                OFFSET,
                CURVATURE,
                pos,
                is_dragging
            );

            ctx.stroke(path);

            pathRendererConstructor.prototype.calculateCenterPoint = (...args) => {
                link2.centerPos = {x: pos[0], y: pos[1]}
                if (context.style.centerMarkerShape === 'arrow') {
                    link2.centerAngle = pos[2];
                }

                return link2.centerPos
            }
        }
    }
};