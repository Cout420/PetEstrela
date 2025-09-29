
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getContent, saveContent, uploadFile } from '@/lib/firebase-service';
import { homePageContent as initialHomePageContent } from '@/lib/home-content';
import { aboutPageContent as initialAboutContent } from '@/lib/about-content';
import { memorialPageContent as initialMemorialContent } from '@/lib/memorial-content';
import { ourSpaceContent as initialOurSpaceContent } from '@/lib/our-space-content';
import { plans as initialPlans } from '@/lib/mock-data';
import { Loader2, PlusCircle, Trash2, Upload, Paperclip } from 'lucide-react';
import { getAdminApp } from '@/lib/firebase-admin';
import { Progress } from '@/components/ui/progress';

// --- Image Upload Component ---
const ImageUploadField = ({ name }: { name: string }) => {
  const { control, setValue } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const downloadURL = await uploadFile(file, 'site-content/');
      
      clearInterval(progressInterval);
      setProgress(100);
      setValue(name, downloadURL, { shouldValidate: true });
      
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1000)
    }
  };

  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{name.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
            <div className="flex items-center gap-2">
              <Input {...field} placeholder="https://..." />
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
             <FormMessage />
          </FormItem>
        )}
      />
      {uploading && <Progress value={progress} className="w-full h-2" />}
    </div>
  );
};


// --- Zod Schemas ---
const heroSlideSchema = z.object({
  imageUrl: z.string().url('URL inválida'),
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string(),
});

const whyChooseUsItemSchema = z.object({
  icon: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string(),
});

const processStepSchema = z.object({
  step: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string(),
});

const allPetsSectionSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string(),
  imageUrl: z.string().url('URL inválida'),
  petsList: z.array(z.string()),
});

const homeContentSchema = z.object({
  heroSlides: z.array(heroSlideSchema),
  whyChooseUs: z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(whyChooseUsItemSchema),
  }),
  cremationProcess: z.object({
    title: z.string(),
    description: z.string(),
    steps: z.array(processStepSchema),
  }),
  allPetsSection: allPetsSectionSchema,
});

const aboutContentSchema = z.object({
  headerTitle: z.string(),
  headerDescription: z.string(),
  missionTitle: z.string(),
  missionDescription: z.string(),
  missionImageUrl: z.string().url('URL inválida'),
  historyTitle: z.string(),
  historyDescription: z.string(),
  historyImageUrl: z.string().url('URL inválida'),
});

const memorialContentSchema = z.object({
  heroImageUrl: z.string().url('URL inválida'),
  heroTitle: z.string(),
  heroDescription1: z.string(),
  heroDescription2: z.string(),
  createMemorialTitle: z.string(),
  createMemorialDescription: z.string(),
});

const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().url('URL inválida'),
});

const ourSpaceContentSchema = z.object({
  headerTitle: z.string(),
  headerDescription: z.string(),
  gallery: z.array(galleryItemSchema),
});

const planSchema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  pricingDetails: z.array(z.string()).optional(),
  optional: z.string().optional(),
  isMostChosen: z.boolean(),
});

const plansContentSchema = z.object({
  plans: z.array(planSchema),
});

const generalContentSchema = z.object({
  whatsappLink: z.string().url(),
  whatsappNumber: z.string(),
  phone: z.string(),
  address: z.string(),
  instagramLink: z.string().url(),
});

type CombinedSchemaType = z.infer<typeof homeContentSchema> &
  z.infer<typeof aboutContentSchema> &
  z.infer<typeof memorialContentSchema> &
  z.infer<typeof ourSpaceContentSchema> &
  z.infer<typeof plansContentSchema> &
  z.infer<typeof generalContentSchema>;


const AdminPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const form = useForm({
    // We will set the resolver dynamically
    defaultValues: {
      ...initialHomePageContent,
      ...initialAboutContent,
      ...initialMemorialContent,
      ...initialOurSpaceContent,
      plans: initialPlans,
      whatsappLink: 'https://wa.me/551142405253',
      whatsappNumber: '1142405253',
      phone: '(11) 4240-5253',
      address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
      instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
    },
  });

  const { fields: heroSlidesFields, append: appendHeroSlide, remove: removeHeroSlide } = useFieldArray({ control: form.control, name: 'heroSlides' });
  const { fields: whyChooseUsItemsFields, append: appendWhyChooseUsItem, remove: removeWhyChooseUsItem } = useFieldArray({ control: form.control, name: 'whyChooseUs.items' });
  const { fields: processStepsFields, append: appendProcessStep, remove: removeProcessStep } = useFieldArray({ control: form.control, name: 'cremationProcess.steps' });
  const { fields: galleryItemsFields, append: appendGalleryItem, remove: removeGalleryItem } = useFieldArray({ control: form.control, name: 'gallery' });
  const { fields: plansFields, append: appendPlan, remove: removePlan } = useFieldArray({ control: form.control, name: 'plans' });

  const schemaMap = {
    home: homeContentSchema,
    about: aboutContentSchema,
    memorial: memorialContentSchema,
    ourSpace: ourSpaceContentSchema,
    plans: plansContentSchema,
    general: generalContentSchema,
  };
  
  type SchemaMapKeys = keyof typeof schemaMap;

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const [homeData, aboutData, memorialData, ourSpaceData, plansData, generalData] = await Promise.all([
          getContent('homePageContent'),
          getContent('aboutPageContent'),
          getContent('memorialPageContent'),
          getContent('ourSpaceContent'),
          getContent('plansPageContent'),
          getContent('generalContent'),
        ]);

        form.reset({
          ...initialHomePageContent,
          ...(homeData as any),
          ...initialAboutContent,
          ...(aboutData as any),
          ...initialMemorialContent,
          ...(memorialData as any),
          ...initialOurSpaceContent,
          ...(ourSpaceData as any),
          plans: (plansData as any)?.plans || initialPlans,
          whatsappLink: (generalData as any)?.whatsappLink || '',
          whatsappNumber: (generalData as any)?.whatsappNumber || '',
          phone: (generalData as any)?.phone || '',
          address: (generalData as any)?.address || '',
          instagramLink: (generalData as any)?.instagramLink || '',
        });

      } catch (error) {
        toast({ title: 'Erro ao carregar conteúdo', description: (error as Error).message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [form, toast]);


  const onSubmit = async (data: any) => {
    try {
        const currentSchema = schemaMap[activeTab as SchemaMapKeys];
        const contentIdMap = {
            home: 'homePageContent',
            about: 'aboutPageContent',
            memorial: 'memorialPageContent',
            ourSpace: 'ourSpaceContent',
            plans: 'plansPageContent',
            general: 'generalContent',
        };
        const contentId = contentIdMap[activeTab as SchemaMapKeys];
        
        // Extract only the fields relevant to the current tab
        const fieldsForCurrentTab = Object.keys(currentSchema.shape);
        const dataToSave: { [key: string]: any } = {};

        if (activeTab === 'plans') {
            dataToSave['plans'] = data.plans;
        } else {
            fieldsForCurrentTab.forEach(field => {
                if (data[field] !== undefined) {
                    dataToSave[field] = data[field];
                }
            });
        }

        await saveContent(contentId, dataToSave);

        toast({ title: 'Sucesso!', description: `Conteúdo da aba '${activeTab}' salvo com sucesso.` });
    } catch (error) {
        toast({ title: 'Erro ao salvar', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const renderArrayField = (
    title: string,
    fieldArray: any,
    appendFn: (value: any) => void,
    removeFn: (index: number) => void,
    fieldSchema: any,
    namePrefix: string
    ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldArray.map((field: any, index: number) => (
          <Card key={field.id} className="p-4">
            <div className="space-y-2">
              {Object.keys(fieldSchema).map(key => {
                 if (key === 'imageUrl') {
                   return <ImageUploadField key={key} name={`${namePrefix}.${index}.${key}`} />;
                 }
                 if (key !== 'isMostChosen') {
                    return (
                        <FormField
                        key={key}
                        control={form.control}
                        name={`${namePrefix}.${index}.${key}`}
                        render={({ field: formField }) => (
                            <FormItem>
                            <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                            <FormControl>
                                {Array.isArray(formField.value) ? (
                                    <Textarea {...formField} value={formField.value.join('\n')} onChange={e => formField.onChange(e.target.value.split('\n'))} />
                                ) : (
                                    <Input {...formField} />
                                )}
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )
                 }
                 return null;
              })}
               {fieldSchema.isMostChosen !== undefined && (
                 <FormField
                  control={form.control}
                  name={`${namePrefix}.${index}.isMostChosen`}
                  render={({ field: formField }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>É o mais escolhido?</FormLabel>
                      <FormControl>
                        <Input type="checkbox" checked={formField.value} onChange={formField.onChange} className="h-4 w-4" />
                      </FormControl>
                    </FormItem>
                  )}
                />
               )}

            </div>
            <Button variant="destructive" size="sm" onClick={() => removeFn(index)} className="mt-2">
              <Trash2 className="mr-2 h-4 w-4" /> Remover
            </Button>
          </Card>
        ))}
        <Button onClick={() => appendFn(
            Object.keys(fieldSchema).reduce((acc, key) => ({...acc, [key]: Array.isArray(fieldSchema[key]) ? [] : ''}), {})
        )}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Gerenciador de Conteúdo do Site</h1>
      <p className="text-muted-foreground">Edite o conteúdo das páginas do seu site.</p>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="about">Sobre Nós</TabsTrigger>
                <TabsTrigger value="memorial">Memorial</TabsTrigger>
                <TabsTrigger value="ourSpace">Nosso Espaço</TabsTrigger>
                <TabsTrigger value="plans">Planos</TabsTrigger>
                <TabsTrigger value="general">Geral</TabsTrigger>
              </TabsList>
              
              <TabsContent value="home" className="space-y-6">
                 {renderArrayField('Slides do Herói', heroSlidesFields, appendHeroSlide, removeHeroSlide, heroSlideSchema.shape, 'heroSlides')}
                 <Card>
                    <CardHeader><CardTitle>Seção "Todos os Pets"</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="allPetsSection.title" render={({ field }) => <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="allPetsSection.description" render={({ field }) => <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                        <ImageUploadField name="allPetsSection.imageUrl" />
                    </CardContent>
                 </Card>
                 {renderArrayField('Itens "Por Que Escolher-nos?"', whyChooseUsItemsFields, appendWhyChooseUsItem, removeWhyChooseUsItem, whyChooseUsItemSchema.shape, 'whyChooseUs.items')}
                 {renderArrayField('Passos do Processo', processStepsFields, appendProcessStep, removeProcessStep, processStepSchema.shape, 'cremationProcess.steps')}
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card><CardHeader><CardTitle>Conteúdo "Sobre Nós"</CardTitle></CardHeader><CardContent className="space-y-4">
                  <FormField control={form.control} name="headerTitle" render={({ field }) => <FormItem><FormLabel>Título do Cabeçalho</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                  <FormField control={form.control} name="headerDescription" render={({ field }) => <FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                  <FormField control={form.control} name="missionTitle" render={({ field }) => <FormItem><FormLabel>Título da Missão</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                  <FormField control={form.control} name="missionDescription" render={({ field }) => <FormItem><FormLabel>Descrição da Missão</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                  <ImageUploadField name="missionImageUrl" />
                  <FormField control={form.control} name="historyTitle" render={({ field }) => <FormItem><FormLabel>Título da História</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                  <FormField control={form.control} name="historyDescription" render={({ field }) => <FormItem><FormLabel>Descrição da História</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                  <ImageUploadField name="historyImageUrl" />
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="memorial" className="space-y-6">
                <Card><CardHeader><CardTitle>Conteúdo da Página Memorial</CardTitle></CardHeader><CardContent className="space-y-4">
                   <ImageUploadField name="heroImageUrl" />
                   <FormField control={form.control} name="heroTitle" render={({ field }) => <FormItem><FormLabel>Título do Herói</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="heroDescription1" render={({ field }) => <FormItem><FormLabel>Descrição do Herói (Parágrafo 1)</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="heroDescription2" render={({ field }) => <FormItem><FormLabel>Descrição do Herói (Parágrafo 2)</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="createMemorialTitle" render={({ field }) => <FormItem><FormLabel>Título do Card "Criar Memorial"</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="createMemorialDescription" render={({ field }) => <FormItem><FormLabel>Descrição do Card "Criar Memorial"</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                </CardContent></Card>
              </TabsContent>

               <TabsContent value="ourSpace" className="space-y-6">
                 {renderArrayField('Itens da Galeria "Nosso Espaço"', galleryItemsFields, appendGalleryItem, removeGalleryItem, galleryItemSchema.shape, 'gallery')}
              </TabsContent>

              <TabsContent value="plans" className="space-y-6">
                  {renderArrayField('Planos', plansFields, appendPlan, removePlan, planSchema.shape, 'plans')}
              </TabsContent>
              
              <TabsContent value="general" className="space-y-6">
                 <Card><CardHeader><CardTitle>Configurações Gerais</CardTitle></CardHeader><CardContent className="space-y-4">
                   <FormField control={form.control} name="whatsappLink" render={({ field }) => <FormItem><FormLabel>Link do WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="whatsappNumber" render={({ field }) => <FormItem><FormLabel>Número do WhatsApp (texto)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Telefone (texto)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Endereço</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                   <FormField control={form.control} name="instagramLink" render={({ field }) => <FormItem><FormLabel>Link do Instagram</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                </CardContent></Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Conteúdo da Aba
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default AdminPage;

    