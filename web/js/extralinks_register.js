import {app} from "../../../scripts/app.js"
import { ExtraLinks } from "./ExtraLinks.js"

app.registerExtension({
    name: "Extra Links",
    settings: [
        {
            id: "Extra Links.Shapes.Offset",
            name: "Offset",
            type: "slider",
            defaultValue: 25,
            category: ["Extra Links", "Shapes", "Offset"],
            onChange: (...args) => {
                const exl = new ExtraLinks();
                exl.init();
                app.graph?.change.apply(app.graph, args);
            }
        },
        {
            id: "Extra Links.Shapes.Curvature",
            name: "Curvature",
            type: "slider",
            defaultValue: 5,
            category: ["Extra Links", "Shapes", "Curvature"],
            attrs: {
                min: 0,
                max: 10,
                step: 0.5,
            },
            onChange: (...args) => {
                const exl = new ExtraLinks();
                exl.init();
                app.graph?.change.apply(app.graph, args);
            }
        },
        {
            id: "Extra Links.Shapes.Radius",
            name: "Radius",
            type: "slider",
            defaultValue: 10,
            category: ["Extra Links", "Shapes", "Radius"],
            onChange: (...args) => {
                const exl = new ExtraLinks();
                exl.init();
                app.graph?.change.apply(app.graph, args);
            }
        },
        {
            id: "Extra Links.ExtraLinks",
            name: "Version 1.1.1",
            type: () => {
                const container = document.createElement("span");
                const btn = document.createElement("button");
                btn.innerText = "Bug / Features";
                btn.style.padding = "6px 12px";
                btn.style.cursor = "pointer";
                btn.style.backgroundColor = "#007bff";
                btn.style.color = "#f0f0f0";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.boxShadow = "0 2px 2px rgba(0,0,0,0.2)";
                btn.style.fontWeight = "bold";
                btn.style.fontFamily = "Helvetica, sans-serif"
                btn.addEventListener("click", () => {
                    window.open(
                    "https://github.com/edoardocarmignani/extralinks/issues",
                    "_blank",
                    "noopener"
                    );
                });

                container.appendChild(btn);
                return container;
            },
            category: ["Extra Links", "🔗 Extra Links", "Version"]
        },
        {
            id: "Extra Links.General.Shape",
            name: "Shape",
            type: "combo",
            options: [{text: "Curved", value: "curved"},
                      {text: "Manhattan", value: "manhattan"},
                      {text: "Subway", value: "subway"}],
            defaultValue: "curved",
            category: ["Extra Links", "General", "Shape"],
            onChange: (val) => {
                const exl = new ExtraLinks();
                exl.init();
                app.graph?.change.apply(app.graph);
            }
        },
        {
            id: "Extra Links.General.Enable",
            name: "Enable",
            type: "boolean",
            defaultValue: true,
            category: ["Extra Links", "General", "Enable"],
            onChange: (...args) => {
                const exl = new ExtraLinks();
                exl.init();
                app.graph?.change.apply(app.graph, args);
            }
        },
    ]
});
