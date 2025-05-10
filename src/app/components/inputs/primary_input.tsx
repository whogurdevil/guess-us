"use client"

import React from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  .input {
    width: 100%;
    font-family: "SF Pro", sans-serif;
    padding: 0.875rem;
    font-size: 1rem;
    border: 1.5px solid #000;
    border-radius: 0.5rem;
    box-shadow: 2.5px 3px 0 #000;
    outline: none;
    transition: ease 0.25s;
    background-color: white;
  }

  .input:focus {
    box-shadow: 5.5px 7px 0 black;
  }
`;

const PrimaryInput = (props) => {
  return (
    <StyledWrapper>
      <input {...props} className="input" />
    </StyledWrapper>
  );
};

export default PrimaryInput;
