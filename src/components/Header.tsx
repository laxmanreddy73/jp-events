import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getSupabaseClient, isCmsConfigured } from '../lib/supabaseClient';

type MenuItem = { name: string; path: string };

const menuItems: MenuItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isCmsConfigured) return;
    const client = getSupabaseClient();
    void client.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAdminActionError(`Administrator status could not be checked: ${error.message}`);
        return;
      }
      setAuthUserId(data.session?.user.id ?? null);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user.id ?? null);
      if (!session) setIsVerifiedAdmin(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isCmsConfigured || !authUserId) {
      setIsVerifiedAdmin(false);
      return;
    }
    let active = true;
    void (async () => {
      const client = getSupabaseClient();
      const [{ data: userData, error: userError }, { data: assurance, error: assuranceError }] = await Promise.all([
        client.auth.getUser(),
        client.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      if (userError) throw userError;
      if (assuranceError) throw assuranceError;
      if (active) setIsVerifiedAdmin(userData.user?.id === authUserId && userData.user.app_metadata.cms_role === 'admin' && assurance.currentLevel === 'aal2');
    })().catch((cause: unknown) => {
      if (active) {
        setIsVerifiedAdmin(false);
        setAdminActionError(`Administrator status could not be checked: ${cause instanceof Error ? cause.message : 'Unknown authentication error.'}`);
      }
    });
    return () => { active = false; };
  }, [authUserId]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => menuPanelRef.current?.querySelector<HTMLElement>('[data-menu-close]')?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !menuPanelRef.current) return;
      const focusable = Array.from(menuPanelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [isMenuOpen]);

  const handleAdminLogout = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      setAdminActionError(`Logout failed: ${error.message}`);
      return;
    }
    setAdminActionError(null);
    setIsVerifiedAdmin(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const linkClass = (path: string) => `relative px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a63f63] ${location.pathname === path ? 'text-[#a63f63]' : 'text-[#493b41] hover:text-[#8f3154]'}`;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${isHome && !isScrolled ? 'border-b border-white/15 bg-transparent' : 'border-b border-[#eadfe1]/75 bg-[#fffdfa]/92 shadow-[0_5px_24px_rgba(45,28,35,.06)] backdrop-blur-md'}`}>
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-3 sm:h-20 sm:px-8 lg:px-12">
          <Link to="/" className="group inline-flex min-w-0 items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a63f63]" aria-label="JP Events home">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/65 bg-white/90 p-0.5 shadow-sm sm:h-[54px] sm:w-[54px]">
              <img src={`${import.meta.env.BASE_URL}jp-events-logo.png`} alt="" width="64" height="64" decoding="async" className="h-full w-full scale-110 object-contain" />
            </span>
            <span className={`font-serif text-[15px] font-semibold tracking-wide sm:text-base ${isHome && !isScrolled ? 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,.45)]' : 'text-[#382832]'}`}>
              JP Events
              <span className={`mt-0.5 hidden text-[8px] font-sans font-medium uppercase tracking-[0.2em] sm:block ${isHome && !isScrolled ? 'text-white/75' : 'text-[#8b777f]'}`}>Weddings & celebrations</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-white/45 bg-white/85 p-1 shadow-sm backdrop-blur-md lg:flex">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} aria-current={location.pathname === item.path ? 'page' : undefined} className={linkClass(item.path)}>
                {item.name}
              </Link>
            ))}
            <Link to="/contact" className="ml-1 inline-flex min-h-11 items-center gap-2 bg-[#a63f63] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#81314f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81314f]">
              Inquire <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to={isVerifiedAdmin ? '/admin/dashboard' : '/admin/login'} className={`hidden min-h-10 items-center px-2 text-xs font-semibold transition-colors hover:text-[#a63f63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63] xl:inline-flex ${isHome && !isScrolled ? 'text-white' : 'text-[#493b41]'}`}>
              {isVerifiedAdmin ? 'Admin' : 'Admin login'}
            </Link>
            {isVerifiedAdmin && <button type="button" onClick={handleAdminLogout} className="hidden min-h-10 px-2 text-xs font-semibold text-[#493b41] transition-colors hover:text-[#a63f63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63] xl:inline-flex">Log out</button>}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open main menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-primary-navigation"
              className={`grid h-11 w-11 place-items-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a63f63] lg:hidden ${isHome && !isScrolled ? 'border-white/35 bg-black/20 text-white' : 'border-[#eadfe1] bg-white/75 text-[#382832]'}`}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuPanelRef}
            id="mobile-primary-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            initial={{ opacity: 0, y: '-2%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-1%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#f7f2ee] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#30242a] lg:hidden sm:px-8"
          >
            <div className="flex h-12 shrink-0 items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8c4d63]">JP Events</p>
              <button data-menu-close type="button" onClick={() => setIsMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-[#d8c9c7] text-[#382832] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]" aria-label="Close main menu">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav id="mobile-primary-navigation-links" aria-label="Main navigation links" className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-8">
              {menuItems.map((item, index) => (
                <motion.div key={item.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + index * 0.045, duration: 0.25 }} className="border-b border-[#ded2ce]">
                  <Link to={item.path} aria-current={location.pathname === item.path ? 'page' : undefined} onClick={() => setIsMenuOpen(false)} className="flex min-h-[68px] items-center justify-between gap-4 font-serif text-[clamp(1.8rem,8vw,3rem)] tracking-[-0.03em] text-[#30242a] transition-colors hover:text-[#a63f63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]">
                    <span>{item.name}</span>
                    <span className="font-sans text-xs tracking-[0.15em] text-[#a98790]">0{index + 1}</span>
                  </Link>
                </motion.div>
              ))}
              <Link to={isVerifiedAdmin ? '/admin/dashboard' : '/admin/login'} onClick={() => setIsMenuOpen(false)} className="mt-5 inline-flex min-h-12 items-center justify-between border border-[#d8c9c7] px-4 text-sm font-semibold text-[#493b41] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]">
                {isVerifiedAdmin ? 'Admin dashboard' : 'Admin login'} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {isVerifiedAdmin && <button type="button" onClick={handleAdminLogout} className="mt-2 min-h-12 text-left text-sm font-semibold text-[#493b41] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]">Log out</button>}
              {adminActionError && <p className="mt-4 text-sm text-rose-800" role="alert">{adminActionError}</p>}
            </nav>
            <div className="mx-auto flex w-full max-w-lg items-end justify-between border-t border-[#ded2ce] pt-4 text-xs text-[#74636a]">
              <span>Bespoke weddings & celebrations</span>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="inline-flex min-h-11 items-center px-2 font-semibold text-[#96314f] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]">Let’s talk</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
