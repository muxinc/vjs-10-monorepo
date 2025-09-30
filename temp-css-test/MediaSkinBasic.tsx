import * as React from 'react';

export const MediaSkinBasic: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative overflow-clip rounded-lg antialiased font-medium font-sans text-sm leading-normal">
      {children}

      {/* Background gradient */}
      <div
        className="opacity-0 delay-500 rounded-full absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/50 to-transparent transition-opacity"
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-3 bottom-3 rounded-full z-20 flex items-center p-1 gap-2 text-white shadow-sm bg-white/10 transition"
        data-testid="media-controls"
      >
        <button className="cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-2 focus:outline-blue-500">
          Play/Pause
        </button>

        <div className="flex-1 flex items-center gap-3 px-2">
          <span className="tabular-nums">00:00</span>

          <div className="flex h-5 items-center flex-1 relative">
            <div className="h-1 w-full relative select-none rounded-full bg-white/20">
              <div className="bg-white rounded-full h-full" style={{width: '30%'}} />
            </div>
            <div className="bg-white z-10 select-none rounded-full shadow-sm opacity-0 transition-opacity ease-in-out hover:opacity-100 w-3 h-3" />
          </div>

          <span className="tabular-nums">10:00</span>
        </div>

        <button className="cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:bg-white/10 hover:text-white">
          Mute
        </button>

        <button className="cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:bg-white/10 hover:text-white">
          Fullscreen
        </button>
      </div>
    </div>
  );
};