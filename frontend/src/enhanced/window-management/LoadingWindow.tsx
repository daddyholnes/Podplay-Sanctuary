import React from 'react';
import styled from '@emotion/styled';

interface LoadingWindowProps {
  title?: string;
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #2d1b69 0%, #1a103e 100%);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const LoadingTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #8b5cf6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.p`
  font-size: 1rem;
  color: #d1d5db;
  max-width: 400px;
`;

const LoadingWindow: React.FC<LoadingWindowProps> = ({ title = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <LoadingTitle>{title}</LoadingTitle>
      <Spinner />
      <Message>
        Initializing components and establishing connections. This should only take a moment...
      </Message>
    </LoadingContainer>
  );
};

export default LoadingWindow;
