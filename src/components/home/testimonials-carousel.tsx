
"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { testimonials } from "@/lib/data";
import Autoplay from "embla-carousel-autoplay";
import * as React from 'react';
import { Star } from "lucide-react";

export function TestimonialsCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    return (
        <section className="py-20 lg:py-28 bg-background">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-16">
                    <h2 className="font-headline text-4xl font-bold text-primary">Depoimentos</h2>
                    <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                        O carinho e a gratidão de quem confia em nosso trabalho.
                    </p>
                </div>

                <Carousel
                    plugins={[plugin.current]}
                    className="w-full max-w-6xl mx-auto"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent className="-ml-4">
                        {testimonials.map((testimonial, index) => {
                            const testimonialImage = PlaceHolderImages.find(p => p.id === testimonial.imageId);
                            return(
                            <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="bg-white shadow-lg rounded-xl overflow-visible h-full flex flex-col group transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2">
                                        <CardContent className="p-8 text-center flex flex-col items-center flex-grow">
                                             {testimonialImage && (
                                                 <div className="relative w-24 h-24 -mt-20 mb-6 border-4 border-white rounded-full shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110">
                                                    <Image
                                                        src={testimonialImage.imageUrl}
                                                        alt={testimonial.name}
                                                        data-ai-hint={testimonialImage.imageHint}
                                                        fill
                                                        className="object-cover object-top"
                                                    />
                                                </div>
                                             )}
                                             <div className="flex gap-1 text-yellow-400 mb-4">
                                                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                             </div>
                                            <p className="text-base italic text-foreground/80 mb-6 flex-grow">
                                                "{testimonial.quote}"
                                            </p>
                                            <div className="mt-auto text-center">
                                                <p className="font-bold text-lg text-primary">{testimonial.name}</p>
                                                <p className="text-sm text-muted-foreground">Tutor(a) de {testimonial.petName}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        )})}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 text-primary bg-white/80 hover:bg-white border-primary/20 h-10 w-10 -translate-x-12 shadow-md" />
                    <CarouselNext className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 text-primary bg-white/80 hover:bg-white border-primary/20 h-10 w-10 translate-x-12 shadow-md" />
                </Carousel>
            </div>
        </section>
    );
}

