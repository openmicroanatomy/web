import { SVGProps } from "react";

export const LoadingIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 200 200"
		width="1em"
		height="1em"
		fill="#FF156D"
		stroke="#FF156D"
		{...props}
	>
		<circle
			cx={40}
			cy={65}
			r={15}
			strokeWidth={15}
		>
			<animate
				attributeName="cy"
				begin={-0.4}
				calcMode="spline"
				dur={1.5}
				keySplines=".5 0 .5 1;.5 0 .5 1"
				repeatCount="indefinite"
				values="65;135;65;"
			/>
		</circle>

		<circle
			cx={100}
			cy={65}
			r={15}
			strokeWidth={15}
		>
			<animate
				attributeName="cy"
				begin={-0.2}
				calcMode="spline"
				dur={1.5}
				keySplines=".5 0 .5 1;.5 0 .5 1"
				repeatCount="indefinite"
				values="65;135;65;"
			/>
		</circle>

		<circle
			cx={160}
			cy={65}
			r={15}
			strokeWidth={15}
		>
			<animate
				attributeName="cy"
				begin={0}
				calcMode="spline"
				dur={1.5}
				keySplines=".5 0 .5 1;.5 0 .5 1"
				repeatCount="indefinite"
				values="65;135;65;"
			/>
		</circle>
	</svg>
);
