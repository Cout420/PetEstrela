'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { getContent } from '@/lib/firebase-service';

type OurSpaceContent = typeof initialOurSpaceContent;

export default function OurSpacePage() {
  const [content, setContent] = useState<OurSpaceContent>(initialOurSpaceContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const dbContent = await getContent<OurSpaceContent>('ourSpaceContent');
      if (dbContent) {
        setContent(dbContent);
      }
      setIsLoading(false);
    }
    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="animate-fade-in font-headline text-4xl font-bold text-gradient-luxury md:text-6xl">
            {content.headerTitle}
          </h1>
          <p className="animate-fade-in mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            {content.headerDescription}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {content.gallery.map((item, index) => (
              <Card
                key={index}
                className="animate-slide-up luxury-card group overflow-hidden"
              >
                {item.imageUrl && (
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

    
