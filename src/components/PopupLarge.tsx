import { ReactElement, ReactNode, useEffect, useState } from "react";
import Popup from "reactjs-popup"

type Props = {
    activator?: ReactElement | ((isOpen: boolean) => ReactElement);
    children: ReactNode;
    disabled?: boolean;
}

/**
 * Based on: https://github.com/Mangatsu/web/blob/main/components/PopupLarge.tsx
 */
export default function PopupLarge({ activator, children, disabled = false }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const html = document.getElementsByTagName("html")[0];

        if (isOpen) {
            html.classList.add("lock-scroll");
        } else {
            html.classList.remove("lock-scroll");
        }

        return (): void => {
            html.classList.remove("lock-scroll");
        };
    }, [isOpen]);

    return (
        <Popup
            trigger={activator}
            modal
            arrow={false}
            disabled={disabled}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
        >
            <div className="w-auto max-w-[640px] h-auto p-4 m-4 rounded-lg bg-gray-200">
                {children}
            </div>
        </Popup>
    );
}
