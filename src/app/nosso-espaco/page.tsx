import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';

const galleryImages = [
  { id: 'space-reception', title: 'Recepção Acolhedora' },
  { id: 'space-chapel', title: 'Sala de Despedida' },
  { id: 'space-crematory', title: 'Equipamento Moderno' },
  { id: 'space-garden', title: 'Jardim Memorial' },
  { id: 'space-urns', title: 'Opções de Urnas' },
  { id: 'space-facade', title: 'Fachada Pet Estrela' },
];

export default function OurSpacePage() {
  return (
    <>
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="animate-fade-in font-headline text-4xl font-bold text-gradient-luxury md:text-6xl">
            Nosso Espaço
          </h1>
          <p className="animate-fade-in mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            Um ambiente pensado para oferecer paz, conforto e respeito. Conheça as instalações do Pet Estrela, preparadas para proporcionar uma despedida digna e serena ao seu companheiro.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((item, index) => {
              const image = PlaceHolderImages.find((img) => img.id === item.id);
              return (
                <Card
                  key={index}
                  className="animate-slide-up luxury-card group overflow-hidden"
                >
                  {image && (
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        data-ai-hint={image.imageHint}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-headline text-xl font-semibold text-primary">
                      {item.title}
                    </h3>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
