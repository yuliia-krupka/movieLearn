import {Typography} from "antd";
import "./Logo.css";

const {Title} = Typography;

const Logo = () => {
    return (
        <div>
            <Title className="logo">
                <span className="logo-blue logo-part">MOVIE</span>
                <span className="logo-orange logo-part">LEARN</span>
            </Title>
        </div>
    )
}

export default Logo;