enum SlideTourActionKind {
	START,
	STOP,
	PREVIOUS,
	NEXT
}

export type SlideTourAction = {
	type: SlideTourActionKind
}

export type SlideTourState = {
	active: boolean;
	index: number;
}

export default function SlideTourReducer(state: SlideTourState, action: SlideTourAction) {
	switch (action.type) {
		case SlideTourActionKind.START:
			return {
				active: true,
				index: 0,
			}
		case SlideTourActionKind.STOP:
			return {
				active: false,
				index: 0
			}
		case SlideTourActionKind.NEXT:
			return {
				...state,
				index: state.index + 1
			};
		case SlideTourActionKind.PREVIOUS:
			return {
				...state,
				index: state.index - 1
			};
		default:
			throw new Error();
	}
}