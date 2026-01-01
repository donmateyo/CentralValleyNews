export function BottomNav() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 z-40 safe-area-bottom">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
        <button
          onClick={scrollToTop}
          className="flex flex-col items-center justify-center h-full w-full gap-1 text-blue-400 active:scale-95 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 256 256">
            <path d="M200,44H56A12,12,0,0,0,44,56V200a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V56A12,12,0,0,0,200,44Zm4,156a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V56a4,4,0,0,1,4-4H200a4,4,0,0,1,4,4Z"/>
          </svg>
          <span className="text-[10px] font-semibold">Feed</span>
        </button>

        <button
          onClick={() => openLink('https://www.co.fresno.ca.us/')}
          className="flex flex-col items-center justify-center h-full w-full gap-1 text-slate-500 hover:text-slate-200 active:scale-95 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 256 256">
            <path d="M240,208H224V96a16,16,0,0,0-16-16H160V32a16,16,0,0,0-24.88-13.32L39.12,80A16,16,0,0,0,32,93.32V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H160V96ZM48,93.32,144,32V208H48ZM88,112a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H80A8,8,0,0,1,88,112Zm0,48a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H80A8,8,0,0,1,88,160Zm48-48a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h16A8,8,0,0,1,136,112Zm0,48a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h16A8,8,0,0,1,136,160Z"/>
          </svg>
          <span className="text-[10px] font-medium">Fresno Gov</span>
        </button>

        <button
          onClick={() => openLink('https://tularecounty.ca.gov/')}
          className="flex flex-col items-center justify-center h-full w-full gap-1 text-slate-500 hover:text-slate-200 active:scale-95 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 256 256">
            <path d="M198.1,62.59a76,76,0,0,0-140.2,0A72.27,72.27,0,0,0,16,127.8C15.89,166.62,47.36,199,86.14,200A71.68,71.68,0,0,0,120,192.49V232a8,8,0,0,0,16,0V192.49A71.68,71.68,0,0,0,169.86,200c38.78-1,70.25-33.36,70.14-72.2A72.27,72.27,0,0,0,198.1,62.59ZM169.33,184a55.6,55.6,0,0,1-33.33-11V113.66l41.38-41.38a8,8,0,0,0-11.32-11.32L136,91V48a8,8,0,0,0-16,0V91L89.94,60.9A8,8,0,0,0,78.62,72.22L120,113.66V173a55.6,55.6,0,0,1-33.33,11c-30.26.78-55.39-23.93-55.67-54.12a56.24,56.24,0,0,1,34.45-52.29A8,8,0,0,0,70,69.93a60,60,0,0,1,116.08,0,8,8,0,0,0,4.58,5.63A56.24,56.24,0,0,1,225,127.88C224.72,158.07,199.59,184.78,169.33,184Z"/>
          </svg>
          <span className="text-[10px] font-medium">Tulare Gov</span>
        </button>
      </div>
    </nav>
  );
}
