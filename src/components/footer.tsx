export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Site Info"
      className="flex flex-col justify-center items-center text-[color:var(--footer-text)] py-6 text-sm border-t border-[var(--main-border-color)]"
    >
      <p className="m-0">
        © <time>{year}</time>{" "}
        <a
          href="https://github.com/shortnaas"
          className="text-[color:var(--link-color)] hover:underline"
        >
          Naas
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
