import React from 'react';
import styled from 'styled-components';

const SecondaryButton = ({ onClick, children = "Button" }) => {
  return (
    <StyledWrapper>
      <button onClick={onClick}>
        <span className="button_top">{children}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    --button_radius: 0.75em;
    --button_color: #e8e8e8;
    --button_outline_color: #000000;
    font-size: 17px;
    font-weight: bold;
    border: none;
    border-radius: var(--button_radius);
    background: var(--button_outline_color);
  }

  .button_top {
    --gradient-color-1: #8360c3;
    --gradient-color-2: #2ebf91;
    display: inline-block;
    box-sizing: border-box;
    border: 2px solid var(--button_outline_color);
    border-radius: var(--button_radius);
    padding: 0.75em 1.5em;
    color: var(--button_outline_color);
    white-space: nowrap; /* Prevents line breaks */
    transform: translate(-0.2em, -0.2em);
    transition: transform 0.1s ease;
    background: linear-gradient(to bottom, var(--gradient-color-1), var(--gradient-color-2));
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


export default SecondaryButton;
