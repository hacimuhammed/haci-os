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
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-all font-bold px-5"
          >
            Try Now
          </Button>
        </div>
      </header>

      {/* Hero Bölümü */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black to-zinc-900 text-white pt-16">
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
                <span>Dünyada İlk</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-500 to-violet-500">
              haciOS
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mt-6">
              Cloud'a bağlı, web tabanlı, yapay zeka destekli yeni nesil işletim
              sistemi
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-10">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-all px-8 font-bold"
            >
              Şimdi Deneyin
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-zinc-900/60 border-zinc-700 text-white hover:bg-zinc-800/70 backdrop-blur-sm px-8 font-bold"
            >
              Daha Fazla Bilgi
            </Button>
          </div>

          <div className="mt-16 relative w-full max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg blur opacity-25"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <Image
                src="/wallpapers/Plucky_Puffin_Dark.webp"
                alt="haciOS Arayüzü"
                width={1200}
                height={675}
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
              Geleceğin İşletim Sistemi
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Bulut tabanlı, yapay zeka destekli ve tamamen web üzerinde çalışan
              modern işletim sistemi deneyimi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-blue-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideCloudCog className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bulut Tabanlı</h3>
              <p className="text-zinc-400">
                Verilerin ve ayarların bulutta saklanır, tüm cihazlar arasında
                sorunsuz senkronize edilir.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-violet-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideCommand className="text-violet-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Destekli</h3>
              <p className="text-zinc-400">
                Yapay zeka asistanı ile görevlerinizi hızlandırın ve
                üretkenliğinizi artırın.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-sky-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideServer className="text-sky-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Web Tabanlı</h3>
              <p className="text-zinc-400">
                Herhangi bir tarayıcıdan erişin, kuruluma gerek yok, anında
                çalışmaya başlayın.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-emerald-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideCpu className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Yüksek Performans</h3>
              <p className="text-zinc-400">
                Optimum kaynak kullanımı ile her cihazda akıcı bir deneyim
                sağlar.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="bg-amber-500/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-5">
                <LucideShield className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Güvenli</h3>
              <p className="text-zinc-400">
                Uçtan uca şifreleme ve modern güvenlik protokolleriyle
                verileriniz koruma altında.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="text-center flex flex-col items-center justify-center h-full">
                <p className="text-xl font-semibold mb-4 text-zinc-300">
                  Ve daha fazlası...
                </p>
                <Button
                  variant="ghost"
                  className="text-blue-400 group-hover:text-blue-300 group-hover:underline font-bold"
                >
                  Tüm Özellikleri Keşfedin
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
              Geleceğin İşletim Sistemini Şimdi Deneyin
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Tamamen ücretsiz olarak kaydolun, bulut tabanlı işletim
              sisteminizi kurun ve geleceğin teknolojisini bugün deneyimleyin.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-all px-10 font-bold"
            >
              Hemen Başlayın
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 bg-black text-zinc-500 border-t border-zinc-900">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-sm">© 2024 haciOS. Tüm hakları saklıdır.</p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Gizlilik
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Şartlar
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                İletişim
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
