import { EduOrganization, EduProject, EduServerConfiguration, EduWorkspace, Project } from "../types";
import { SlideRepository } from "./EduViewer";
import { useStore } from "./StateStore";

/**
 * Helper to make GET requests to the API.
 *
 * @param path
 * @param init
 * @param hostOverride
 * @returns data response as json
 */
async function request(path: string, init: RequestInit = {}, hostOverride?: string) {
    let host = hostOverride ? hostOverride : useStore.getState().server?.host;

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

export async function fetchServers() {
    const response = await fetch(import.meta.env.VITE_REACT_APP_SERVERS_URL || "https://qupath.oulu.fi/servers.json");
    return response.json();
}

export const isValidHost = async (url: string) => {
    if (!url) {
        return false;
    }

    try {
        const response = await fetch(new URL("/api/v0/server", url).href);
        const configuration = await response.json() as EduServerConfiguration;

        return configuration.guestLoginEnabled;
    } catch {
        return false;
    }
};

export function fetchOrganizations(host?: string): Promise<EduOrganization[]> {
    return request(`/api/v0/organizations`, { method: "GET" }, host);
}

export function fetchProjects(): Promise<EduProject[]> {
    return request(`/api/v0/projects`, { method: "GET" });
}

export function fetchProject(id: string): Promise<Project> {
    return request(`/api/v0/projects/${id}`, { method: "GET" });
}

export function fetchWorkspaces(host?: string): Promise<EduWorkspace[]> {
    return request(`/api/v0/workspaces`, { method: "GET" }, host);
}

export function fetchSlideProperties(id: string, slideRepository: SlideRepository) {
    if (slideRepository === SlideRepository.OMERO) {
        return request(`https://idr.openmicroscopy.org/iviewer/image_data/${id}/`);
    } else if (slideRepository === SlideRepository.OpenMicroanatomy) {
        return request(`/api/v0/slides/${id}`, { method: "GET" });
    } else {
        throw new Error(`Unknown / unsupported Slide Repository: ${slideRepository}`);
    }
}
