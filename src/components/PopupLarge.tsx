import { ReactNode, useEffect, useState } from "react"
import Popup from "reactjs-popup"

interface Props {
    activator?: JSX.Element | ((isOpen: boolean) => JSX.Element);
    children: ReactNode;
    disabled?: boolean;
}

/**
 * Based on: https://github.com/Mangatsu/web/blob/main/components/PopupLarge.tsx
 */
const PopupLarge = ({activator, children, disabled = false}: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const html = document.getElementsByTagName("html")[0]

        if (isOpen) {
            html.classList.add("lock-scroll")
        } else {
            html.classList.remove("lock-scroll")
        }

        return (): void => {
            html.classList.remove("lock-scroll")
        }
    }, [isOpen])

    return (
        <Popup
            trigger={activator}
            modal
            arrow={false}
            disabled={disabled}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
        >
            <div className="w-auto h-auto p-4 m-4 rounded-sm shadow-md bg-gray-200">
                {children}
            </div>
        </Popup>
    )
}

export default PopupLarge
