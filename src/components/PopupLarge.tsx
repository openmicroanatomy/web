import { ReactNode, useEffect, useState } from "react"
import Popup from "reactjs-popup"

interface Props {
  activator?: JSX.Element | ((isOpen: boolean) => JSX.Element)
  children: ReactNode
}

/**
 * Source: https://github.com/Mangatsu/web/blob/main/components/PopupLarge.tsx
 */
const PopupLarge = ({ activator, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
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
    <Popup trigger={activator} modal arrow={false} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
      <div
        className="w-auto h-auto p-4"
      >
        {children}
      </div>
    </Popup>
  )
}

export default PopupLarge
