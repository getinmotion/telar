
import React from 'react';
import { UserProfileTypes } from '@/components/user-types/UserProfileTypes';

export const UserProfileSection: React.FC = () => {
  return (
    <div className="w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <UserProfileTypes />
    </div>
  );
};
