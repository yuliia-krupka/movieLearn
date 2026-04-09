import {useRef, useEffect} from 'react';
import {GoogleOutlined, DownOutlined, PlayCircleOutlined, ReadOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {Button, Row, Col, Card} from 'antd';
import {useAuth} from './useAuth.tsx';
import {useNavigate} from 'react-router-dom';
import Logo from "../shared/Logo.tsx";
import "./SignIn.css";
import LogoDesign from "../shared/LogoDesign.tsx";

function SignIn() {
    const {isAuthenticated, login, isAdmin, user} = useAuth();
    const navigate = useNavigate();
    const infoSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (isAdmin) {
                navigate('/admin');
            } else if (!user.englishLevel) {
                navigate('/level');
            } else if (!user.interests || user.interests.length === 0) {
                navigate('/interests');
            } else {
                navigate('/home');
            }
        }
    }, [isAuthenticated, isAdmin, navigate, user]);

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
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    };

    return (
        <div className="signin-page">
            <div className="hero-section">
                <div className="login-container">
                    <LogoDesign className="logo-design-responsive"/>
                    <Logo level={1}/>
                    <div className="subtitle">
                        Learn English through your favorite movie scripts!
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
                <h2>Learn English through your favorite movie scripts!</h2>
                <div className="ukrainian-badge" style={{marginBottom: '40px'}}>
                    <span>🇺🇦</span> Built specifically for Ukrainians
                </div>
                <Row gutter={[32, 32]} justify="center" className="steps-row">
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <PlayCircleOutlined className="step-icon"/>
                            <h3>1. Add movie</h3>
                            <p>Choose a movie and upload its script to the system.</p>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <ReadOutlined className="step-icon"/>
                            <h3>2. Learn vocabulary</h3>
                            <p>Study key words and phrases taken directly from the movie script.</p>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <CheckCircleOutlined className="step-icon"/>
                            <h3>3. Test yourself</h3>
                            <p>Complete interactive quizzes to reinforce your knowledge and track your progress.</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default SignIn;
