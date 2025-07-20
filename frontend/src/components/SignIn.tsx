import {Button} from "antd";
import {GoogleOutlined} from "@ant-design/icons";
import "./SignIn.css";

function SignIn() {
    return (
        <div className="login-container">
            <div className="logo" aria-label="логотип">
                <span className="logo-blue logo-part">MOVIE</span>
                <span className="logo-orange logo-part">LEARN</span>
            </div>

            <div className="subtitle">
                Study English with scripts of your favorite movies!
            </div>

            <Button
                className="google-button"
                icon={<GoogleOutlined/>}
                size="large"
                // onClick={handleGoogleLogin}
                aria-label="Sign in with Google"
            >
                Sign In with Google
            </Button>
        </div>
    );
}

export default SignIn;
