

"use client";

import Link from "next/link";
import { Menu, X, User, Instagram, Facebook } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from 'react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "./logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/memorial", label: "Memorial" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/espaco", label: "Nosso Espaço" },
  { href: "/planos", label: "Planos" },
];

const whatsappUrl = "https://wa.me/551142405253?text=Olá!%20Tudo%20bem?%20Gostaria%20de%20ser%20atendido%20e%20saber%20mais";


export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "border-b bg-white/70 backdrop-blur-sm" : "bg-white"
      )}>
      <div className={cn(
          "container flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-16" : "h-20"
        )}>
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
           <Link href="/contato" className={cn("transition-colors hover:text-primary", pathname === "/contato" ? "text-primary" : "text-gray-600")}>
              Contato
            </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
           <Button asChild>
            <Link href={whatsappUrl} target="_blank">
              Fale Conosco
            </Link>
          </Button>
           <Button asChild variant="ghost" size="icon" className="group" title="Área do Funcionário">
            <Link href="/admin/login">
              <User className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full">
              <div className="flex flex-col h-full p-4">
                <div className="flex justify-between items-center mb-8">
                  <Logo />
                   <SheetClose asChild>
                     <Button variant="ghost" size="icon">
                        <X />
                        <span className="sr-only">Fechar menu</span>
                     </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-6 text-lg font-medium">
                  {navLinks.map((link) => (
                     <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "transition-colors hover:text-primary",
                            pathname === link.href ? "text-primary" : "text-gray-700"
                          )}
                        >
                          {link.label}
                        </Link>
                     </SheetClose>
                  ))}
                   <SheetClose asChild>
                        <Link
                            href="/contato"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "transition-colors hover:text-primary",
                                pathname === "/contato" ? "text-primary" : "text-gray-700"
                            )}
                        >
                            Contato
                        </Link>
                    </SheetClose>
                     <SheetClose asChild>
                        <Link
                            href="/admin/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 text-gray-700 transition-colors hover:text-primary"
                        >
                            <User />
                            Login
                        </Link>
                    </SheetClose>
                </nav>
                 <div className="mt-auto flex flex-col gap-4">
                    <Button asChild size="lg">
                        <Link href={whatsappUrl} target="_blank">
                            Fale Conosco
                        </Link>
                    </Button>
                    <div className="flex justify-center gap-4">
                         <a href="https://www.instagram.com/petestrelacrematorio/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors"><Instagram size={24} /></a>
                         <a href="https://www.instagram.com/petestrelacrematorio/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors"><Facebook size={24} /></a>
                    </div>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

    