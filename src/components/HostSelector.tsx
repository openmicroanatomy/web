import { isValidHost } from "lib/api";
import { hostState } from "lib/atoms";
import Constants from "lib/constants";
import { setValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loading-icons";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import "styles/Buttons.css";
import { EduHost } from "types";
import isURL from "validator/lib/isURL";
import Select from "react-select";

type Props = {
    hosts: EduHost[];
}

export default function HostSelector({ hosts }: Props) {
    const [selectedHost, setSelectedHost] = useState<EduHost | null>(null);
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [isCustomHost, setIsCustomHost] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [host, setHost] = useRecoilState(hostState);
    const [input, setInput] = useState("");

    const onHostChange = async (url: string) => {
        setInput(url);

        const valid = url.length >= 0 && isURL(url, { require_tld: false });
        const host = hosts.find((host, index) => host.host == url && index != hosts.length - 1);

        setIsValidUrl(!valid);

        if (valid && host) {
            setIsCustomHost(false);
            setSelectedHost(host);
        } else {
            setIsCustomHost(true);
            getLastHost().host = url;
            setSelectedHost(getLastHost());
        }
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

    useEffect(() => {
        setIsCustomHost(hosts.length === 0);

        // Add the fake "Custom host" organization to the list, which we can modify.
        if (hosts.length >= 1 && getLastHost().id !== "custom-host") {
            hosts.push(createCustomHost());
        }
    }, [hosts]);

    const createCustomHost = () => {
        return { id: "custom-host", name: "Custom host", "host": "", img: "" };
    }

    /**
     * This *should* always point to the Custom host, as that should be the last element on the array.
     */
    const getLastHost = () => {
        return hosts[hosts.length - 1];
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
                    onChange={host => onHostChange(host?.host || "")}
                    menuPortalTarget={document.querySelector("body")}
                />
            )}

            <form className={`${!isCustomHost && "hidden"}`}>
                <input
                    type="text"
                    value={input}
                    onChange={event => onHostChange(event.currentTarget.value)}
                    className="w-full border border-gray-300 rounded-sm text-black p-1 my-2"
                />
            </form>

            <p className={`${!isCustomHost && "hidden" } font-bold text-center ${isValidUrl ? "text-red-500" : "text-green-500"}`}>
                {isValidUrl ? "Not a valid URL" : "Valid URL"}
            </p>

            <button
                className="button w-full mt-4"
                type="button"
                disabled={waiting || !selectedHost || isValidUrl}
                onClick={() => onSave()}
            >
                Save preferences
                {waiting && <ThreeDots className="m-auto" stroke="white" speed={2} />}
            </button>
        </div>
    );
}
