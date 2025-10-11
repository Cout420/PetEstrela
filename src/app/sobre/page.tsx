
import Image from "next/image";
import { Heart, ShieldCheck, Sparkles, PawPrint } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

const values = [
    {
        icon: <Heart className="w-8 h-8 text-primary" />,
        title: "Respeito Incondicional",
        description: "Tratamos cada pet com a dignidade e o amor que eles merecem, como verdadeiros membros da família."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: "Cuidado e Transparência",
        description: "Oferecemos um processo transparente e acolhedor, garantindo paz de espírito em um momento delicado."
    },
    {
        icon: <Sparkles className="w-8 h-8 text-primary" />,
        title: "Memória Viva",
        description: "Acreditamos que a despedida pode se transformar em uma bela homenagem que celebra a vida e o amor."
    }
]

export default function SobrePage() {

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <video
                    src="https://i.imgur.com/0gU3GKf.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative container mx-auto max-w-7xl h-full flex flex-col items-center justify-center text-center text-white p-4 z-10">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold drop-shadow-lg">Nossa História</h1>
                    <p className="mt-4 text-xl max-w-2xl drop-shadow-lg">Movidos pelo amor incondicional que os pets nos oferecem.</p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="font-headline text-4xl text-primary mb-6">Nossa Missão é Honrar a Memória</h2>
                    <div className="text-lg text-foreground/80 space-y-6 leading-relaxed max-w-3xl mx-auto">
                        <p>
                            O Pet Estrela Crematório nasceu de um sentimento profundo: a dor da perda de um companheiro fiel e o desejo de oferecer uma despedida que estivesse à altura de tanto amor e lealdade. A empresa foi fundada a partir da experiência de anos testemunhando a dificuldade dos tutores em encontrar um serviço de cremação que fosse ao mesmo tempo profissional, respeitoso e acolhedor.
                        </p>
                        <p>
                            Entendemos que um pet não é "apenas um animal". Ele é parte da família, um confidente, uma fonte de alegria pura. Por isso, nossa missão vai além da cremação. Buscamos oferecer um ombro amigo, um processo transparente e, acima de tudo, um espaço para que as memórias mais preciosas sejam celebradas e eternizadas.
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Values Section */}
            <section className="py-20 lg:py-28 bg-background">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <h2 className="font-headline text-4xl text-primary mb-16">Nossos Valores</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value) => (
                           <Card key={value.title} className="text-center shadow-lg hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 bg-white p-8">
                                <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="font-headline text-2xl mb-2 text-primary">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
             {/* Quote Section */}
             <section className="py-20 lg:py-28 bg-white">
                 <div className="container mx-auto max-w-4xl px-4 text-center">
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0 shadow-xl overflow-hidden">
                        <CardContent className="p-12 relative">
                             <PawPrint className="absolute top-4 left-6 h-20 w-20 text-primary/10 opacity-80" />
                             <p className="font-headline text-3xl md:text-4xl text-primary/90 relative z-10">
                                “O amor não conhece raça, espécie ou fim. Ele apenas se transforma.”
                            </p>
                             <PawPrint className="absolute bottom-4 right-6 h-20 w-20 text-accent/10 opacity-80" />
                        </CardContent>
                    </Card>
                </div>
             </section>
        </div>
    );
}
