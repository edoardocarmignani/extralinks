import {app} from "../../../scripts/app.js"
import { ExtraLinks } from "./ExtraLinks.js"

app.registerExtension({
    name: "Extra Links",
    settings: [
        {
            id: "Extra Links.Offset",
            name: "Offset",
            type: "slider",
            defaultValue: 25,
            category: ["Extra Links", "Curved", "Offset"]
        },
        {
            id: "Extra Links.Curvature",
            name: "Curvature",
            type: "slider",
            defaultValue: 5,
            category: ["Extra Links", "Curved", "Curvature"]
        },
        {
            id: "Extra Links.Radius",
            name: "Radius",
            type: "slider",
            defaultValue: 10,
            category: ["Extra Links", "Curved", "Radius"]
        },
        {
            id: "Extra Links.Extra Links",
            name: "Version 0.0.1",
            type: () => {
                const container = document.createElement("span");
                const btn = document.createElement("button");
                btn.innerText = "Issues / Features";
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
            defaultValue: 10,
            category: ["Extra Links", "Extra Links", "Version"]
        },
        {
            id: "Extra Links.Enable",
            name: "Enable",
            type: "boolean",
            defaultValue: true,
            category: ["Extra Links", "Extra Links", "Enable"],
            onChange: (...args) => {
                const exl = new ExtraLinks();
                exl.init();
                app.graph?.change.apply(app.graph, args);
            }
        },
    ]
});
