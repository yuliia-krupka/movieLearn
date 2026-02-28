import React from 'react';
import {Result, Button} from 'antd';

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return {hasError: true};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Something went wrong."
                    subTitle="Unexpected error. Try reloading the page."
                    extra={
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Reload
                        </Button>
                    }
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
