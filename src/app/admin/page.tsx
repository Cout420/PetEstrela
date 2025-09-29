
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getApps } from 'firebase/app';
import { app } from '@/lib/firebase-config'; 
import { getContent, saveContent, uploadImage } from '@/lib/firebase-service';

import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { aboutPageContent as initialAboutPageContent } from '@/lib/about-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { plans as initialPlansData } from '@/lib/mock-data';
import { memorialPageContent as initialMemorialPageContent } from '@/lib/memorial-content';
import Image from 'next/image';
import { X, PlusCircle, Upload, Loader2, LogOut } from 'lucide-react';

// --- Zod Schemas for Validation ---

const generalContentSchema = z.object({
  whatsappLink: z.string().url({ message: 'URL do WhatsApp inválida.' }),
  whatsappNumber: z.string().min(1, 'Número do WhatsApp é obrigatório.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
  address: z.string().min(1, 'Endereço é obrigatório.'),
  instagramLink: z.string().url({ message: 'URL do Instagram inválida.' }),
});

const heroSlideSchema = z.object({
  imageUrl: z.string().url({ message: 'URL da imagem inválida.' }),
  title: z.string().min(1, 'Título é obrigatório.'),
  subtitle: z.string().min(1, 'Subtítulo é obrigatório.'),
});

const whyChooseUsItemSchema = z.object({
  icon: z.string().min(1, 'Ícone é obrigatório.'),
  title: z.string().min(1, 'Título é obrigatório.'),
  description: z.string().min(1, 'Descrição é obrigatória.'),
});

const processStepSchema = z.object({
  step: z.string().min(1, 'Passo é obrigatório.'),
  title: z.string().min(1, 'Título é obrigatório.'),
  description: z.string().min(1, 'Descrição é obrigatória.'),
});

const homePageSchema = z.object({
  heroSlides: z.array(heroSlideSchema),
  whyChooseUs: z.object({
    title: z.string().min(1, 'Título é obrigatório.'),
    description: z.string().min(1, 'Descrição é obrigatória.'),
    items: z.array(whyChooseUsItemSchema),
  }),
  cremationProcess: z.object({
    title: z.string().min(1, 'Título é obrigatório.'),
    description: z.string().min(1, 'Descrição é obrigatória.'),
    steps: z.array(processStepSchema),
  }),
  allPetsSection: z.object({
    title: z.string().min(1, 'Título é obrigatório.'),
    description: z.string().min(1, 'Descrição é obrigatória.'),
    imageUrl: z.string().url({ message: 'URL da imagem inválida.' }),
    petsList: z.array(z.string().min(1, 'Nome do pet é obrigatório.')),
  }),
});

const aboutPageSchema = z.object({
  headerTitle: z.string().min(1, 'Título do cabeçalho é obrigatório.'),
  headerDescription: z.string().min(1, 'Descrição do cabeçalho é obrigatória.'),
  missionTitle: z.string().min(1, 'Título da missão é obrigatório.'),
  missionDescription: z.string().min(1, 'Descrição da missão é obrigatória.'),
  missionImageUrl: z.string().url({ message: 'URL da imagem da missão inválida.' }),
  historyTitle: z.string().min(1, 'Título da história é obrigatório.'),
  historyDescription: z.string().min(1, 'Descrição da história é obrigatória.'),
  historyImageUrl: z.string().url({ message: 'URL da imagem da história inválida.' }),
});

const ourSpaceGalleryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título é obrigatório.'),
  imageUrl: z.string().url({ message: 'URL da imagem inválida.' }),
});

const ourSpacePageSchema = z.object({
  headerTitle: z.string().min(1, 'Título do cabeçalho é obrigatório.'),
  headerDescription: z.string().min(1, 'Descrição do cabeçalho é obrigatória.'),
  gallery: z.array(ourSpaceGalleryItemSchema),
});

