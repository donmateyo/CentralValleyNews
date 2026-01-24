export function BottomNav() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="vp-footer">
      <div className="vp-container vp-footer__inner">
        <nav className="vp-footer__nav" aria-label="Footer">
          <a href="https://www.co.fresno.ca.us/" target="_blank" rel="noopener noreferrer">
            Fresno County
          </a>
          <a href="https://tularecounty.ca.gov/" target="_blank" rel="noopener noreferrer">
            Tulare County
          </a>
        </nav>

        <button className="vp-footer__top" onClick={scrollToTop}>
          Back to top
        </button>
      </div>
    </footer>
  );
}