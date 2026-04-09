import React from 'react';
import {Button, Result} from 'antd';
import {useNavigate} from 'react-router-dom';
import MainLayout from '../layout/MainLayout';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh'
            }}>
                <Result
                    status="404"
                    title="404"
                    subTitle="Sorry, the page you visited does not exist."
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

export default NotFound;
