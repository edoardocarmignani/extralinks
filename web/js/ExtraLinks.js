import {app} from "../../../scripts/app.js"

const LinkRenderers = {
    curved: {
        draw: function(path, start, end, slot_id, outputs, radius, offset, curvature, color, width, pos) {
            const x0 = start[0];
            const y1 = start[1];
            const x2 = end[0];
            const y2 = end[1];

            const dx = x2 - x0;
            const dy = y2 - y1;

            const dirX = Math.sign(dx);
            const dirY = Math.sign(dy);

            const offsetX = Math.max((offset * (outputs > 1 ? Math.log(outputs) : 1) - slot_id * curvature) * dirX, 0);
            const oX = Math.min(offsetX, (dx * 0.5))
            const x1 = x0 + oX;

            const r = Math.min(radius, Math.abs(dx * 0.5), Math.abs(dy * 0.5));

            path.moveTo(x0, y1);
            path.lineTo(x1 - r * dirX, y1);
            path.arcTo(x1, y1, x1, y1 + r * dirY, r);
            path.lineTo(x1, y2 - r * dirY);
            path.arcTo(x1, y2, x1 + r * dirX, y2, r);
            path.lineTo(x2, y2);

            if ( Math.abs(x2 - x1) > Math.abs(y2 - y1) ) {
                pos[0] = (x2 + x1) * 0.5;
                pos[1] = y2;
            } else {
                pos[0] = x1;
                pos[1] = (y2 + y1) * 0.5;
            }
        }
    }
};

export class ExtraLinks {
    init() {

        const RADIUS    = 10;
        const OFFSET    = 25;
        const CURVATURE = 5;

        const _oldRenderLink = LGraphCanvas.prototype.renderLink;

        LGraphCanvas.prototype.renderLink = function renderLink(ctx, a2, b2, link2, skip_border, flow, color2, start_dir, end_dir, {
            startControl,
            endControl,
            reroute,
            num_sublines = 1,
            disabled = false
        } = {}) {

            if (!app.extensionManager.setting.get("Extra Links.Enable")) {
                LGraphCanvas.prototype.renderLink = _oldRenderLink;
                return;
            };
            const linkColour = link2 != null && this.highlighted_links[link2.id] ? "#FFF" : color2 || link2?.color || link2?.type != null && LGraphCanvas.link_type_colors[link2.type] || this.default_link_color;
            ctx.lineJoin = "round";
            num_sublines ||= 1;
            if (num_sublines > 1) ctx.lineWidth = 0.5;
            const linkSegment = reroute ?? link2;
            const path = new Path2D();
            if (linkSegment) linkSegment.path = path;
            const pos = linkSegment?._pos ?? [0, 0];
            const outputId = link2?.origin_slot ?? 0;
            const start_node = this.graph.getNodeById(link2?.origin_id);
            const total_outputs = start_node?.outputs.length ?? 1;
            for (let i2 = 0; i2 < num_sublines; i2++) {

                LinkRenderers["curved"].draw(path, a2, b2, outputId, total_outputs, RADIUS, OFFSET, CURVATURE, linkColour,
                    this.connections_width, pos);

            }

            ctx.lineWidth = this.connections_width;
            ctx.fillStyle = ctx.strokeStyle = linkColour;
            ctx.stroke(path);

            ctx.beginPath()
            ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};