const planSchema = z.object({
  name: z.string().min(1, 'Nome do plano é obrigatório.'),
  price: z.string().min(1, 'Preço é obrigatório.'),
  description: z.string().min(1, 'Descrição é obrigatória.'),
  features: z.array(z.string().min(1, 'Característica é obrigatória.')),
  pricingDetails: z.array(z.string()).optional(),
  optional: z.string().optional(),
  isMostChosen: z.boolean(),
});

const plansPageSchema = z.object({
  plans: z.array(planSchema),
});

const memorialPageSchema = z.object({
  heroImageUrl: z.string().url({ message: 'URL da imagem do herói inválida.' }),
  heroTitle: z.string().min(1, 'Título do herói é obrigatório.'),
  heroDescription1: z.string().min(1, 'Descrição 1 do herói é obrigatória.'),
  heroDescription2: z.string().min(1, 'Descrição 2 do herói é obrigatória.'),
  createMemorialTitle: z.string().min(1, 'Título para criar memorial é obrigatório.'),
  createMemorialDescription: z.string().min(1, 'Descrição para criar memorial é obrigatória.'),
});

const adminSchema = z.object({
  generalContent: generalContentSchema,
  homePageContent: homePageSchema,
  aboutPageContent: aboutPageSchema,
  ourSpacePageContent: ourSpacePageSchema,
  plansPageContent: plansPageSchema,
  memorialPageContent: memorialPageSchema,
});

type GeneralContent = z.infer<typeof generalContentSchema>;
type HomePageContent = z.infer<typeof homePageSchema>;
type AboutPageContent = z.infer<typeof aboutPageSchema>;
type OurSpacePageContent = z.infer<typeof ourSpacePageSchema>;
type PlansPageContent = z.infer<typeof plansPageSchema>;
type MemorialPageContent = z.infer<typeof memorialPageSchema>;

const AdminPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const auth = getApps().length ? getAuth(app) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});

  const methods = useForm({
    resolver: zodResolver(adminSchema),
    mode: 'onChange',
    defaultValues: {
      generalContent: { whatsappLink: '', whatsappNumber: '', phone: '', address: '', instagramLink: '' },
      homePageContent: initialHomePageContent,
      aboutPageContent: initialAboutPageContent,
      ourSpacePageContent: initialOurSpaceContent,
      plansPageContent: { plans: initialPlansData },
      memorialPageContent: initialMemorialPageContent,
    }
  });

  const { reset, control, setValue, getValues, watch } = methods;

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        generalContent,
        homeContent,
        aboutContent,
        ourSpaceContent,
        plansContent,
        memorialContent,
      ] = await Promise.all([
        getContent<GeneralContent>('generalContent'),
        getContent<HomePageContent>('homePageContent'),
        getContent<AboutPageContent>('aboutPageContent'),
        getContent<OurSpacePageContent>('ourSpaceContent'),
        getContent<PlansPageContent>('plansPageContent'),
        getContent<MemorialPageContent>('memorialPageContent'),
      ]);

      reset({
        generalContent: generalContent || { whatsappLink: '', whatsappNumber: '', phone: '', address: '', instagramLink: '' },
        homePageContent: homeContent || initialHomePageContent,
        aboutPageContent: aboutContent || initialAboutPageContent,
        ourSpacePageContent: ourSpaceContent || initialOurSpaceContent,
        plansPageContent: plansContent || { plans: initialPlansData },
        memorialPageContent: memorialContent || initialMemorialPageContent,
      });

    } catch (error) {
      console.error("Failed to load content:", error);
      toast({
        title: 'Erro ao Carregar Conteúdo',
        description: 'Não foi possível carregar os dados do site. Tente recarregar a página.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    if (!auth) {
        setTimeout(() => router.push('/login'), 100);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticating(false);
        loadContent();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router, loadContent]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: 'Você saiu da sua conta.' });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível fazer o logout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingState(prev => ({ ...prev, [fieldName]: true }));

    try {
        const directory = `site-content/${fieldName.split('.').slice(0, -1).join('/')}`;
        const imageUrl = await uploadImage(file, directory);
        setValue(fieldName, imageUrl, { shouldValidate: true, shouldDirty: true });
        toast({
            title: 'Upload Concluído',
            description: 'A imagem foi carregada com sucesso.',
        });
    } catch (error) {
        console.error("Upload failed:", error);
        toast({
            title: 'Falha no Upload',
            description: 'Não foi possível carregar a imagem. Verifique o console para mais detalhes.',
            variant: 'destructive',
        });
    } finally {
        setUploadingState(prev => ({ ...prev, [fieldName]: false }));
    }
};


  const FileUploadButton = ({ fieldName }: { fieldName: string }) => {
    const isUploading = uploadingState[fieldName];
    return (
        <div className="relative flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="flex-shrink-0">
                <label htmlFor={fieldName}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Trocar Imagem
                </label>
            </Button>
            <input
                id={fieldName}
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="sr-only"
                onChange={(e) => handleFileUpload(e, fieldName)}
                disabled={isUploading}
            />
        </div>
    );
};

  const onSubmit = async () => {
    const data = getValues();
    try {
      await Promise.all([
        saveContent('generalContent', data.generalContent),
        saveContent('homePageContent', data.homePageContent),
        saveContent('aboutPageContent', data.aboutPageContent),
        saveContent('ourSpacePageContent', data.ourSpacePageContent),
        saveContent('plansPageContent', data.plansPageContent),
        saveContent('memorialPageContent', data.memorialPageContent),
      ]);
      toast({
        title: 'Sucesso!',
        description: 'O conteúdo do site foi salvo com sucesso.',
      });
    } catch (error) {
      console.error('Failed to save content:', error);
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o conteúdo. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    }
  };

  const renderImagePreview = (url: string) => {
    if (!url || typeof url !== 'string') return null;
    try {
      new URL(url); 
      return <Image src={url} alt="Preview" width={40} height={40} className="rounded-md object-cover" />;
    } catch {
      return null;
    }
  };
  
  if (isAuthenticating || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Carregando painel...</p>
      </div>
    );
  }
  
  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <div className="container mx-auto">
           <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie o conteúdo do seu site.</p>
            </div>
             <Button onClick={handleSignOut} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
            </Button>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
              <TabsTrigger value="our-space">Nosso Espaço</TabsTrigger>
              <TabsTrigger value="plans">Planos</TabsTrigger>
              <TabsTrigger value="memorial">Memorial</TabsTrigger>
            </TabsList>
            
            {/* General Content Form */}
            <TabsContent value="general">
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Gerais</CardTitle>
                    <CardDescription>Informações de contato e links globais do site.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField name="generalContent.whatsappLink" control={control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do WhatsApp</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField name="generalContent.whatsappNumber" control={control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do WhatsApp (para exibição)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField name="generalContent.phone" control={control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (para exibição)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField name="generalContent.address" control={control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="generalContent.instagramLink" control={control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do Instagram</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
                <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={methods.formState.isSubmitting}>
                    {methods.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Configurações Gerais
                </Button>
              </form>
            </TabsContent>

            {/* Home Page Form */}
            <TabsContent value="home">
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Página Home</CardTitle>
                    <CardDescription>Edite o conteúdo da página principal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                     {/* Hero Slides */}
                    <FieldArraySection
                        name="homePageContent.heroSlides"
                        title="Slides do Herói"
                        description="Adicione, remova ou edite os slides principais."
                        renderItem={(index: number) => (
                            <>
                                <FormField name={`homePageContent.heroSlides.${index}.title`} control={control} render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name={`homePageContent.heroSlides.${index}.subtitle`} control={control} render={({ field }) => (
                                    <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name={`homePageContent.heroSlides.${index}.imageUrl`} control={control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL da Imagem</FormLabel>
                                        <FormControl>
                                             <div className='flex items-center gap-2'>
                                               <Input {...field} />
                                               {renderImagePreview(field.value)}
                                               <FileUploadButton fieldName={`homePageContent.heroSlides.${index}.imageUrl`} />
                                             </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </>
                        )}
                        defaultItem={{ imageUrl: '', title: '', subtitle: '' }}
                    />
                    
                     {/* Why Choose Us */}
                    <FieldGroup title="Seção 'Por Que Escolher-nos?'">
                         <FormField name="homePageContent.whyChooseUs.title" control={control} render={({ field }) => (
                            <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="homePageContent.whyChooseUs.description" control={control} render={({ field }) => (
                            <FormItem><FormLabel>Descrição Principal</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FieldArraySection
                            name="homePageContent.whyChooseUs.items"
                            title="Itens"
                            renderItem={(index: number) => (
                                <>
                                    <FormField name={`homePageContent.whyChooseUs.items.${index}.icon`} control={control} render={({ field }) => (
                                       <FormItem><FormLabel>Ícone (Nome do Lucide Icon)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name={`homePageContent.whyChooseUs.items.${index}.title`} control={control} render={({ field }) => (
                                       <FormItem><FormLabel>Título do Item</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name={`homePageContent.whyChooseUs.items.${index}.description`} control={control} render={({ field }) => (
                                       <FormItem><FormLabel>Descrição do Item</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </>
                            )}
                            defaultItem={{ icon: 'Heart', title: '', description: '' }}
                        />
                    </FieldGroup>
                  </CardContent>
                </Card>
                 <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={methods.formState.isSubmitting}>
                    {methods.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Página Home
                </Button>
              </form>
            </TabsContent>

             {/* About Page Form */}
            <TabsContent value="about">
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader><CardTitle>Página Sobre</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                             <FormField name="aboutPageContent.headerTitle" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Título do Cabeçalho</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="aboutPageContent.headerDescription" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="aboutPageContent.missionTitle" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Título da Missão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="aboutPageContent.missionDescription" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição da Missão</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name={`aboutPageContent.missionImageUrl`} control={control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem da Missão</FormLabel>
                                    <FormControl>
                                         <div className='flex items-center gap-2'>
                                           <Input {...field} />
                                            {renderImagePreview(field.value)}
                                            <FileUploadButton fieldName={`aboutPageContent.missionImageUrl`} />
                                         </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="aboutPageContent.historyTitle" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Título da História</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="aboutPageContent.historyDescription" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição da História</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name={`aboutPageContent.historyImageUrl`} control={control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem da História</FormLabel>
                                    <FormControl>
                                         <div className='flex items-center gap-2'>
                                           <Input {...field} />
                                           {renderImagePreview(field.value)}
                                            <FileUploadButton fieldName={`aboutPageContent.historyImageUrl`} />
                                         </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={methods.formState.isSubmitting}>
                        {methods.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Página Sobre
                    </Button>
                </form>
            </TabsContent>
            
            {/* Our Space Page Form */}
            <TabsContent value="our-space">
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader><CardTitle>Página Nosso Espaço</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                             <FormField name="ourSpacePageContent.headerTitle" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Título do Cabeçalho</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="ourSpacePageContent.headerDescription" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FieldArraySection
                                name="ourSpacePageContent.gallery"
                                title="Galeria de Imagens"
                                renderItem={(index: number) => (
                                    <>
                                        <FormField name={`ourSpacePageContent.gallery.${index}.title`} control={control} render={({ field }) => (
                                           <FormItem><FormLabel>Título da Imagem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name={`ourSpacePageContent.gallery.${index}.imageUrl`} control={control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL da Imagem</FormLabel>
                                                <FormControl>
                                                     <div className='flex items-center gap-2'>
                                                       <Input {...field} />
                                                       {renderImagePreview(field.value)}
                                                        <FileUploadButton fieldName={`ourSpacePageContent.gallery.${index}.imageUrl`} />
                                                     </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </>
                                )}
                                defaultItem={{ id: `new-${Date.now()}`, title: '', imageUrl: '' }}
                            />
                        </CardContent>
                    </Card>
                    <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={methods.formState.isSubmitting}>
                        {methods.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Página Nosso Espaço
                    </Button>
                </form>
            </TabsContent>

            {/* Plans Page Form */}
             <TabsContent value="plans">
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader><CardTitle>Página de Planos</CardTitle></CardHeader>
                        <CardContent>
                             <FieldArraySection
                                name="plansPageContent.plans"
                                title="Planos de Cremação"
                                renderItem={(planIndex: number) => (
                                    <>
                                        <FormField name={`plansPageContent.plans.${planIndex}.name`} control={control} render={({ field }) => (
                                           <FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField name={`plansPageContent.plans.${planIndex}.price`} control={control} render={({ field }) => (
                                           <FormItem><FormLabel>Preço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField name={`plansPageContent.plans.${planIndex}.description`} control={control} render={({ field }) => (
                                           <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name={`plansPageContent.plans.${planIndex}.isMostChosen`} control={control} render={({ field }) => (
                                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                               <div className="space-y-0.5"><FormLabel>É o mais escolhido?</FormLabel></div>
                                               <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="form-checkbox h-5 w-5 text-primary" /></FormControl>
                                           </FormItem>
                                        )} />
                                        <FieldArraySection
                                            name={`plansPageContent.plans.${planIndex}.features`}
                                            title="Características"
                                            renderItem={(featureIndex: number) => (
                                                <FormField name={`plansPageContent.plans.${planIndex}.features.${featureIndex}`} control={control} render={({ field }) => (
                                                    <FormItem><FormLabel>Característica</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            )}
                                            defaultItem={""}
                                            isSub
                                        />
                                    </>
                                )}
                                defaultItem={{ name: '', price: '', description: '', features: [], isMostChosen: false }}
                            />
                        </CardContent>
                    </Card>
                    <Button type="submit" className="mt-6" disabled={methods.formState.isSubmitting}>
                         {methods.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Salvar Página de Planos
                    </Button>
                </form>
            </TabsContent>
            
            {/* Memorial Page Form */}
            <TabsContent value="memorial">
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader><CardTitle>Página do Memorial</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <FormField name="memorialPageContent.heroImageUrl" control={control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da Imagem do Herói</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center gap-2'>
                                            <Input {...field} />
                                            {renderImagePreview(field.value)}
                                            <FileUploadButton fieldName="memorialPageContent.heroImageUrl" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="memorialPageContent.heroTitle" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Título do Herói</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="memorialPageContent.heroDescription1" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição 1</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="memorialPageContent.heroDescription2" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição 2</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="memorialPageContent.createMemorialTitle" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Título do Card "Criar Memorial"</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="memorialPageContent.createMemorialDescription" control={control} render={({ field }) => (
                                <FormItem><FormLabel>Descrição do Card "Criar Memorial"</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    <Button type="submit" className="mt-6" disabled={methods.formState.isSubmitting}>
                        {methods.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Página do Memorial
                    </Button>
                </form>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </FormProvider>
  );
};

// Helper Components for Array Fields

const FieldGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4 rounded-lg border p-4">
        <h4 className="font-semibold text-lg">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);

const FieldArraySection = ({ name, title, description, renderItem, defaultItem, isSub = false }: any) => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name });

    const cardClass = isSub ? "border-dashed" : "shadow-sm";
    const titleClass = isSub ? "font-medium text-base" : "font-semibold text-lg";

    return (
        <div className={`space-y-4 rounded-lg border p-4 ${cardClass}`}>
            <div className="flex items-center justify-between">
                <div>
                  <h4 className={titleClass}>{title}</h4>
                  {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append(defaultItem)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                </Button>
            </div>
            <div className="space-y-6">
                {fields.map((item, index) => (
                    <div key={item.id} className="relative rounded-md border bg-muted/50 p-4 pr-12">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="space-y-4">
                           {renderItem(index)}
                        </div>
                    </div>
                ))}
                {fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum item adicionado.</p>}
            </div>
        </div>
    );
};


export default AdminPage;
