import { useStore } from "../../lib/StateStore";

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
            { sidebarVisible ? 
                <>&laquo;</>
            : 
                <>&raquo;</>
            }
        </a>
    )
}
