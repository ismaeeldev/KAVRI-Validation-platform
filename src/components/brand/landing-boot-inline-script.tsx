/** Runs before paint on first visit — hides page content until boot completes. */
export function LandingBootInlineScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var seen="kavri-boot-seen";if(sessionStorage.getItem(seen))return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.documentElement.classList.add("lp-boot-active");document.documentElement.style.overflow="hidden";if(!sessionStorage.getItem("kavri-boot-start"))sessionStorage.setItem("kavri-boot-start",String(Date.now()));}catch(e){}})();`,
      }}
    />
  );
}
