
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, PlusCircle, Upload, Loader2, LogOut } from 'lucide-react';
import { merge } from 'lodash';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getContent, saveContent, uploadImage } from '@/lib/firebase-service';

import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { aboutPageContent as initialAboutPageContent } from '@/lib/about-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { plans as initialPlansData } from '@/lib/mock-data';
import { memorialPageContent as initialMemorialPageContent } from '@/lib/memorial-content';

// --- Zod Schemas for Validation ---

const generalContentSchema = z.object({
  whatsappLink: z.string().url({ message: 'URL do WhatsApp inválida.' }).min(1, 'Obrigatório'),
  whatsappNumber: z.string().min(1, 'Obrigatório'),
  phone: z.string().min(1, 'Obrigatório'),
  address: z.string().min(1, 'Obrigatório'),
  instagramLink: z.string().url({ message: 'URL do Instagram inválida.' }).min(1, 'Obrigatório'),
});

const heroSlideSchema = z.object({
  imageUrl: z.string().min(1, 'URL da imagem é obrigatória'),
  title: z.string().min(1, 'Obrigatório'),
  subtitle: z.string().min(1, 'Obrigatório'),
});

const whyChooseUsItemSchema = z.object({
  icon: z.string().min(1, 'Obrigatório'),
  title: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
});

const processStepSchema = z.object({
  step: z.string().min(1, 'Obrigatório'),
  title: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
});

const homePageSchema = z.object({
  heroSlides: z.array(heroSlideSchema),
  whyChooseUs: z.object({
    title: z.string().min(1, 'Obrigatório'),
    description: z.string().min(1, 'Obrigatório'),
    items: z.array(whyChooseUsItemSchema),
  }),
  cremationProcess: z.object({
    title: z.string().min(1, 'Obrigatório'),
    description: z.string().min(1, 'Obrigatório'),
    steps: z.array(processStepSchema),
  }),
  allPetsSection: z.object({
    title: z.string().min(1, 'Obrigatório'),
    description: z.string().min(1, 'Obrigatório'),
    imageUrl: z.string().min(1, 'URL da imagem é obrigatória'),
    petsList: z.array(z.string().min(1, 'Obrigatório')),
  }),
});

const aboutPageSchema = z.object({
  headerTitle: z.string().min(1, 'Obrigatório'),
  headerDescription: z.string().min(1, 'Obrigatório'),
  missionTitle: z.string().min(1, 'Obrigatório'),
  missionDescription: z.string().min(1, 'Obrigatório'),
  missionImageUrl: z.string().min(1, 'URL da imagem é obrigatória'),
  historyTitle: z.string().min(1, 'Obrigatório'),
  historyDescription: z.string().min(1, 'Obrigatório'),
  historyImageUrl: z.string().min(1, 'URL da imagem é obrigatória'),
});

const ourSpaceGalleryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Obrigatório'),
  imageUrl: z.string().min(1, 'URL da imagem é obrigatória'),
});

const ourSpacePageSchema = z.object({
  headerTitle: z.string().min(1, 'Obrigatório'),
  headerDescription: z.string().min(1, 'Obrigatório'),
  gallery: z.array(ourSpaceGalleryItemSchema),
});

const planSchema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  price: z.string().min(1, 'Obrigatório'),
  description: z.string().min(1, 'Obrigatório'),
  features: z.array(z.string().min(1, 'Obrigatório')),
  pricingDetails: z.array(z.string()).optional(),
  optional: z.string().optional(),
  isMostChosen: z.boolean(),
});

const plansPageSchema = z.object({
  plans: z.array(planSchema),
});

