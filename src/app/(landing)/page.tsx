import {
  LucideCloudCog,
  LucideCommand,
  LucideCpu,
  LucideServer,
  LucideShield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-zinc-800/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-500 to-violet-500"
          >
            haciOS
          </Link>
          <Link href="/os">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-all font-bold px-5"
            >
              Try Now
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Bölümü */}
      <section className=" relative h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black to-zinc-900 text-white pt-64">
        {/* Arkaplan animasyonu için */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] z-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(100,100,255,0.1),transparent_70%)]"></div>
        </div>

        {/* Hero içeriği */}
        <div className="container relative z-10 px-6 md:px-10 flex flex-col items-center text-center space-y-10">
          <div className="space-y-4">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-2 rounded-full px-4 py-1 text-sm bg-zinc-800/60 border border-zinc-700 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span>Worlds First</span>
              </div>
            </div>
            <div>
              <a className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-500 to-violet-500">
                haciOS
              </a>
            </div>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mt-6">
              Connect to the cloud, web-based, AI-powered, next-generation
              operating system for your company.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-10">
            <Link href="/os">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-all px-8 font-bold h-14 rounded-full"
              >
                Try Now
              </Button>
            </Link>
          </div>

          <div className="mt-16 relative w-full max-w-5xl">
            <div className="absolute -inset-1 opacity-20"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-visible">
              <Image
                src="/landing/landing.png"
                alt="haciOS Arayüzü"
                width={1920}
                height={1080}
                className="w-full h-auto rounded-lg shadow-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Alt kısım için kaydır oku */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Özellikler Bölümü */}
      <section className="py-28 bg-zinc-950 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              The Future of Operating Systems
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Cloud-based, AI-powered, and web-based modern operating system
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-blue-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideCloudCog className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cloud-Based</h3>
              <p className="text-zinc-400">
                Data and settings are stored in the cloud, and are seamlessly
                synchronized across all devices.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-violet-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideCommand className="text-violet-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-zinc-400">
                Accelerate your tasks and increase your productivity with an AI
                assistant.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-sky-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideServer className="text-sky-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Web-Based</h3>
              <p className="text-zinc-400">
                Access from any browser, no installation required, start working
                immediately.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-emerald-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideCpu className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">High Performance</h3>
              <p className="text-zinc-400">
                Optimize resource usage for optimal performance on all devices.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-amber-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideShield className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure</h3>
              <p className="text-zinc-400">
                Data is encrypted and protected with modern security protocols.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="text-center flex flex-col items-center justify-center h-full">
                <p className="text-xl font-semibold mb-4 text-zinc-300">
                  And more...
                </p>
                <Button
                  variant="ghost"
                  className="text-blue-400 group-hover:text-blue-300 group-hover:underline font-bold"
                >
                  Discover All Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bölümü */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-b from-zinc-950 to-black">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] z-0"></div>
        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 mb-6">
              Try the Future of Operating Systems Now
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Sign up for free, install the cloud-based operating system and
              experience the future of technology today.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-all px-10 font-bold"
            >
              Start Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 bg-black text-zinc-500 border-t border-zinc-900">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-sm">
                © {new Date().getFullYear()} haciOS. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
