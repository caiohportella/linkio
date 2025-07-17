const Footer = () => {
  return (
    <footer className="absolute bottom-4 text-xs text-muted-foreground z-10">
      © {new Date().getFullYear()} Linkio — All rights reserved.
    </footer>
  );
};
export default Footer;
