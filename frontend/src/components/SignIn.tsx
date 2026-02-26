import {useRef, useEffect} from 'react';
import {GoogleOutlined, DownOutlined, PlayCircleOutlined, ReadOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {Button, Row, Col, Card} from 'antd';
import {useAuth} from './auth/useAuth.tsx';
import {useNavigate} from 'react-router-dom';
import Logo from "./Logo.tsx";
import "./css/SignIn.css";
import LogoDesign from "./LogoDesign.tsx";

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
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    };

    return (
        <div className="signin-page">
            <div className="hero-section">
                <div className="login-container">
                    <LogoDesign/>
                    <Logo level={1}/>
                    <div className="subtitle">
                        Вивчайте англійську за сценаріями улюблених фільмів!
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
                    <span className="scroll-text">Як це працює</span>
                    <DownOutlined className="scroll-arrow"/>
                </div>
            </div>

            <div className="info-section" ref={infoSectionRef}>
                <h2>Вивчайте англійську за сценаріями улюблених фільмів!</h2>
                <div className="ukrainian-badge" style={{marginBottom: '40px'}}>
                    <span>🇺🇦</span> Створено спеціально для українців
                </div>
                <Row gutter={[32, 32]} justify="center" className="steps-row">
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <PlayCircleOutlined className="step-icon"/>
                            <h3>1. Оберіть фільм</h3>
                            <p>Обирайте з нашої колекції ваших улюблених популярних фільмів та серіалів.</p>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <ReadOutlined className="step-icon"/>
                            <h3>2. Вивчайте лексику</h3>
                            <p>Вивчайте ключові слова та фрази, взяті безпосередньо зі сценарію фільму.</p>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="step-card">
                            <CheckCircleOutlined className="step-icon"/>
                            <h3>3. Перевірте себе</h3>
                            <p>Проходьте інтерактивні тести, щоб закріпити знання та відстежувати прогрес.</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default SignIn;
