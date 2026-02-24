import React from 'react';
import {Button, Result} from 'antd';
import MainLayout from '../layout/MainLayout';
import {useNavigate} from 'react-router-dom';

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Result
                    status="403"
                    title="403"
                    subTitle="Sorry, you are not authorized to access this page."
                    extra={
                        <Button type="primary" onClick={() => navigate('/home')}>
                            Back Home
                        </Button>
                    }
                />
            </div>
        </MainLayout>
    );
};

export default AccessDenied;