const memorialPageSchema = z.object({
  heroImageUrl: z.string().min(1, 'URL da imagem é obrigatória'),
  heroTitle: z.string().min(1, 'Obrigatório'),
  heroDescription1: z.string().min(1, 'Obrigatório'),
  heroDescription2: z.string().min(1, 'Obrigatório'),
  createMemorialTitle: z.string().min(1, 'Obrigatório'),
  createMemorialDescription: z.string().min(1, 'Obrigatório'),
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

const initialData = {
  generalContent: { whatsappLink: '', whatsappNumber: '', phone: '', address: '', instagramLink: '' },
  homePageContent: initialHomePageContent,
  aboutPageContent: initialAboutPageContent,
  ourSpacePageContent: initialOurSpaceContent,
  plansPageContent: { plans: initialPlansData },
  memorialPageContent: initialMemorialPageContent,
};


const AdminPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});

  const methods = useForm({
    resolver: zodResolver(adminSchema),
    mode: 'onChange',
    defaultValues: initialData
  });

  const { reset, control, setValue, handleSubmit, watch } = methods;

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
        getContent<OurSpacePageContent>('ourSpacePageContent'),
        getContent<PlansPageContent>('plansPageContent'),
        getContent<MemorialPageContent>('memorialPageContent'),
      ]);
      
      const loadedData = {
        generalContent: generalContent || initialData.generalContent,
        homePageContent: homeContent || initialData.homePageContent,
        aboutPageContent: aboutContent || initialData.aboutPageContent,
        ourSpacePageContent: ourSpaceContent || initialData.ourSpacePageContent,
        plansPageContent: (plansContent && plansContent.plans) ? plansContent : { plans: initialPlansData },
        memorialPageContent: memorialContent || initialData.memorialPageContent,
      };

      const mergedData = merge({}, initialData, loadedData);
      
      reset(mergedData);

    } catch (error) {
      console.error("Failed to load content:", error);
      toast({
        title: 'Erro ao Carregar Conteúdo',
        description: 'Não foi possível carregar os dados do site. Usando dados padrão.',
        variant: 'destructive',
      });
      reset(initialData);
    } finally {
      setIsLoading(false);
    }
  }, [reset, toast]);


  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSignOut = () => {
    toast({ title: 'Você saiu da sua conta.' });
    router.push('/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingState(prev => ({ ...prev, [fieldName]: true }));

    try {
      const directory = 'site-content/images';
      const imageUrl = await uploadImage(file, directory);
      setValue(fieldName as any, imageUrl, { shouldValidate: true, shouldDirty: true });
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
    const inputId = `file-upload-${fieldName.replace(/\./g, '-')}`;

    return (
      <div className="relative flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="flex-shrink-0" disabled={isUploading}>
          <label htmlFor={inputId} className="cursor-pointer">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Trocar Imagem
          </label>
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          className="sr-only"
          onChange={(e) => handleFileUpload(e, fieldName)}
          disabled={isUploading}
        />
      </div>
    );
  };

 const onSubmit = async (data: z.infer<typeof adminSchema>) => {
    setIsSubmitting(true);
    try {
      await Promise.all([
        saveContent('generalContent', data.generalContent),
        saveContent('homePageContent', data.homePageContent),
        saveContent('aboutPageContent', data.aboutPageContent),
        saveContent('ourSpacePageContent', data.ourSpacePageContent),
        saveContent('plansPageContent', { plans: data.plansPageContent.plans }),
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
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
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
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <TabsContent value="general">
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
              </TabsContent>

              <TabsContent value="home">
                <Card>
                  <CardHeader>
                    <CardTitle>Página Home</CardTitle>
                    <CardDescription>Edite o conteúdo da página principal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <FieldArraySection
                      name="homePageContent.heroSlides"
                      title="Slides do Herói"
                      description="Adicione, remova ou edite os slides principais."
                      defaultItem={{ imageUrl: '', title: '', subtitle: '' }}
                      renderItem={(index: number) => (
                        <>
                          <FormField name={`homePageContent.heroSlides.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField name={`homePageContent.heroSlides.${index}.subtitle`} render={({ field }) => (
                            <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField name={`homePageContent.heroSlides.${index}.imageUrl`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL da Imagem</FormLabel>
                              <div className='flex items-center gap-2'>
                                <FormControl><Input {...field} /></FormControl>
                                {renderImagePreview(field.value)}
                                <FileUploadButton fieldName={`homePageContent.heroSlides.${index}.imageUrl`} />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </>
                      )}
                    />
                    <FieldGroup title="Seção 'Por Que Escolher-nos?'">
                      <FormField name="homePageContent.whyChooseUs.title" render={({ field }) => (
                        <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="homePageContent.whyChooseUs.description" render={({ field }) => (
                        <FormItem><FormLabel>Descrição Principal</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FieldArraySection
                        name="homePageContent.whyChooseUs.items"
                        title="Itens"
                        defaultItem={{ icon: 'Heart', title: '', description: '' }}
                        renderItem={(index: number) => (
                          <>
                            <FormField name={`homePageContent.whyChooseUs.items.${index}.icon`} render={({ field }) => (
                              <FormItem><FormLabel>Ícone (Nome do Lucide Icon)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name={`homePageContent.whyChooseUs.items.${index}.title`} render={({ field }) => (
                              <FormItem><FormLabel>Título do Item</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name={`homePageContent.whyChooseUs.items.${index}.description`} render={({ field }) => (
                              <FormItem><FormLabel>Descrição do Item</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup title="Seção 'Processo de Cremação'">
                      <FormField name="homePageContent.cremationProcess.title" render={({ field }) => (
                        <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="homePageContent.cremationProcess.description" render={({ field }) => (
                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FieldArraySection
                        name="homePageContent.cremationProcess.steps"
                        title="Passos"
                        defaultItem={{ step: '', title: '', description: '' }}
                        renderItem={(index: number) => (
                          <>
                            <FormField name={`homePageContent.cremationProcess.steps.${index}.step`} render={({ field }) => (
                              <FormItem><FormLabel>Passo (ex: 01)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name={`homePageContent.cremationProcess.steps.${index}.title`} render={({ field }) => (
                              <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name={`homePageContent.cremationProcess.steps.${index}.description`} render={({ field }) => (
                              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup title="Seção 'Acolhemos Todos os Pets'">
                      <FormField name="homePageContent.allPetsSection.title" render={({ field }) => (
                        <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="homePageContent.allPetsSection.description" render={({ field }) => (
                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="homePageContent.allPetsSection.imageUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem</FormLabel>
                          <div className='flex items-center gap-2'>
                            <FormControl><Input {...field} /></FormControl>
                            {renderImagePreview(field.value)}
                            <FileUploadButton fieldName="homePageContent.allPetsSection.imageUrl" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FieldArraySection
                        name="homePageContent.allPetsSection.petsList"
                        title="Lista de Pets"
                        defaultItem={""}
                        isSub
                        renderItem={(index: number) => (
                          <FormField name={`homePageContent.allPetsSection.petsList.${index}`} render={({ field }) => (
                            <FormItem><FormLabel>Nome do Pet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        )}
                      />
                    </FieldGroup>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader><CardTitle>Página Sobre</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField name="aboutPageContent.headerTitle" render={({ field }) => (
                      <FormItem><FormLabel>Título do Cabeçalho</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="aboutPageContent.headerDescription" render={({ field }) => (
                      <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="aboutPageContent.missionTitle" render={({ field }) => (
                      <FormItem><FormLabel>Título da Missão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="aboutPageContent.missionDescription" render={({ field }) => (
                      <FormItem><FormLabel>Descrição da Missão</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="aboutPageContent.missionImageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem da Missão</FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl><Input {...field} /></FormControl>
                          {renderImagePreview(field.value)}
                          <FileUploadButton fieldName="aboutPageContent.missionImageUrl" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="aboutPageContent.historyTitle" render={({ field }) => (
                      <FormItem><FormLabel>Título da História</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="aboutPageContent.historyDescription" render={({ field }) => (
                      <FormItem><FormLabel>Descrição da História</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="aboutPageContent.historyImageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem da História</FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl><Input {...field} /></FormControl>
                          {renderImagePreview(field.value)}
                          <FileUploadButton fieldName="aboutPageContent.historyImageUrl" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="our-space">
                <Card>
                  <CardHeader><CardTitle>Página Nosso Espaço</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField name="ourSpacePageContent.headerTitle" render={({ field }) => (
                      <FormItem><FormLabel>Título do Cabeçalho</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="ourSpacePageContent.headerDescription" render={({ field }) => (
                      <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FieldArraySection
                      name="ourSpacePageContent.gallery"
                      title="Galeria de Imagens"
                      defaultItem={{ id: `new-${Date.now()}`, title: '', imageUrl: '' }}
                      renderItem={(index: number) => (
                        <>
                          <FormField name={`ourSpacePageContent.gallery.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Título da Imagem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField name={`ourSpacePageContent.gallery.${index}.imageUrl`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL da Imagem</FormLabel>
                              <div className='flex items-center gap-2'>
                                <FormControl><Input {...field} /></FormControl>
                                {renderImagePreview(field.value)}
                                <FileUploadButton fieldName={`ourSpacePageContent.gallery.${index}.imageUrl`} />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plans">
                <Card>
                  <CardHeader><CardTitle>Página de Planos</CardTitle></CardHeader>
                  <CardContent>
                    <FieldArraySection
                      name="plansPageContent.plans"
                      title="Planos de Cremação"
                      defaultItem={{ name: '', price: '', description: '', features: [], isMostChosen: false }}
                      renderItem={(planIndex: number) => (
                        <>
                          <FormField name={`plansPageContent.plans.${planIndex}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField name={`plansPageContent.plans.${planIndex}.price`} render={({ field }) => (
                            <FormItem><FormLabel>Preço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField name={`plansPageContent.plans.${planIndex}.description`} render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField name={`plansPageContent.plans.${planIndex}.isMostChosen`} render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5"><FormLabel>É o mais escolhido?</FormLabel></div>
                              <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="form-checkbox h-5 w-5 text-primary" /></FormControl>
                            </FormItem>
                          )} />
                          <FieldArraySection
                            name={`plansPageContent.plans.${planIndex}.features`}
                            title="Características"
                            defaultItem={""}
                            isSub
                            renderItem={(featureIndex: number) => (
                              <FormField name={`plansPageContent.plans.${planIndex}.features.${featureIndex}`} render={({ field }) => (
                                <FormItem><FormLabel>Característica</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                            )}
                          />
                        </>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="memorial">
                <Card>
                  <CardHeader><CardTitle>Página do Memorial</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField name="memorialPageContent.heroImageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem do Herói</FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl><Input {...field} /></FormControl>
                          {renderImagePreview(field.value)}
                          <FileUploadButton fieldName="memorialPageContent.heroImageUrl" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="memorialPageContent.heroTitle" render={({ field }) => (
                      <FormItem><FormLabel>Título do Herói</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="memorialPageContent.heroDescription1" render={({ field }) => (
                      <FormItem><FormLabel>Descrição 1</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="memorialPageContent.heroDescription2" render={({ field }) => (
                      <FormItem><FormLabel>Descrição 2</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="memorialPageContent.createMemorialTitle" render={({ field }) => (
                      <FormItem><FormLabel>Título do Card "Criar Memorial"</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="memorialPageContent.createMemorialDescription" render={({ field }) => (
                      <FormItem><FormLabel>Descrição do Card "Criar Memorial"</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-6">
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Salvar Alterações
                  </Button>
              </div>

            </form>
          </Tabs>
        </div>
      </div>
    </FormProvider>
  );
};

const FieldGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-4 rounded-lg border p-4">
    <h4 className="font-semibold text-lg">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const FieldArraySection = ({ name, title, description, renderItem, defaultItem, isSub = false }: any) => {
  const { control } = useFormContext(); // Correctly use context from parent FormProvider
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

