
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

const galleryImages = [
    { id: 'space-gallery-1', title: 'Jardim Memorial', description: 'Um lugar de paz e reflexão.' },
    { id: 'space-gallery-2', title: 'Sala de Cerimônia', description: 'Ambiente acolhedor para a última despedida.' },
    { id: 'space-gallery-3', title: 'Recepção', description: 'Atendimento humanizado e discreto.' },
    { id: 'space-gallery-4', title: 'Estrutura Moderna', description: 'Equipamentos e instalações de ponta.' },
];

export default function EspacoPage() {
    const videoThumb = PlaceHolderImages.find(p => p.id === 'space-video-thumb');

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[300px] bg-cover bg-center">
                 <Image
                    src="https://i.imgur.com/W616oG4.jpeg"
                    alt="Recepção do crematório"
                    fill
                    className="object-cover"
                 />
                 <div className="absolute inset-0 bg-black/50" />
                 <div className="relative container mx-auto max-w-7xl h-full flex flex-col items-center justify-center text-center text-white p-4 z-10">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold drop-shadow-lg">Nosso Espaço</h1>
                    <p className="mt-4 text-xl max-w-2xl drop-shadow-md">Um ambiente pensado para o conforto, a paz e a dignidade.</p>
                </div>
            </section>

             {/* Gallery Section */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-headline text-4xl text-primary mb-6">Conheça Nossas Instalações</h2>
                         <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                           Cada detalhe foi planejado para oferecer um acolhimento sereno em um momento de dor.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {galleryImages.map(item => {
                            const image = PlaceHolderImages.find(p => p.id === item.id);
                            return (
                                <Card key={item.id} className="group overflow-hidden shadow-lg w-full">
                                    <div className="relative aspect-video">
                                        {image && (
                                            <Image
                                                src={image.imageUrl}
                                                alt={item.title}
                                                data-ai-hint={image.imageHint}
                                                fill
                                                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-6 text-white">
                                            <h3 className="font-headline text-2xl font-bold">{item.title}</h3>
                                            <p className="text-sm opacity-90">{item.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="py-20 lg:py-28 bg-background">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="font-headline text-4xl text-primary mb-12">Tour Virtual</h2>
                    <Card className="overflow-hidden shadow-2xl">
                         <div className="relative aspect-video">
                            <video
                                src="https://i.imgur.com/T7zd0Jd.mp4"
                                controls
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
