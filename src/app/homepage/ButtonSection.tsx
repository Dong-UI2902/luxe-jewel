import Link from 'next/link';
import React from 'react';

const ButtonSection: React.FC<{ url: string; children: React.ReactNode }> = ({ url, children }) => {
  return (
    <div className="flex justify-center mt-10 mb-10 hidden md:flex">
      <Link
        href={url}
        className="group flex items-center justify-center px-10 py-2.5 border border-[gold] rounded-[4px] bg-white transition-all duration-300 hover:border-[#336666] hover:bg-[#336666]/5"
      >
        <span className="font-sans text-[13px] uppercase font-medium text-gold transition-colors group-hover:text-charcoal">
          {children}
        </span>
      </Link>
    </div>
  );
};

export default ButtonSection;
