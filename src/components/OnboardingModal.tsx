import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Sparkles } from 'lucide-react';
import { ParticleHero } from './ParticleHero';

export function OnboardingModal() {
  const { user, updateUser } = useStore();
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(user.name === '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateUser({ name: name.trim() });
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <ParticleHero />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md glass p-8 rounded-3xl shadow-2xl text-center z-20"
      >
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Welcome to SkillPath</h2>
        <p className="text-textMuted mb-8">Let's start by getting to know you. What should we call you?</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium text-textMuted mb-2">Your Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            Get Started
          </button>
        </form>
      </motion.div>
    </div>
  );
}
