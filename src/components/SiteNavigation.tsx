'use client';

export function SiteNavigation() {
  return (
    <header className="bg-[#427d78] sticky top-0 z-50 shadow-md">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo - Links to Home */}
          <a href="https://ukiahseniorcenter.org" className="shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="https://ukiahseniorcenter.org/wp-content/uploads/2023/07/usc-logo-greentext.webp"
              alt="Ukiah Senior Center"
              className="w-16 h-16 md:w-20 md:h-20"
            />
          </a>

          {/* Back to Home Button */}
          <a
            href="https://ukiahseniorcenter.org"
            className="text-white px-6 py-3 font-['Montserrat',sans-serif] font-semibold text-sm md:text-base hover:opacity-80 transition-all duration-300"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </header>
  );
}
