import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { progressService } from '../../services/progressService';
import type { MovieProgress } from '../../types/learningSet';
import { useAuth } from '../auth/useAuth';
import { Spin, Card, Statistic, Empty, Row, Col } from 'antd';
import { CheckCircleOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';
import './ProgressDashboard.css';
import StatMovieCard from './StatMovieCard';

const ProgressDashboard: React.FC = () => {
    const { currentUserId } = useAuth();
    const [progress, setProgress] = useState<MovieProgress[]>([]);
    const [loading, setLoading] = useState(true);

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
                        <div style={{ padding: 50 }} />
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
                    <h1>Your learning progress</h1>
                    <div className="overall-summary">
                        <Card className="summary-card">
                            <Statistic
                                title="Movies Started"
                                value={progress.length}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                        <Card className="summary-card">
                            <Statistic
                                title="Words Learned"
                                value={totalLearned}
                                suffix={`/ ${totalWords}`}
                                prefix={<TrophyOutlined />}
                            />
                        </Card>
                        <Card className="summary-card">
                            <Statistic
                                title="Avg Test Score"
                                value={avgTestScore}
                                suffix="%"
                                prefix={<BookOutlined />}
                            />
                        </Card>
                    </div>
                </div>

                {progress.length === 0 ? (
                    <Empty description="No movies started yet. Start watching movies to see your progress!" />
                ) : (
                    <Row gutter={[24, 24]} className="movie-stats-grid">
                        {progress.map((item: MovieProgress) => (
                            <Col xs={24} md={progress.length === 1 ? 16 : 12} lg={progress.length === 1 ? 16 : 12}
                                xl={progress.length === 1 ? 12 : (progress.length === 2 ? 12 : 8)}
                                key={item.learningSetId}>
                                <StatMovieCard item={item} />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </MainLayout>
    );
};

export default ProgressDashboard;
