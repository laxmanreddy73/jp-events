import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="bg-[#21191a] text-[#f8f2ef]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="grid gap-9 border-b border-white/15 pb-9 sm:gap-12 sm:pb-12 lg:grid-cols-[1.2fr_0.7fr_1.1fr]">
          <div>
            <Link to="/" aria-label="JP Events home" className="inline-flex items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[#f7f2ee] p-1">
                <img src={`${import.meta.env.BASE_URL}jp-events-logo.png`} alt="" width="64" height="64" loading="lazy" decoding="async" className="h-full w-full scale-110 object-contain" />
              </span>
              <span className="font-serif text-lg tracking-wide">JP Events</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Wedding planning and celebration design shaped around the people, traditions, and moments that matter to you.
            </p>
            <div className="mt-5 flex items-center gap-3 text-xs text-white/70">
              <a href="https://www.instagram.com/jp_events__official/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-white/25 px-3 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                Instagram <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a href="https://www.facebook.com/jpeventsorganizers/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-white/25 px-3 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                Facebook <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e4b4c1]">Explore</h2>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-1 sm:gap-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="inline-flex min-h-11 items-center text-sm text-white/75 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e4b4c1]">Get in touch</h2>
            <ul className="space-y-1 text-sm text-white/75">
              <li><a href="tel:+919533950636" className="inline-flex min-h-11 items-center gap-3 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Phone className="h-4 w-4 text-[#e4b4c1]" aria-hidden="true" />95339 50636</a></li>
              <li><a href="mailto:jpevents@gmail.com" className="inline-flex min-h-11 items-center gap-3 break-all transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Mail className="h-4 w-4 shrink-0 text-[#e4b4c1]" aria-hidden="true" />jpevents@gmail.com</a></li>
              <li><a href="https://maps.google.com/?q=Hyderabad,+Telangana,+India" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-start gap-3 pt-3 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e4b4c1]" aria-hidden="true" /><span>Hyderabad, Telangana<br />India</span></a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} JP Events. All rights reserved.</p>
          <p>Wedding planning & celebration design · Hyderabad, India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
