import {useRef, useEffect} from 'react';
import {GoogleOutlined, DownOutlined, PlayCircleOutlined, ReadOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {Button, Row, Col, Card} from 'antd';
import {useAuth} from './auth/useAuth.tsx';
import {useNavigate} from 'react-router-dom';
import Logo from "./Logo.tsx";
import "./css/SignIn.css";

function SignIn() {
    const {isAuthenticated, login} = useAuth();
    const navigate = useNavigate();
    const infoSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    const scrollToInfo = () => {
        const target = infoSectionRef.current;
        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start: number | null = null;

        const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        const ease = (t: number, b: number, c: number, d: number) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    };

    return (
        <div className="signin-page">
            {/* Hero Section */}
            <div className="hero-section">
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

                <div className="scroll-indicator" onClick={scrollToInfo}>
                    <span className="scroll-text">How it works</span>
                    <DownOutlined className="scroll-arrow"/>
                </div>
            </div>

            <div className="info-section" ref={infoSectionRef}>
                <h2>Master English with Movies <span role="img" aria-label="popcorn">🍿</span></h2>
                <Row gutter={[32, 32]} justify="center" className="steps-row">
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <PlayCircleOutlined className="step-icon"/>
                            <h3>1. Choose a Movie</h3>
                            <p>Select from our collection of popular movies and TV shows you love.</p>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <ReadOutlined className="step-icon"/>
                            <h3>2. Learn Vocabulary</h3>
                            <p>Study key words and phrases extracted directly from the movie script.</p>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <CheckCircleOutlined className="step-icon"/>
                            <h3>3. Test Yourself</h3>
                            <p>Take interactive tests to reinforce your learning and track progress.</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default SignIn;
