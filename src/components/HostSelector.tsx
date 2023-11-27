import { isValidHost } from "lib/api";
import { hostState } from "lib/atoms";
import Constants from "lib/constants";
import { setValue } from "lib/localStorage";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import "styles/Buttons.css";
import { EduHost } from "types";
import isURL from "validator/lib/isURL";
import { LoadingIcon } from "./icons/LoadingIcon";
import Select from "react-select";

const CUSTOM_HOST_ID = "custom-host";

type Props = {
    hosts: EduHost[];
}

export default function HostSelector({ hosts }: Props) {
    const [selectedHost, setSelectedHost] = useState<EduHost | null>(null);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [host, setHost] = useRecoilState(hostState);

    const isCustomHost = selectedHost?.id === CUSTOM_HOST_ID;
    const hostUrl = selectedHost?.host;
    const isValidUrl = hostUrl !== undefined && hostUrl.length >= 0 && isURL(hostUrl, { require_tld: false })

    addCustomHost(hosts);

    function onCustomHostURLChange(url: string) {
        if (!selectedHost) return;

        setSelectedHost({
            ...selectedHost,
            host: url
        });
    }

    const onSave = async () => {
        setWaiting(true);

        const valid = selectedHost ? await isValidHost(selectedHost.host) : false;

        if (valid) {
            setHost(selectedHost);
            setValue(Constants.LOCALSTORAGE_HOST_KEY, selectedHost);
        } else {
            toast.error("Please check your internet connection and that you're connecting to the a valid server.");
        }

        setWaiting(false);
    };

    function addCustomHost(hosts: EduHost[]) {
        if (hosts[hosts.length - 1]?.id !== CUSTOM_HOST_ID) {
            hosts.push({ id: CUSTOM_HOST_ID, name: "Custom host", "host": "", img: "" });
        }
    }

    if (host) {
        return (
            <div className="flex gap-2">
                <div className="flex-grow button-like text-center">
                    {host.name}
                </div>

                <button
                    className="bg-white button-red"
                    onClick={() => {
                        setHost(null);
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
            {hosts.length > 0 && (
                <Select
                    placeholder="Select host"
                    value={selectedHost}
                    options={hosts}
                    isSearchable={false}
                    getOptionLabel={host => host.name}
                    getOptionValue={host => host.id}
                    onChange={host => setSelectedHost(host)}
                    menuPortalTarget={document.querySelector("body")}
                />
            )}

            { isCustomHost && (
                <form>
                    <input
                        type="text"
                        value={hostUrl}
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
                disabled={waiting || !selectedHost || !isValidUrl}
                onClick={() => onSave()}
            >
                {waiting ? <LoadingIcon className="m-auto" stroke={"#fff"} fill={"#fff"} width={"32px"} height={"32px"} /> : "Save preferences"}
            </button>
        </div>
    );
}
