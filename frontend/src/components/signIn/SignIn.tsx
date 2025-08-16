import {useEffect} from 'react';
import {GoogleOutlined} from "@ant-design/icons";
import {Button} from 'antd';
import {useAuth} from '../auth/useAuth';
import {useNavigate} from 'react-router-dom';
import Logo from "../logo/Logo.tsx";
import "./SignIn.css";

function SignIn() {
    const {isAuthenticated, login} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

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
                onClick={login}
                aria-label="Sign in with Google"
            >
                Sign In with Google
            </Button>
        </div>
    );
}

export default SignIn;
