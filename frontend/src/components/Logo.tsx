import {Typography} from "antd";
import "./css/Logo.css";

const {Title} = Typography;

type Props = {
    level: 1 | 2 | 3 | 4 | 5;
};

const Logo = (props: Props) => {
    return (
        <div>
            <Title level={props.level} className="logo">
                <span className="logo-blue logo-part">MOVIE</span>
                <span className="logo-orange logo-part">LEARN</span>
            </Title>
        </div>
    );
};

export default Logo;