
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LocationMap() {
    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="container mx-auto max-w-7xl px-4">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-4xl font-bold text-primary">Como Chegar</h2>
                    <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                        Estamos localizados em um ponto de fácil acesso para sua conveniência.
                    </p>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden border shadow-lg">
                     <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3661.1685329881093!2d-46.33158062375836!3d-23.41801915647565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce7b1e2e987979%3A0x88504997063a4362!2sAv.%20Ad%C3%ADlia%20Barbosa%20Neves%2C%202740%20-%20Centro%20Industrial%2C%20Aruj%C3%A1%20-%20SP%2C%2007432-575!5e0!3m2!1spt-BR!2sbr!4v1719262963162!5m2!1spt-BR!2sbr"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                 <div className="mt-8 text-center space-y-4">
                    <p className="text-muted-foreground">Av. Adília Barbosa Neves, 2740 - Centro Industrial, Arujá - SP, 07432-575</p>
                    <div className="flex justify-center gap-4">
                        <Button asChild>
                            <Link href="https://www.google.com/maps/dir//Av.+Ad%C3%ADlia+Barbosa+Neves,+2740+-+Centro+Industrial,+Aruj%C3%A1+-+SP,+07432-575/@-23.4180192,-46.3315806,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x94ce7b1e2e987979:0x88504997063a4362!2m2!1d-46.3290057!2d-23.418024" target="_blank">
                                Rotas
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                             <Link href="https://www.google.com/maps/place/Av.+Ad%C3%ADlia+Barbosa+Neves,+2740+-+Centro+Industrial,+Aruj%C3%A1+-+SP,+07432-575/@-23.4180192,-46.3315806,17z/data=!3m1!4b1!4m6!3m5!1m1!1s0x94ce7b1e2e987979:0x88504997063a4362!2m2!1d-46.3290057!2d-23.418024" target="_blank">
                                Ver mapa ampliado
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
    
