import React, {useEffect, useState} from 'react';
import MainLayout from '../layout/MainLayout';
import {progressService} from '../../services/progressService';
import type {MovieProgress} from '../../types/learningSet';
import {useAuth} from '../auth/useAuth';
import {Spin, Progress, Card, Row, Col, Statistic, Tag, Empty} from 'antd';
import {CheckCircleOutlined, TrophyOutlined, BookOutlined} from '@ant-design/icons';
import './ProgressDashboard.css';
import {useNavigate} from 'react-router-dom';

const ProgressDashboard: React.FC = () => {
    const {currentUserId} = useAuth();
    const [progress, setProgress] = useState<MovieProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUserId) {
            progressService.getUserProgress()
                .then((data: MovieProgress[]) => setProgress(data))
                .catch((err: unknown) => console.error('Failed to load progress:', err))
                .finally(() => setLoading(false));
        }
    }, [currentUserId]);

    if (loading) {
        return (
            <MainLayout className="content stats-layout">
                <div className="stats-loading">
                    <Spin size="large" tip="Loading your movie statistics...">
                        <div style={{padding: 50}}/>
                    </Spin>
                </div>
            </MainLayout>
        );
    }

    const totalLearned = progress.reduce((acc: number, curr: MovieProgress) => acc + (curr.learnedWords || 0), 0);
    const totalWords = progress.reduce((acc: number, curr: MovieProgress) => acc + (curr.totalWords || 0), 0);
    const completedTests = progress.filter((p: MovieProgress) => p.testsScore > 0);
    const avgTestScore = completedTests.length > 0
        ? Math.round(completedTests.reduce((acc: number, curr: MovieProgress) => acc + (curr.testsScore || 0), 0) / completedTests.length)
        : 0;

    return (
        <MainLayout className="content stats-layout">
            <div className="stats-container">
                <div className="stats-header">
                    <h1>Your Learning Progress</h1>
                    <div className="overall-summary">
                        <Card className="summary-card">
                            <Statistic
                                title="Movies Started"
                                value={progress.length}
                                prefix={<CheckCircleOutlined/>}
                            />
                        </Card>
                        <Card className="summary-card">
                            <Statistic
                                title="Words Learned"
                                value={totalLearned}
                                suffix={`/ ${totalWords}`}
                                prefix={<TrophyOutlined/>}
                            />
                        </Card>
                        <Card className="summary-card">
                            <Statistic
                                title="Avg Test Score"
                                value={avgTestScore}
                                suffix="%"
                                prefix={<BookOutlined/>}
                            />
                        </Card>
                    </div>
                </div>

                {progress.length === 0 ? (
                    <Empty description="No movies started yet. Start watching movies to see your progress!"/>
                ) : (
                    <Row gutter={[24, 24]} className="movie-stats-grid">
                        {progress.map((item: MovieProgress) => (
                            <Col xs={24} md={progress.length === 1 ? 16 : 12} lg={progress.length === 1 ? 16 : 12}
                                 xl={progress.length === 1 ? 12 : (progress.length === 2 ? 12 : 8)}
                                 key={item.learningSetId}>
                                <Card
                                    hoverable
                                    className="movie-stat-card"
                                    cover={
                                        item.movieImage ? (
                                            <img
                                                alt={item.movieTitle}
                                                src={`data:image/jpeg;base64,${item.movieImage}`}
                                                className="movie-card-img"
                                            />
                                        ) : (
                                            <div className="movie-placeholder-img">
                                                <BookOutlined className="movie-placeholder-icon"/>
                                            </div>
                                        )
                                    }
                                    onClick={() => navigate(`/movies/${item.movieId}`)}
                                >
                                    <div className="movie-card-content">
                                        <div className="movie-title-section">
                                            <h3>{item.movieTitle}</h3>
                                            <div className="title-tags">
                                                <Tag color="blue" className="english-level-tag">
                                                    {item.englishLevel || 'A2'}
                                                </Tag>
                                                <Tag color="cyan">
                                                    Total attempts: {item.totalAttempts}
                                                </Tag>
                                            </div>
                                        </div>

                                        <div className="stat-section">
                                            <div className="stat-label">
                                                <span>Words Learned</span>
                                                <span>{item.learnedWords}/{item.totalWords}</span>
                                            </div>
                                            <Progress
                                                percent={Math.round((item.learnedWords / (item.totalWords || 1)) * 100)}
                                                size="small"
                                                strokeColor="#F49E4C"
                                            />
                                        </div>

                                        <div className="stat-badges">
                                            <div className="stat-badges-row">
                                                <Tag className={item.flashcardsScore > 0 ? "flashcards-tag-active" : ""}
                                                     color={item.flashcardsScore > 0 ? undefined : "orange"}
                                                     icon={<CheckCircleOutlined/>}>
                                                    Flashcards: {item.flashcardsScore > 0 ? `${item.flashcardsScore}%` : "Started"}
                                                </Tag>
                                                <Tag color={item.testsScore > 0 ? "blue" : "default"}
                                                     icon={<TrophyOutlined/>}>
                                                    Test: {item.testsScore > 0 ? `${item.testsScore}%` : "0%"}
                                                </Tag>
                                            </div>
                                            {item.lastAttemptAt && (
                                                <div className="last-activity">
                                                    <span>Last attempt:</span>
                                                    <span> {new Date(item.lastAttemptAt).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </MainLayout>
    );
};

export default ProgressDashboard;
