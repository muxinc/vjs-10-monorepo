import * as React from 'react';

export const MediaSkinSimplified: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative overflow-clip rounded-4xl antialiased font-medium font-sans text-sm leading-normal tracking-tight">
      {children}

      {/* Background gradient */}
      <div
        className="opacity-0 delay-500 rounded-full absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-opacity backdrop-saturate-150 backdrop-brightness-90"
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-3 bottom-3 rounded-full z-20 flex items-center p-1 ring ring-white/10 ring-inset gap-0.5 text-white shadow-sm shadow-black/15 bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90 transition"
        data-testid="media-controls"
      >
        <button className="group cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-95">
          Play/Pause Button
        </button>

        <div className="flex-1 flex items-center gap-3 px-1.5">
          <span className="tabular-nums">00:00</span>

          <div className="flex h-5 items-center flex-1 relative">
            <div className="h-1 w-full relative select-none rounded-full bg-white/20 ring-1 ring-black/5">
              <div className="bg-white rounded-full h-full" style={{width: '30%'}} />
            </div>
            <div className="bg-white z-10 select-none ring ring-black/10 rounded-full shadow-sm shadow-black/15 opacity-0 transition-opacity ease-in-out focus-visible:outline-2 focus-visible:outline-blue-500 hover:opacity-100 size-2.5 active:size-3" />
          </div>

          <span className="tabular-nums">10:00</span>
        </div>

        <button className="group cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-95">
          Mute Button
        </button>

        <button className="group cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-95">
          Fullscreen Button
        </button>
      </div>
    </div>
  );
};