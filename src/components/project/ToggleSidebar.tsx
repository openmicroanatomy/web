import { sidebarVisibleState } from "lib/atoms";
import { useRecoilState } from "recoil";

export default function ToggleSidebar() {
    const [sidebarVisible, setSidebarVisible] = useRecoilState(sidebarVisibleState);

    return (
        <a className="rounded--button" onClick={() => setSidebarVisible((o) => !o)}>
            { sidebarVisible ? 
                <>&laquo;</>
            : 
                <>&raquo;</>
            }
        </a>
    )
}
