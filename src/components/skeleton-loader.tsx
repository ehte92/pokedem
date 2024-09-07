import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SkeletonLoader: React.FC = () => {
  return (
    <div>
      <Skeleton className="w-3/4 h-8 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-6" />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="evolution">Evolution</TabsTrigger>
          <TabsTrigger value="moves">Moves</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="w-full h-64 mb-4" />
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-16 h-6" />
              </div>
            </div>
            <div>
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-3/4 h-4 mb-4" />
              <Skeleton className="w-full h-20 mb-4" />
              <Skeleton className="w-1/2 h-4 mb-2" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkeletonLoader;
