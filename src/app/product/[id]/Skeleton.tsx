import React from 'react';

const Skeleton: React.FC<{ styles: string; length: number }> = ({ styles, length }) => {
  return (
    <div className={styles}>
      {Array.from({ length: length }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] bg-luxury-border mb-4" />
          <div className="h-3 bg-luxury-border rounded mb-2 w-2/3" />
          <div className="h-4 bg-luxury-border rounded mb-2" />
          <div className="h-4 bg-luxury-border rounded w-1/3" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
