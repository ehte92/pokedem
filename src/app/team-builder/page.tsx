'use client';

import React from 'react';

import TeamBuilder from '@/components/team-builder';

const TeamBuilderPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        Pokémon Team Builder
      </h1>
      <p className="text-lg text-center mb-8 text-gray-600 dark:text-gray-400">
        Build your dream team of Pokémon and analyze their strengths and
        weaknesses!
      </p>
      <TeamBuilder />
    </div>
  );
};

export default TeamBuilderPage;
