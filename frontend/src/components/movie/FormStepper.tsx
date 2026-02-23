import React from 'react';
import '../css/FormStepper.css';

interface FormStepperProps {
    currentStep: number;
    onStepHover?: (step: number) => void;
    onStepClick: (step: number) => void;
    steps: string[];
}

const FormStepper: React.FC<FormStepperProps> = ({currentStep, onStepClick, steps}) => {
    const sliderWidthPercentage = 100 / steps.length;
    const transformValue = `translateX(${currentStep * 100}%)`;

    return (
        <div className="step-segments">
            <div
                className="step-slider"
                style={{
                    width: `calc(${sliderWidthPercentage}% - 6px)`,
                    transform: transformValue
                }}
            />
            {steps.map((stepName, index) => (
                <div
                    key={index}
                    className={`step-segment ${currentStep === index ? 'active' : ''}`}
                    onClick={() => onStepClick(index)}
                >
                    {stepName}
                </div>
            ))}
        </div>
    );
};

export default FormStepper;
