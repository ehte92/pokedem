import React from 'react';

import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`flex w-14 h-7 rounded-full p-1 cursor-pointer ${
        isOn ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md"
        layout
        transition={spring}
        animate={{ x: isOn ? 28 : 0 }}
      />
    </div>
  );
};

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
};

export default ToggleSwitch;
