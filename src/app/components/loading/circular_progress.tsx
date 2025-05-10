"use client"
const CircularProgress = ({ time, size = 50 }) => {
    const radius = size / 2;
    const stroke = size / 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
  
    const strokeDashoffset = (time / 15) * circumference;
    const gradientId = `gradient-blue-${size}`;
  
    return (
      <svg
        height={size}
        width={size}
        className="block"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#0f172a" />   {/* Very dark slate blue */}
            <stop offset="11%" stopColor="#1e3a8a" />  {/* Navy */}
            <stop offset="22%" stopColor="#1d4ed8" />  {/* Indigo */}
            <stop offset="33%" stopColor="#2563eb" />  {/* Royal Blue */}
            <stop offset="44%" stopColor="#3b82f6" />  {/* Bright Blue */}
            <stop offset="55%" stopColor="#60a5fa" />  {/* Sky Blue */}
            <stop offset="66%" stopColor="#76b5fe" />  {/* Medium-light Blue */}
            <stop offset="77%" stopColor="#93c5fd" />  {/* Light Blue */}
            <stop offset="88%" stopColor="#aecbfa" />  {/* Balanced Light Blue */}
            <stop offset="100%" stopColor="#c7ddfa" /> {/* Soft Light Blue */}
          </linearGradient>
        </defs>
  
        <circle
          stroke="#eee"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fontSize={size / 3}
          fontWeight="500"
          fill="black"
        >
          {time}
        </text>
      </svg>
    );
  };
  
  export default CircularProgress;
  