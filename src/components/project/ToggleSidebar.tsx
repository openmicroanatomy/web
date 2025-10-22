import { useStore } from "../../lib/StateStore";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";

export default function ToggleSidebar() {
    const [sidebarVisible, setSidebarVisible] = useStore(state => [
      state.sidebarVisible, state.setSidebarVisible
    ]);

    return (
        <a
            className="rounded--button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
        >
            { sidebarVisible && <ChevronDoubleLeftIcon width={20} height={20} /> }
        </a>
    )
}
