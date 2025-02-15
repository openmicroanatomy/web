import { DisplaySlideNumbersIcon } from "../icons/DisplaySlideNumbersIcon";
import { useStore } from "../../lib/StateStore";

export function ToggleDisplaySlideNumbers() {
	const [displaySlideNumbers, setDisplaySlideNumbers] = useStore(state => [
		state.displaySlideNumbers, state.setDisplaySlideNumbers
	]);

	return (
		<a
			className={`rounded--button flex justify-center items-center ${displaySlideNumbers && "bg-gray-100"}`}
			onClick={() => setDisplaySlideNumbers(!displaySlideNumbers)}
			title={"Toggle slide numbering"}
		>
			<DisplaySlideNumbersIcon />
		</a>
	)
}
