import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

interface BattleLogProps {
  battleLog: string[];
}

const BattleLog: React.FC<BattleLogProps> = ({ battleLog }) => {
  return (
    <div className="mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 h-40 overflow-y-auto">
      <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">
        Battle Log:
      </h4>
      <AnimatePresence>
        {battleLog.slice(-5).map((log, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            {log}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BattleLog;
