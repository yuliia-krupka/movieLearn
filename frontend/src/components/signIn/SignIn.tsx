import {GoogleOutlined} from "@ant-design/icons";
import "./SignIn.css";
import {Button} from 'antd';
import Logo from "../logo/Logo.tsx";

function SignIn() {

    const handleGoogleLogin = () => {
        window.location.href = "/oauth2/authorization/google";
    }
    return (
        <div className="login-container">
            <Logo level={1}/>
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
