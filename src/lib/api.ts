/**
 * Returns the API URL with the specified path.
 *
 * @param path
 * @returns API URL as string
 */
export function getApiUrl(path = "") {
    return `${process.env.REACT_APP_API_URL || "http://localhost:7777"}${path}`;
}

/**
 * Helper to make GET requests to the API.
 *
 * @param path
 * @returns data response as json
 */
export async function fetchApi(path: string) {
    const requestUrl = getApiUrl(path);
    const response = await fetch(requestUrl);
    const data = await response.json();
    return data;
}
