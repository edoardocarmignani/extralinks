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
                const x = document.createElement('span')
                const a = document.createElement('a')
                a.innerText = "Report issues or request features"
                a.href = "https://github.com/edoardocarmignani/extralinks/issues"
                a.target = "_blank"
                a.style.paddingRight = "12px"
                x.appendChild(a)
                return x
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
