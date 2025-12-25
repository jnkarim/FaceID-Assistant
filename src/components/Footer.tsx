import { Github, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-lime-400">FaceID</div>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400 text-sm">
              Smart Recognition System
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jnkarim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-lime-400 transition"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/jnkarim/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-lime-400 transition"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:julkernkarim@gmail.com"
              className="text-neutral-400 hover:text-lime-400 transition"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
