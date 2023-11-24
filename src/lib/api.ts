import { hostState } from "lib/atoms";
import { getRecoil } from "recoil-nexus";
import { ServerConfiguration } from "../types";

/**
 * Helper to make GET requests to the API.
 *
 * @param path
 * @returns data response as json
 */
async function request(path: string, init: RequestInit = {}) {
    let host = getRecoil(hostState)?.host;
    if (!host) {
        throw new Error("No host selected");
    }

    if (path.startsWith("http")) {
        host = "";
    }

    if (host.endsWith("/")) {
        path = path.substring(1);
    }

    let response: Response;

    try {
        response = await fetch(`${host}${path}`, {
            ...init,
            mode: "cors",
        });
    } catch (e) {
        throw new Error(`Connection refused. (${e})`);
    }

    if (!response) {
        throw new Error("Invalid response.");
    } else if (!response.ok) {
        throw new Error(`Request failed (status: ${response.status})`);
    } else if (!response.body) {
        throw new Error("Empty response.");
    }

    return response.json();
}

export const fetchHosts = async () => {
    const response = await fetch(import.meta.env.VITE_REACT_APP_SERVERS_URL || "http://localhost:7778/api/servers");
    return response.json();
};

export const isValidHost = async (url: string) => {
    if (!url) {
        return false;
    }

    try {
        const response = await fetch(new URL("/api/v0/server", url).href);
        const configuration = await response.json() as ServerConfiguration;

        return configuration.guestLoginEnabled;
    } catch {
        return false;
    }
};

export const fetchOrganizations = () => {
    return request(`/api/v0/organizations`, { method: "GET" });
};

export const fetchProjects = () => {
    return request(`/api/v0/projects`, { method: "GET" });
};

export const fetchProjectData = (id: string) => {
    return request(`/api/v0/projects/${id}`, { method: "GET" });
};

export const fetchWorkspaces = () => {
    return request(`/api/v0/workspaces`, { method: "GET" });
};

export const fetchSlide = (id: string) => {
    return request(`/api/v0/slides/${id}`, { method: "GET" });
};

export const fetchSlideOmero = (id: string) => {
    return request(`https://idr.openmicroscopy.org/iviewer/image_data/${id}/`);
};
