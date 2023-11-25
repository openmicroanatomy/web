import { sidebarVisibleState } from "lib/atoms";
import { useRecoilState } from "recoil";

export default function ToggleSidebar() {
    const [sidebarVisible, setSidebarVisible] = useRecoilState(sidebarVisibleState);

    return (
        <a
            className="rounded--button"
            onClick={() => setSidebarVisible((o) => !o)}
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
