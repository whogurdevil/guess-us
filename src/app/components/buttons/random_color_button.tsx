"use client"

import React from 'react';
import styled from 'styled-components';

const variantGradients: Record<string, string> = {
    sunset: 'linear-gradient(45deg, #ff6a00, #ffb347)',        // vibrant orange to peach
    ocean: 'linear-gradient(45deg, #00c6ff, #0072ff)',         // bright cyan to electric blue
    forest: 'linear-gradient(45deg, #58BF66, #8cc63f)',        // bright green to fresh lime
    royal: 'linear-gradient(45deg, #ff66b2, #ff3385)',          // soft pink to deeper pink
  };
  
  
  
  
  

const RandomColorButton = ({
  onClick,
  children = "Button",
  variant = "sunset",
  disabled = false,
}: {
  onClick: () => void;
  children?: React.ReactNode;
  variant?: keyof typeof variantGradients;
  disabled?: boolean;
}) => {
  const gradient = variantGradients[variant] || variantGradients.sunset;

  return (
    <StyledWrapper>
      <button onClick={onClick} disabled={disabled}>
        <span className="button_top" style={{ background: gradient }}>
          {children}
        </span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  
  button {
    width: 100%;
    --button_radius: 0.75em;
    --button_outline_color: #000000;
    font-size: 17px;
    font-weight: bold;
    border: none;
    border-radius: var(--button_radius);
    background: var(--button_outline_color);
  }

  .button_top {
    display: block;
    width: 100%;
    box-sizing: border-box;
    border: 2px solid var(--button_outline_color);
    border-radius: var(--button_radius);
    padding: 0.75em 1.5em;
    color: var(--button_outline_color);
    white-space: nowrap;
    transform: translate(-0.2em, -0.2em);
    transition: transform 0.1s ease;
    text-align: center;
  }

  button:hover .button_top {
    transform: translate(-0.28em, -0.28em);
  }

  button:active .button_top {
    transform: translate(0);
  }

  @media (max-width: 480px) {
    button {
      font-size: 15px;
    }
    .button_top {
      padding: 0.6em 1.2em;
    }
  }
`;

export default RandomColorButton;
