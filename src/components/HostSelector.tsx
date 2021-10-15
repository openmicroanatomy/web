import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import validator from "validator";
import { fetchHosts } from "../lib/api";
import { hostState } from "../lib/atoms";
import { setValue } from "../lib/localStorage";
import "../styles/Buttons.css";
import { Host } from "../types";

interface ChosenHost {
    private: boolean;
    host: Host | null;
}

function HostSelector() {
    const [hosts, setHosts] = useState<Host[]>([]);
    const defaultHost = { private: false, host: null };
    const [chosenHost, setChosenHost] = useState<ChosenHost>(defaultHost);
    const [urlError, setUrlError] = useState(false);
    const setHost = useSetRecoilState(hostState);

    const onPublicHostChange = (hostId: string) => {
        const newHost = hosts.find((host: Host) => host.id === hostId);
        if (newHost) {
            setChosenHost({ private: false, host: newHost });
        } else {
            setChosenHost(defaultHost);
        }
    };

    const onPrivateHostChange = (url: string) => {
        if (url.length === 0) {
            setUrlError(false);
            setChosenHost(defaultHost);
        } else if (validator.isURL(url)) {
            setUrlError(false);
            setChosenHost({ private: true, host: { id: "custom-host", name: "Custom host", host: url, img: "" } });
        } else {
            setUrlError(true);
            setChosenHost(defaultHost);
        }
    };

    useEffect(() => {
        const apiHelper = async () => {
            try {
                const result = await fetchHosts();
                setHosts(result);
            } catch (e) {
                if (e instanceof Error) {
                    toast.error(e.message);
                }
            }
        };

        apiHelper();
    }, []);

    if (hosts.length === 0) {
        return <p>Unexpected error with HostSelector</p>;
    }

    return (
        <div id="HostSelector">
            <p className="text-xl">Choose a host</p>
            <select disabled={chosenHost.private} name="host" onChange={(e) => onPublicHostChange(e.target.value)}>
                <option>Select a public host</option>

                {hosts.map((host: Host) => (
                    <option value={host.id} key={host.id}>
                        {host.name}
                    </option>
                ))}
            </select>
            <p className="text-xl font-bold my-4">OR</p>
            <form>
                <input
                    type="text"
                    placeholder="Enter private a host"
                    onChange={(e) => onPrivateHostChange(e.target.value)}
                />
            </form>
            <p className={urlError ? "visible" : "invisible"}>Not a valid URL.</p>
            <button
                className="button"
                type="button"
                disabled={!chosenHost.host || (!chosenHost.private && !chosenHost.host && !urlError)}
                onClick={() => {
                    setHost(chosenHost.host);
                    setValue("qupath_host", chosenHost.host);
                }}
            >
                Save preferences
            </button>
        </div>
    );
}

export default HostSelector;
