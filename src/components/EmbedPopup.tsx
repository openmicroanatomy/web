import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";

interface EmbedProps {
    host: string;
    project: string;
    slide: string;
}

function EmbedPopup(embed: EmbedProps) {
    return (
        <Popup
            position="right center"
            modal
            arrowStyle={{ color: "#ddd" }}
            contentStyle={{ width: 300, backgroundColor: "#ddd" }}
        >
            {(close: PopupActions["close"]) => (
                <div className="flex justify-center flex-col">
                    <div className="text-right">
                        <a onClick={close} className="button-close-dialog">
                            &times;
                        </a>
                    </div>

                    <input type="text" value={embed.host + embed.project + embed.slide}></input>
                </div>
            )}
        </Popup>
    );
}

export default EmbedPopup;
