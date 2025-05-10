"use client"

import React from "react";
import styled from "styled-components";

interface PrimaryCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const SecondaryCard: React.FC<PrimaryCardProps> = ({ children, style, className }) => {
  return (
    <StyledWrapper style={style}>
      <div className={`card ${className}`}>
        {children}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --main-color: #323232;
    --main-focus: #2d8cf0;

    background: var(--bg-color);
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

export default SecondaryCard;
