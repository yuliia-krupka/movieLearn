import {GoogleOutlined} from "@ant-design/icons";
import "./SignIn.css";
import {Button, Typography} from 'antd';

const {Title} = Typography;

function SignIn() {

    const handleGoogleLogin = () => {
        window.location.href = "/oauth2/authorization/google";
    }
    return (
        <div className="login-container">
            <Title level={1} className="logo">
                <span className="logo-blue">MOVIE</span>
                <span className="logo-orange">LEARN</span>
            </Title>

            <div className="subtitle">
                Study English with scripts of your favorite movies!
            </div>

            <Button
                className="google-button"
                icon={<GoogleOutlined/>}
                size="large"
                onClick={handleGoogleLogin}
                aria-label="Sign in with Google"
            >
                Sign In with Google
            </Button>
        </div>
    );
}

export default SignIn;
