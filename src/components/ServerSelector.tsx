import { fetchOrganizations, fetchWorkspaces, isValidHost } from "lib/api";
import Constants from "lib/constants";
import { setValue } from "lib/localStorage";
import { useState } from "react";
import { toast } from "react-toastify";
import "styles/Buttons.css";
import { EduServer } from "types";
import isURL from "validator/lib/isURL";
import { LoadingIcon } from "./icons/LoadingIcon";
import Select from "react-select";
import { useStore } from "../lib/StateStore";

const CUSTOM_HOST_ID = "custom-host";

type Props = {
    servers: EduServer[];
}

export default function ServerSelector({ servers }: Props) {
    const [selectedServer, setSelectedServer] = useState<EduServer | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [ server, setOrganization, initializeServer ] = useStore(state => [
      state.server, state.setOrganization, state.initializeServer
    ])

    const serverUrl = selectedServer?.host;

    const isCustomHost = selectedServer?.id === CUSTOM_HOST_ID;
    const isValidUrl = serverUrl !== undefined && serverUrl.length >= 0 && isURL(serverUrl, { require_tld: false })

    addCustomHost(servers);

    function onCustomHostURLChange(url: string) {
        if (!selectedServer) return;

        setSelectedServer({
            ...selectedServer,
            host: url
        });
    }

    async function SavePreferences() {
        setLoading(true);

        try {
            const valid = selectedServer ? await isValidHost(selectedServer.host) : false;

            if (valid && selectedServer) {
                setOrganization(null);

                const [ organizations, workspaces ] = await Promise.all([
                  fetchOrganizations(selectedServer.host),
                  fetchWorkspaces(selectedServer.host)
                ]);

                initializeServer(selectedServer, organizations, workspaces);

                setValue(Constants.LOCALSTORAGE_HOST_KEY, selectedServer);
            } else {
                toast.error("Please check your internet connection and that you're connecting to the a valid server.");
            }
        } catch (error) {
            initializeServer(null, [], []);

            toast.error("Error while loading, please retry ...");
            console.error("Error while loading organizations / workspaces", error);
        } finally {
            setLoading(false);
        }
    }

    function addCustomHost(hosts: EduServer[]) {
        if (hosts[hosts.length - 1]?.id !== CUSTOM_HOST_ID) {
            hosts.push({ id: CUSTOM_HOST_ID, name: "Custom host", "host": "", img: "" });
        }
    }

    if (server) {
        return (
            <div className="flex gap-2">
                <div className="flex-grow button-like text-center">
                    {server.name}
                </div>

                <button
                    className="bg-white button button-red"
                    onClick={() => {
                        initializeServer(null, [], []);
                        setValue(Constants.LOCALSTORAGE_HOST_KEY, null);
                    }}
                >
                    &#10005;
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {servers.length > 0 && (
                <Select
                    placeholder="Select host"
                    value={selectedServer}
                    options={servers}
                    isSearchable={false}
                    getOptionLabel={host => host.name}
                    getOptionValue={host => host.id}
                    onChange={host => setSelectedServer(host)}
                    menuPortalTarget={document.querySelector("body")}
                />
            )}

            { isCustomHost && (
                <form>
                    <input
                        type="text"
                        value={serverUrl}
                        onChange={event => onCustomHostURLChange(event.currentTarget.value)}
                        className="w-full border border-gray-300 rounded-sm text-black p-1 my-2"
                    />

                    <p className={`font-bold text-center ${isValidUrl ? "text-green-500" : "text-red-500"}`}>
                        {isValidUrl ? "Valid URL" : "Invalid URL"}
                    </p>
                </form>
            )}

            <button
                className="button w-full mt-4"
                type="button"
                disabled={loading || !selectedServer || !isValidUrl}
                onClick={() => SavePreferences()}
            >
                {loading ? <LoadingIcon className="m-auto" stroke={"#fff"} fill={"#fff"} width={"32px"} height={"32px"} /> : "Save preferences"}
            </button>
        </div>
    );
}
