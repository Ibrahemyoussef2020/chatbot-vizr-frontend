import { Link } from "react-router-dom";

type Props = {
    to: string;
    bg: string;
    text: string;
    textColor: string;
    onClick?: () => Promise<void>;
};
const NavigationLink = (props: Props) => {
    return (
        <Link
            onClick={props.onClick}
            className="mx-2 rounded-xl px-5 py-2 font-semibold uppercase tracking-wider no-underline"
            to={props.to}
            style={{ background: props.bg, color: props.textColor }}
        >
            {props.text}
        </Link>
    );
};

export default NavigationLink;
