import { useRecoilState } from "recoil";
import { displaySlideNumbersState } from "../../lib/atoms";
import { DisplaySlideNumbersIcon } from "../icons/DisplaySlideNumbersIcon";

export function ToggleDisplaySlideNumbers() {
	const [displaySlideNumbers, setDisplaySlideNumbers] = useRecoilState(displaySlideNumbersState);

	return (
		<a
			className={`rounded--button flex justify-center items-center ${displaySlideNumbers && "bg-gray-100"}`}
			onClick={() => setDisplaySlideNumbers((currentValue) => !currentValue)}
		>
			<DisplaySlideNumbersIcon />
		</a>
	)
}
