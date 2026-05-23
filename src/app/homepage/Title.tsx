import React from 'react';

const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-2 sm:mb-3 font-sans">
                    {t('new_arrivals.label')}
                  </p> */}
      <p className=" text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-wide">
        {children}
      </p>
    </div>
  );
};

export default Title;
