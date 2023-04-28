import React from "react";
import { RecoilRoot } from "recoil";
import RecoilNexus from "recoil-nexus";
import App from "./App";
import "./index.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <RecoilRoot>
            <RecoilNexus />
            <App />
        </RecoilRoot>
    </React.StrictMode>
);
