import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ServerErrorProps {
  error: string;
}

export const ServerError: React.FC<ServerErrorProps> = ({ error }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
